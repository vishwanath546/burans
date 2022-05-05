require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const database = require("../../model/db");
const tableName = "category";
const tableName2 = "subcategory_mapping";
const tableName3 = "products";
const tableName4 = "product_images";
const adminTable = "admin_user";
const { clearImage } = require("../../util/helpers");

exports.getCategory = (request, response, next) => {
  database
    .select(tableName, { status: 1, activeStatus: 1, isSubcategory: 0 })
    .then((category) => {
      if (category.length == 0) {
        let error = new Error("category Not Found");
        error.statusCode = 404;
        throw error;
      }
      response.status(200).json({
        status: true,
        body: category,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getSubCategory = (request, response, next) => {
  database
    .query(
      `select * from ${tableName} where id in (select subcategoryId from ${tableName2} where CategoryId=${request.body.cat_id})`,
      {}
    )
    .then((subcategory) => {
      if (subcategory.length == 0) {
        let error = new Error("subcategory Not Found");
        error.statusCode = 404;
        throw error;
      }
      response.status(200).json({
        status: true,
        body: subcategory,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getSubCategoryProduct = (request, response, next) => {
  var query = "";
  if (request.body.Subcat_id != "") {
    query = `select *,(select path from ${tableName4} where ProductId=${tableName3}.id) image from ${tableName3} where status=1 and activeStatus=1 and subcategoryId=${request.body.Subcat_id} order by sequenceNumber asc`;
  } else {
    query = `select *,(select path from ${tableName4} where ProductId=${tableName3}.id) image from ${tableName3} where status=1 and activeStatus=1 and categoryId=${request.body.cat_id} order by sequenceNumber asc`;
  }
  database
    .query(query, {})
    .then((subcategory) => {
      if (subcategory.length == 0) {
        let error = new Error("Product Not Found");
        error.statusCode = 200;
        throw error;
      }
      response.status(200).json({
        status: true,
        body: subcategory,
      });
    })
    .catch((error) => {
      next(error);
    });
};
