const {Connection} = require('../model/Database');
const {Op} = require('sequelize');
const {Service} = require('../model/Service')
const {SubServiceMapping} = require('../model/SubserviceMapping')
const {clearImage} = require('../util/helpers');


exports.getAllServiceOption = (request, response, next) => {

    Service.findAll({
        where: {status: 1, isSubService: 0},
        attributes: ["id", ["name", "text"]]
    })
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
    Service.findAll({
        where: {categoryId: serviceId},
        attributes: ["id", ["name", "text"]]
    })
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

    Service.findAndCountAll({
        attributes: ["id", "name", "description", "photo", "status", "createdAt"],
        where: search ? {name: {[Op.like]: "%" + search + "%"}} : {},
        include: [
            {model: Service, as: 'SubService'}
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(length) || 10,
        offset: parseInt(start) || 0
    })
        .then(({total, rows}) => {
            response.status(200).json({
                draw: parseInt(draw),
                recordsTotal: total,
                recordsFiltered: rows.length,
                data: rows
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })

}

exports.getAllServices = (request, response, next) => {

    Service.findAll({
        where: {status: 1, isSubService: 0},
        include: [{model: Service, as: 'SubService'}],
        attributes: ["id", "name", "description", "photo"]
    }).then(services => {
        if (services) {
            let allServices = services.map(async (Service) => {
                return {
                    Service: Service,
                }
            })
            Promise.all(allServices).then(res => {
                return response.status(200).json(res);
            }).catch(error => {
                next(error)
            });

        } else {
            let error = new Error("Service Not Found");
            error.statusCode = 404;
            throw error;
        }
    }).catch(error => {
        next(error)
    })
}

exports.saveServiceSubServices = (request, response, next) => {

    let {name, description, status, chkIsSubService, updateServiceId, service_id} = request.body;

    let categoriesPhotos = null;
    if (request.files && request.files.serviceImage) {
        categoriesPhotos = request.files.serviceImage[0].path;
    }


    Connection.transaction(async (trans) => {
        let object = {
            name: name,
            description: description,
            photo: categoriesPhotos,
            isSubService: chkIsSubService === "on" ? 1 : 0,
            status: status,
        };
        return Service.findByPk(service_id).then(async service => {
            if (parseInt(updateServiceId)!==0) {
                // update
                console.log("new Service mapping id ",Service.id) // 1
                // update existing Service in Service table
                await Service.update(object,{where:{id:updateServiceId}});

                // find new updated Service object
                Service.findByPk(updateServiceId,{
                    attributes: {
                        include: [[Connection.literal(`(
                    SELECT serviceId
                    FROM sub_service_mapping AS ser
                    WHERE
                        ser.subcategoryId = Service.id                        
                )`),
                            'service_id'],
                        ],
                        exclude: ["createdAt", "updatedAt"]
                    }
                }).then((newUpdateObject)=>{
                    // get existing Service with subcategory id
                    console.log('existing subcategory id',newUpdateObject.dataValues.service_id) // 2
                    if(!newUpdateObject){
                        let error = new Error("Service Not Found");
                        error.status = 404;
                        throw  error;
                    }
                    if(Service){
                        if(newUpdateObject.dataValues.service_id){
                            // find old subcategory object from Service by id
                            Service.findByPk(newUpdateObject.dataValues.service_id).
                            then(async removeObject=>{
                                if(!removeObject){
                                    let error = new Error("Service Not Found");
                                    error.status = 404;
                                    throw  error;
                                }
                                Service.removeSubServices(newUpdateObject.getSubService());
                                Service.setSubService(newUpdateObject);
                            })

                        }else{
                            Service.addSubService(newUpdateObject);
                        }
                    }else{
                        if(newUpdateObject.subservice.length>0){
                            Service.removeSubService(newUpdateObject.subservice[0]);
                        }else{
                            Service.addSubService(newUpdateObject);
                        }
                    }
                })

            } else {
                // create new
                console.log(object)
                let newService = await Service.create(object, {transaction: trans});
                if (service) {
                    service.addSubService(newService);
                }

            }
        })

    }).then(() => {
        response.status(200).json({
            body: "Create Service Successfully"
        })
    }).catch(error => {
        next(error)
    })
}

exports.getServiceById = (request, response, next) => {

    let {serviceId} = request.body;
    Service.findByPk(serviceId, {
        attributes: {
            include: [[Connection.literal(`(
                    SELECT serviceId
                    FROM sub_service_mapping AS cat
                    WHERE
                        cat.SubServiceId = Service.id                        
                )`),
                'category_id'],
            ],
            exclude: ["createdAt", "updatedAt"]
        }
    })
        .then(async service => {
            if (service) {
                response.status(200).json(service)
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
    Service.findByPk(serviceId).then(Service => {
        if (!Service) {
            let error = new Error("Service Not Found");
            error.status = 404;
            throw  error;
        }
        clearImage(Service.photo);
        return Service.destroy();
    }).then(count => {
        if (!count) {
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

