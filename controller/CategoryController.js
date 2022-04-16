const {Connection} = require('../model/Database');
const {Op,QueryTypes} = require('sequelize');
const {Category} = require('../model/Category')
const {SubcategoryMapping} = require('../model/SubcategoryMapping')
const {clearImage} = require('../util/helpers');


exports.getAllCategoriesOption = (request, response, next) => {

    Category.findAll({
        where: {status: 1, isSubcategory: 0},
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

exports.getAllSubcategoriesOption = (request, response, next) => {

    let categoryId = request.params.categoryId;
    Connection.query("select id,name as text from category where id in " +
         "(select subcategoryId from subcategory_mapping where CategoryId="+categoryId+")",
        { type: QueryTypes.SELECT })

        .then((results) => {
            response.status(200).json({
                results: [{id: -1, text: "", selected: true, disabled: true}, ...results]
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    });
}

exports.getAllCategoriesTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    Category.findAndCountAll({
        attributes: ["id", "name", "description", "photo", "status", "createdAt"],
        where: search ? {name: {[Op.like]: "%" + search + "%"}} : {},
        include: [
            {model: Category, as: 'subcategory'}
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

exports.getAllCategories = (request, response, next) => {

    Category.findAll({
        where: {status: 1, isSubcategory: 0},
        include: [{model: Category, as: 'subcategory'}],
        attributes: ["id", "name", "description", "photo", "isService"]
    }).then(categories => {
        if (categories) {
            let allCategories = categories.map(async (category) => {
                return {
                    category: category,
                }
            })
            Promise.all(allCategories).then(res => {
                return response.status(200).json(res);
            }).catch(error => {
                next(error)
            });

        } else {
            let error = new Error("Category Not Found");
            error.statusCode = 404;
            throw error;
        }
    }).catch(error => {
        next(error)
    })
}

exports.saveCategorySubcategory = (request, response, next) => {

    let {name, description, isService, status, chkIsSubcategory, updateCategoryId, category_id} = request.body;

    let categoriesPhotos = null;
    if (request.files && request.files.categoryImage) {
        categoriesPhotos = request.files.categoryImage[0].path;
    }

    Connection.transaction(async (trans) => {
        let object = {
            name: name,
            description: description,
            photo: categoriesPhotos,
            isSubcategory: chkIsSubcategory === "on" ? 1 : 0,
            isService: isService === "on" ? 1 : 0,
            status: status,
        };
        return Category.findByPk(category_id,{
            include:[{model:Category, as :'subcategory'}]
        }).then(async category => {
            if (parseInt(updateCategoryId)!==0) {
                // update
                console.log("new category mapping id ",category.id) // 1
                // update existing category in category table
                // await Category.update(object,{where:{id:updateCategoryId}});

                // find new updated category object
                    Category.findByPk(updateCategoryId,{
                       include:[{model:Category, as :'subcategory'}]
                    }).then( async (newUpdateObject)=>{
                        // get existing category with subcategory id
                        // console.log(newUpdateObject) // 2
                        if(!newUpdateObject){
                            let error = new Error("Category Not Found");
                            error.status = 404;
                            throw  error;
                        }
                        if(category){
                            category.setSubcategory([newUpdateObject]);
                            await newUpdateObject.update(object,{include: {all: true, nested:true}});
                        }else{
                            if(newUpdateObject.subcategory.length>0){
                                category.removeSubcategory(newUpdateObject.subcategory[0]);
                            }else{
                                category.addSubcategory(newUpdateObject);
                            }
                        }
                    })


            } else {
                // create new

                let newCategory = await Category.create(object, {transaction: trans});
                if (category) {
                    category.addSubcategory(newCategory);
                }

            }
        })

    }).then(() => {
        response.status(200).json({
            body: "Create Category Successfully"
        })
    }).catch(error => {
        next(error)
    })
}

exports.getCategoryById = (request, response, next) => {

    let {categoryId} = request.body;
    Category.findByPk(categoryId, {
        attributes: {
            include: [[Connection.literal(`(
                    SELECT categoryId
                    FROM subcategory_mapping AS cat
                    WHERE
                        cat.subcategoryId = Category.id                        
                )`),
                'category_id'],
            ],
            exclude: ["createdAt", "updatedAt"]
        }
    })
        .then(async category => {
            if (category) {
                response.status(200).json(category)
            } else {
                let error = new Error("Category Not Found");
                error.statusCode = 404;
                throw error;
            }
        }).catch(error => {
        next(error);
    })
}

exports.deleteCategory = (request, response, next) => {
    let {categoryId} = request.body;
    Category.findByPk(categoryId).then(category => {
        if (!category) {
            let error = new Error("User Not Found");
            error.status = 404;
            throw  error;
        }
        clearImage(category.photo);
        return category.destroy();
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

exports.updateCategoryStatus = (request, response, next) => {
    let {categoryId, status} = request.body;
    Connection.transaction(async (trans) => {
        return Category.findByPk(categoryId).then(category => {
            if (!category) {
                let error = new Error("User Not Found");
                error.status = 404;
                throw  error;
            }
            category.status = status;
            return category.save({transaction: trans});
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

