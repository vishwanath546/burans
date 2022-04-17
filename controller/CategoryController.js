const database = require('../model/db');
const tableName = 'category';
const mappingTableName = 'subcategory_mapping';
const {clearImage} = require('../util/helpers');

exports.getAllCategoriesOption = (request, response, next) => {
    database.query('select id, name as text from ?? where status=1 and isSubcategory=0 and activeStatus=1', [tableName])
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

    database.query(`select id, name as text from ${tableName} 
                    where id in (select subcategoryId from ${mappingTableName} where CategoryId=${categoryId}) 
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

exports.getAllCategoriesTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    database.findAllCount(tableName, {
        activeStatus: 1
    }).then(totalCount => {
        database.dataTableSource(tableName, ["id", "name", "description", "photo", "status","isSubcategory", "createdAt"]
            , {activeStatus: 1}, 'createdAt', 'name', search, 'desc',
            parseInt(start), parseInt(length)).then(result => {
            return response.status(200).json({
                draw: parseInt(draw),
                recordsTotal: result.length,
                recordsFiltered: totalCount,
                data: result
            });
        });
    }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })

}

exports.getAllCategories = (request, response, next) => {

    database.select(tableName, {status: 1, isSubcategory: 0}, ["id", "name", "description", "photo"])
        .then(categories => {
            if (categories.length > 0) {
                let allCategories = categories.map(async(category) => {
                    return {
                        category:category,
                        subCategory: await database.query(`select id, name,description, photo from ${tableName} 
                    where id in (select subcategoryId from ${mappingTableName} where CategoryId=${category.id}) 
                    and activeStatus=1 and status=1`),
                    }
                })
                Promise.all(allCategories).then(res => {
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

exports.saveCategorySubcategory = async (request, response, next) => {

    let {name, description, status, chkIsSubcategory, updateCategoryId, category_id} = request.body;

    let categoriesPhotos = null;
    if (request.files && request.files.categoryImage) {
        categoriesPhotos = request.files.categoryImage[0].path;
    }
    let object = {
        name: name,
        description: description,
        photo: categoriesPhotos,
        isSubcategory: chkIsSubcategory === "on" ? 1 : 0,
        status: status,
    };

    try{
        if (parseInt(updateCategoryId) !== 0) {

            const existingCategoryObject = await database.query(`select *,(select CategoryId from subcategory_mapping where subcategoryId =s.id) as categoryID from category s where id = ${updateCategoryId}`);

            if (existingCategoryObject.length !== 0) {
                let error = new Error("Not Found Category");
                error.statusCode = 404;
            }
            const connection = await database.transaction()
            await connection.beginTransaction();
            if (existingCategoryObject[0].isSubcategory === 1) {
                let [deleteResult,error] = await connection.query(`delete from ${mappingTableName} where subcategoryId =${existingCategoryObject[0].id}`);
                if (error) {
                    await connection.rollback();
                    let error = new Error("Failed to update");
                    error.statusCode = 500;
                    throw error
                }
            }
            object.updatedAt = database.currentTimeStamp();
            let [updateResult,updateError] = await connection.query('update ?? set ? where ? ', [tableName, object, {id: updateCategoryId}]);

            if (updateError) {
                await connection.rollback();
                connection.release();
                throw new Error("Failed To updated");
            }

            if (chkIsSubcategory === "on") {
                await connection.query("insert into ?? set ?", [mappingTableName,
                    {CategoryId: category_id, subcategoryId: updateCategoryId}])
            }
            await connection.commit();
            connection.release()
            response.status(200).json({
                body: "Update Service Successfully"
            })

        }else{
            const connection = await database.transaction();
            await connection.beginTransaction();
            object.createdAt = database.currentTimeStamp();
            const [results, error] = await connection.query("insert into ?? set ?", [tableName, object]);
            if (error) {
                await connection.rollback();
                let error = new Error("Failed To Create Category");
                error.statusCode = 500;
                throw error
            }

            if (chkIsSubcategory === "on") {
                const [mapError] = await connection.query("insert into ?? set ?",[mappingTableName, {
                    CategoryId: category_id,
                    subcategoryId: results.insertId
                }])
                if (!mapError) {
                    await connection.rollback();
                    let error = new Error("Failed To mapping category");
                    error.statusCode = 500;
                    throw error
                }
            }
            await connection.commit();
            connection.release()
            response.status(200).json({
                body: "Create Category Successfully"
            })
        }

    }catch (error) {
        next(error)
    }

}

exports.getCategoryById = (request, response, next) => {

    let {categoryId} = request.body;
    database.query(`select id,name,description,isSubcategory,status,photo,sequenceNumber,
       (select CategoryId from subcategory_mapping where subcategoryId=s.id) as category_id from ?? s where id=?`,[tableName,categoryId])
        .then(category => {
            if (category.length > 0) {
                response.status(200).json(category[0])
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
    database.select(tableName,{id:categoryId}).then(category=>{
        if(category.length===0){
            let error = new Error("Category Not Found");
            error.status = 404;
            throw  error;
        }
        if(category[0].photo){
            clearImage(category[0].photo);
        }
        return database.update(tableName,{activeStatus:0},{id:categoryId})
    })
        .then(results => {
            if (!results.status) {
                throw new Error("Failed to delete Category");
            }
            return response.status(200).json({
                body: "Successfully delete Category"
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

