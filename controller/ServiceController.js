const database = require('../model/db');
const tableName = 'service';
const mappingTableName = 'sub_service_mapping';
const {clearImage} = require('../util/helpers');


exports.getAllServiceOption = (request, response, next) => {

    database.query('select id, name as text from ?? where status=1 and isSubService=0 and activeStatus=1', [tableName])
        .then(services => {
            response.status(200).json({
                results: [{id: -1, text: "", selected: true, disabled: true}, ...services]
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getAllSubServicesOption = (request, response, next) => {

    let serviceId = request.params.serviceId;
    database.query(`select id, name as text from ${tableName} 
                    where id in (select subcategoryId from ${mappingTableName} where serviceId=${serviceId}) 
                    and activeStatus=1 and status=1`)
        .then(categories => {
            response.status(200).json({
                results: [{id: -1, text: "", selected: true, disabled: true}, ...categories]
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getAllServicesTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    database.findAllCount(tableName, {
        activeStatus: 1
    }).then(totalCount => {
        database.dataTableSource(tableName, ["id", "name", "description", "photo", "status", "createdAt"]
            , {activeStatus: 1}, 'createdAt', 'name', search, 'desc',
            parseInt(start), parseInt(length)).then(result => {
            return response.status(200).json({
                draw: parseInt(draw),
                recordsTotal: totalCount,
                recordsFiltered: result.length,
                data: result
            });
        });
    }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getAllServices = (request, response, next) => {

    database.select(tableName, {status: 1, isSubService: 0}, ["id", "name", "description", "photo","sequenceNumber"])
        .then(services => {
            if (services.length > 0) {
                return response.status(200).json(services.sort((a,b)=>a.sequenceNumber-b.sequenceNumber));
            } else {
                let error = new Error("Service Not Found");
                error.statusCode = 404;
                throw error;
            }
        }).catch(error => {
        next(error)
    })
}

exports.saveServiceSubServices = async (request, response, next) => {

    let {name, description, status, chkIsSubService, updateServiceId, service_id} = request.body;

    let categoriesPhotos = null;
    if (request.files && request.files.serviceImage) {
        categoriesPhotos = request.files.serviceImage[0].path;
    }


    try {
        // Connection.transaction(async (trans) => {
        let object = {
            name: name,
            description: description,
            photo: categoriesPhotos,
            isSubService: chkIsSubService === "on" ? 1 : 0,
            status: status,
        };

        if (parseInt(updateServiceId) !== 0) {
            const existingServiceObject = await database.query(`select *,(select serviceId from sub_service_mapping where subcategoryId =s.id) as serviceID from service s where id = ${updateServiceId}`);

            if (existingServiceObject.length !== 0) {
                let error = new Error("Not Found Service");
                error.statusCode = 404;
            }
            const connection = await database.transaction()
            if (!connection) {
                let error = new Error("no connection found");
                error.statusCode = 500;
                throw error
            }
            await connection.beginTransaction();
            if (existingServiceObject[0].isSubService === 1) {
                let [deleteResult,error] = await connection.query(`delete from ${mappingTableName} where subcategoryId =${existingServiceObject[0].id}`);
                if (error) {
                    await connection.rollback();
                    let error = new Error("Failed to update");
                    error.statusCode = 500;
                    throw error
                }

            }
            object.updatedAt = database.currentTimeStamp();
            let [updateResult,updateError] = await connection.query('update ?? set ? where ? ', [tableName, object, {id: updateServiceId}]);

            if (updateError) {
                await connection.rollback();
                connection.release();
                throw new Error("Failed To updated");
            }

            if (chkIsSubService === "on") {
                await connection.query("insert into ?? set ?", [mappingTableName,
                    {serviceId: service_id, subcategoryId: updateServiceId}])
            }
            await connection.commit();
            connection.release()
            response.status(200).json({
                body: "Update Service Successfully"
            })
        } else {
            const connection = await database.transaction();
            if (!connection) {
                let error = new Error("no connection found");
                error.statusCode = 500;
                throw error
            }
            await connection.beginTransaction();
            object.createdAt = database.currentTimeStamp();
            const [results, error] = await connection.query("insert into ?? set ?", [tableName, object]);
            if (error) {
                await connection.rollback();
                let error = new Error("Failed To Create Service");
                error.statusCode = 500;
                throw error
            }
            if (chkIsSubService === "on") {
                const [mapError] = await connection.query("insert into ?? set ?",[mappingTableName, {
                    serviceId: service_id,
                    subcategoryId: results.insertId
                }])
                if (!mapError) {
                    await connection.rollback();
                    let error = new Error("Failed To mapping services");
                    error.statusCode = 500;
                    throw error
                }
            }
            await connection.commit();
            connection.release()
            response.status(200).json({
                body: "Create Service Successfully"
            })
        }
    }catch (e) {
        next(e);
    }
}

exports.getServiceById = (request, response, next) => {

    let {serviceId} = request.body;
    database.query(`select id,name,description,isSubService,status,photo,sequenceNumber,
       (select serviceId from sub_service_mapping where subcategoryId=s.id) as serviceID from ?? s where id=?`,[tableName,serviceId])
        .then(service => {
            if (service.length > 0) {
                response.status(200).json(service[0])
            } else {
                let error = new Error("Service Not Found");
                error.statusCode = 404;
                throw error;
            }
        }).catch(error => {
        next(error);
    })
}

exports.deleteService = (request, response, next) => {
    let {serviceId} = request.body;
    database.select(tableName,{id:serviceId}).then(service=>{
        if(service.length===0){
            let error = new Error("Service Not Found");
            error.status = 404;
            throw  error;
        }
        if(service[0].photo){
            clearImage(service[0].photo);
        }
        return database.update(tableName,{activeStatus:0},{id:serviceId})
    })
    .then(results => {
        if (!results.status) {
            throw new Error("Failed to delete Service");
        }
        return response.status(200).json({
            body: "Successfully delete Service"
        })
    }).catch(error => {
        next(error);
    })
}

exports.updateServiceStatus = (request, response, next) => {
    let {categoryId, status} = request.body;
    Connection.transaction(async (trans) => {
        return Service.findByPk(categoryId).then(Service => {
            if (!Service) {
                let error = new Error("User Not Found");
                error.status = 404;
                throw  error;
            }
            Service.status = status;
            return Service.save({transaction: trans});
        }).catch(error => {
            throw error
        })
    }).then(count => {
        if (!count) {
            throw new Error("Failed to delete user");
        }
        return response.status(200).json({
            body: "Successfully delete user"
        })
    }).catch(error => {
        next(error);
    })

}

exports.sequenceUpdate = (request, response, next) => {
    let services =JSON.parse(request.body.services);
    let servicesObject = services.map((service,index)=>[service,index]);

    database.query(`INSERT INTO ?? (id, sequenceNumber)
                    VALUES ?
                    ON DUPLICATE KEY
    UPDATE sequenceNumber =
    VALUES (sequenceNumber)`, [tableName, servicesObject])
        .then(results => {
            if (!results) {
                let error = new Error("Failed to update")
                error.statusCode = 401;
                throw  error;
            }
            return response.status(200).json({
                message: "Save service sequence"
            })
        })
        .catch(error => {
            next(error);
        })
}
