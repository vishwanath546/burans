const database = require('../model/db');
const tableName = 'location';
exports.saveLocation = (request, response, next) => {
    let {name, status, updateLocationId} = request.body;
    if (!updateLocationId) {
        return database.insert(tableName, {
            name: name,
            status: status,
            createdAt:database.currentTimeStamp()
        }).then(result => {
            if(!result.status) throw result.error
            return response.status(200).json({
                status: 200,
                body: "save changes",
            });
        })
    } else {
        return database.update(tableName, {name: name, status: status,updatedAt:database.currentTimeStamp()}, {id: updateLocationId}).then(result => {
            if(!result.status) throw result.error
            return response.status(200).json({
                status: 200,
                body: "save changes",
            });
        }).catch(error => {
            next(error)
        })
    }
}

exports.getAllLocationTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    database.findAllCount(tableName,{active_status:1}).then(totalCount => {
        database.dataTableSource(tableName, ["id", "name", "status", "createdAt"], {active_status:1},
            'createdAt', 'name', search, "desc", parseInt(start), parseInt(length)).then(result => {
            return response.status(200).json({
                draw: parseInt(draw),
                recordsTotal: totalCount,
                recordsFiltered: result.length,
                data: result
            });
        })
    })
        .catch(error => {
            response.status(500).json({
                body: error.message
            })
        })
}

exports.getAllLocationOption = (request, response, next) => {
    database.query(`select id, name as text from ?? where active_status=1 and status=1`,[tableName])
        .then(locations => {
            response.status(200).json({
                results: [{id: -1, text: "",  disabled: true}, ...locations]
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getLocationById = (request, response, next) => {
    let {locationId} = request.body;
    database.select(tableName, {
      id:locationId
    },["id","name","status"])
        .then(async location => {
            if (location.length >0) {
                response.status(200).json(location[0])
            } else {
                let error = new Error("Location Not Found");
                error.statusCode = 404;
                throw error;
            }
        }).catch(error => {
        next(error);
    })
}
exports.deleteLocation = (request, response, next) => {
    let {locationId} = request.body;
    database.update(tableName,{deletedAt:database.currentTimeStamp(),active_status:0},{id:locationId})
        .then(location => {
        if (!location.status) {
            let error = new Error("Location Not Found");
            error.status = 404;
            throw  error;
        }
        return location.affectedRows;
    }).then(count => {
        if (!count) {
            throw new Error("Failed to delete Location");
        }
        return response.status(200).json({
            body: "Successfully delete Location"
        })
    }).catch(error => {
        next(error);
    })
}
