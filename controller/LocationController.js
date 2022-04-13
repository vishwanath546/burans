const {Connection} = require('../model/Database');
const {Op} = require('sequelize');
const {Location} = require('../model/Location')

exports.saveLocation = (request,response,next)=>{
    let {name,status, updateLocationId} = request.body;

    Connection.transaction(async (trans) => {

        if(!updateLocationId){
            return await Location.create({
                name: name,
                status:status
            }, {transaction: trans});
        }else{
            return await Location.update({name:name,status:status},{where:{id:updateLocationId}},{transaction: trans})
        }

    }).then(() => {
        response.status(200).json({
            status: 200,
            body: "save changes",
        });
    }).catch(error => {
        next(error)
    });
}

exports.getAllLocationTables = (request,response,next)=>{
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    Location.findAndCountAll({
        attributes: ["id", "name", "status", "createdAt"],
        where: search ? {name: {[Op.like]: "%" + search + "%"}} : {},
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

exports.getAllLocationOption = (request,response,next)=>{
    Location.findAll({
        where: {status: 1},
        attributes: ["id", ["name", "text"]]
    })
        .then(locations => {
            response.status(200).json({
                results: [{id: -1, text: "", selected: true, disabled: true}, ...locations]
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getLocationById = (request,response,next)=>{
    let {locationId} = request.body;
    Location.findByPk(locationId, {
            exclude: ["createdAt", "updatedAt"]
    })
        .then(async location => {
            if (location) {
                response.status(200).json(location)
            } else {
                let error = new Error("Location Not Found");
                error.statusCode = 404;
                throw error;
            }
        }).catch(error => {
        next(error);
    })
}
exports.deleteLocation = (request,response,next)=>{
    let {locationId} = request.body;
    Location.findByPk(locationId).then(location => {
        if (!location) {
            let error = new Error("Location Not Found");
            error.status = 404;
            throw  error;
        }
        return location.destroy();
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
