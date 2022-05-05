require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const database = require("../model/db");
const tableName = "category";
const adminTable = "admin_user";
const { clearImage } = require("../util/helpers");

exports.getCategory = (request, response, next) => {
  database
    .select(tableName)
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
