require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const database = require("../../model/db");
const CategoryTable = "category";
const SubCategoryTable = "subcategory_mapping";
const productTable = "products";
const productImageTable = "product_images";
const addtocarttable = "add_to_cart";
const wish_listtable = "wish_list";
const adminTable = "admin_user";
const { clearImage } = require("../../util/helpers");

exports.getCategory = (request, response, next) => {
  database
    .select(CategoryTable, { status: 1, activeStatus: 1, isSubcategory: 0 })
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
      `select * from ${CategoryTable} where id in (select subcategoryId from ${SubCategoryTable} where CategoryId=${request.body.cat_id})`,
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
  let cust_id = 1;
  var searchbyid = "";
  var getwishlistid = "";
  if (request.body.Subcat_id != "") {
    searchbyid = `subcategoryId=${request.body.Subcat_id}`;
  } else {
    searchbyid = `categoryId=${request.body.cat_id}`;
  }
  if (cust_id != "") {
    getwishlistid = `(select id from ${wish_listtable} where cust_id=${cust_id} and product_id=${productTable}.id) as wishlisid`;
  }

  let query = `select *,${getwishlistid},(select path from ${productImageTable} where ProductId=${productTable}.id) image from ${productTable} where status=1 and activeStatus=1 and ${searchbyid} order by sequenceNumber asc`;

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

exports.add_to_cart = (request, response, next) => {
  var { ProductId, qty, type, menutype } = request.body;
  let cust_id = 1;
  database
    .query(
      `select * from ${addtocarttable} where cust_id=${cust_id} and ProductId=${+ProductId}`,
      {}
    )
    .then((addtocartdata) => {
      if (addtocartdata.length > 0) {
        if (type == "sub") {
          qty = --addtocartdata[0].qty;
        } else {
          qty = ++addtocartdata[0].qty;
        }

        database
          .updateall(
            addtocarttable,
            {
              qty: qty,
            },
            {
              ProductId: +ProductId,
              cust_id: cust_id,
            }
          )
          .then((addtocart) => {
            console.log(addtocart);
            if (addtocart.affectedRows == 0) {
              let error = new Error("Faild to update cart");
              error.statusCode = 200;
              throw error;
            }
            response.status(200).json({
              status: true,
              body: "Successfully product updated",
            });
          })
          .catch((error) => {
            next(error);
          });
      } else {
        database
          .insert(addtocarttable, {
            ProductId: ProductId,
            cust_id: cust_id,
            qty: qty,
            status: 1,
          })
          .then((addtocart) => {
            if (!addtocart.status) {
              let error = new Error("Faild to add cart");
              error.statusCode = 200;
              throw error;
            }
            response.status(200).json({
              status: true,
              body: "Successfully product added",
            });
          })
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => {
      next(error);
    });
};
exports.addtowishlist = (request, response, next) => {
  var { ProductId, qty, type, menutype } = request.body;
  let cust_id = 1;
  database
    .query(
      `select * from ${wish_listtable} where cust_id=${cust_id} and Product_Id=${+ProductId}`,
      {}
    )
    .then((addtocartdata) => {
      if (addtocartdata.length > 0) {
        database
          ._deleteall(wish_listtable, {
            Product_Id: +ProductId,
            cust_id: cust_id,
          })
          .then((addtocart) => {
            console.log(addtocart);
            if (addtocart.affectedRows == 0) {
              let error = new Error("Faild to Remove product");
              error.statusCode = 200;
              throw error;
            }
            response.status(200).json({
              status: true,
              body: "Successfully product Removed",
            });
          })
          .catch((error) => {
            next(error);
          });
      } else {
        database
          .insert(wish_listtable, {
            Product_Id: ProductId,
            cust_id: cust_id,
            qty: qty,
            status: 1,
          })
          .then((addtocart) => {
            if (!addtocart.status) {
              let error = new Error("Faild to add product");
              error.statusCode = 200;
              throw error;
            }
            response.status(200).json({
              status: true,
              body: "Successfully product added",
            });
          })
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => {
      next(error);
    });
};

exports.getCartList = (request, response, next) => {
  var cust_id = 1;
  var query = `select ac.qty,p.*,pi.path,pi.ProductId from ${addtocarttable} as ac join ${productTable} as p  on ac.ProductId=p.id Left join ${productImageTable} as  pi on p.id=pi.ProductId where ac.cust_id=${cust_id} and ac.status=1 and p.status=1 and p.activeStatus=1`;
  database
    .query(query, {})
    .then((carlust) => {
      if (carlust.length == 0) {
        let error = new Error("Empty Cart List");
        error.statusCode = 200;
        throw error;
      }
      var total = 0;
      carlust.forEach((item, value) => {
        total += item.price;
      });
      console.log(carlust);
      response.status(200).json({
        status: true,
        body: carlust,
        totalPrice: total,
      });
    })
    .catch((error) => {
      next(error);
    });
};
exports.getwishList = (request, response, next) => {
  var cust_id = 1;
  var query = `select ac.qty,p.*,pi.path,pi.ProductId from ${wish_listtable} as ac join ${productTable} as p  on ac.Product_Id=p.id Left join ${productImageTable} as  pi on p.id=pi.ProductId where ac.cust_id=${cust_id} and ac.status=1 and p.status=1 and p.activeStatus=1`;
  database
    .query(query, {})
    .then((wishlust) => {
      if (wishlust.length == 0) {
        let error = new Error("Empty Wish List");
        error.statusCode = 200;
        throw error;
      }
      response.status(200).json({
        status: true,
        body: wishlust,
      });
    })
    .catch((error) => {
      next(error);
    });
};
