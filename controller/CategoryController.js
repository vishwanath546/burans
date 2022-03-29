const {Connection} = require('../model/Database');
const {Op} = require('sequelize');
const {Category} = require('../model/Category')
const {clearImage} = require('../util/helpers');


exports.getAllCategoriesOption = (request, response, next) => {

    Category.findAll({
        where: {categoryId: null},
        attributes: ["id", ["name", "text"]]
    })
        .then(categories => {
            response.status(200).json({
                results: categories
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getAllSubcategoriesOption = (request, response, next) => {

    let categoryId=request.params.categoryId;
    Category.findAll({
        where: {categoryId: categoryId},
        attributes: ["id", ["name", "text"]]
    })
        .then(categories => {
            response.status(200).json({
                results: categories
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getAllCategoriesTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];
    Category.count().then(totalCount => {
        Category.findAll({
            attributes: ["id", "name", "description", "photo", "status", "categoryId", "createdAt"],
            where: search ? {name: {[Op.like]: "%" + search + "%"}} : {},
            order: [["createdAt", "DESC"]],
            limit: parseInt(length) || 10,
            offset: parseInt(start) || 0
        })
            .then((categories) => {
                response.status(200).json({
                    draw: parseInt(draw),
                    recordsTotal: totalCount,
                    recordsFiltered: categories.length,
                    data: categories
                });
            }).catch(error => {
            response.status(500).json({
                body: error.message
            })
        })
    }).catch(error => {
        response.status(400).json({
            body: "Not Found",
            exception: error
        });
    })
}

exports.getAllCategories = (request, response, next) => {

    Category.findAll({
        where: {status: 1, categoryId: null},
        attributes: ["id", "name", "description", "photo", "categoryId"]
    }).then(categories => {

        if (categories) {
            console.log(categories.toString())
            let allCategories = categories.map(async (category) => {
                return {
                    category: category,
                    subCategories: await Category.findAll({
                        where: {status: 1, categoryId: category.id},
                        attributes: ["id", "name", "description", "photo", "categoryId"]
                    })
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

    let {name, description, status, category_id} = request.body;

    let categoriesPhotos = null;
    if (request.files) {
        categoriesPhotos = request.files.categoryImage[0].path;
    }

    Connection.transaction(async (trans) => {
        return Category.findByPk(category_id).then(async category => {
            let newCategory = await Category.create({
                name: name,
                description: description,
                photo: categoriesPhotos,
                status: status
            }, {transaction: trans})
            if (category) {
                Category.update({categoryId: category_id}, {
                    where: {id: newCategory.id}
                }, {transaction: trans})
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
        attributes: ["id", "name", "description", "photo", "categoryId"]
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

