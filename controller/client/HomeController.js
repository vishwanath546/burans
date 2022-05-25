require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pagination = require("pagination");
const database = require("../../model/db");
const CategoryTable = "category";
const SubCategoryTable = "subcategory_mapping";
const productTable = "products";
const productImageTable = "product_images";
const addtocarttable = "add_to_cart";
const wish_listtable = "wish_list";
const addonProductMappingTable = "addon_product_mapping";
const addonsProductsTable = "addons_products";
const suggestedItemMapping = "suggested_item_mapping";

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
    searchbyid = `and subcategoryId=${request.body.Subcat_id}`;
  } else {
    searchbyid = `and categoryId=${request.body.cat_id}`;
  }

  if (request.body.Subcat_id != "" && request.body.cat_id != "") {
    searchbyid = "";
  }
  if (cust_id != "") {
    getwishlistid = `(select id from ${wish_listtable} where cust_id=${cust_id} and product_id=${productTable}.id) as wishlisid`;
  }

  let query = `select *,${getwishlistid},(select path from ${productImageTable} where ProductId=${productTable}.id) image from ${productTable} where status=1 and activeStatus=1  ${searchbyid} order by sequenceNumber asc`;

  database
    .query(query, {})
    .then((subcategory) => {
      if (subcategory.length == 0) {
        let error = new Error("Product Not Found");
        error.statusCode = 200;
        throw error;
      }
      var paginator = new pagination.SearchPaginator({
        prelink: "/",
        current: request.body.page,
        rowsPerPage: 10,
        totalResult: subcategory.length,
      });

      response.status(200).json({
        status: true,
        body: subcategory,
        pagination: paginator.getPaginationData(),
      });
    })
    .catch((error) => {
      next(error);
    });
};
exports.delete_product_from_cart = (request, response, next) => {
  var { ProductId } = request.body;
  let cust_id = 1;
  database
    ._deleteall(addtocarttable, {
      ProductId: +ProductId,
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
    });
};
exports.add_to_cart = (request, response, next) => {
  response.status(200).json({
    status: true,
    body: request.session.user,
  });

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
        if (qty > 0) {
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
            ._deleteall(addtocarttable, {
              ProductId: +ProductId,
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
            });
        }
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
  var query = `select ac.qty,p.*,pi.path as photo,pi.ProductId from ${addtocarttable} as ac join ${productTable} as p  on ac.ProductId=p.id Left join ${productImageTable} as  pi on p.id=pi.ProductId where ac.cust_id=${cust_id} and ac.status=1 and p.status=1 and p.activeStatus=1`;
  database
    .query(query, {})
    .then((cartlist) => {
      if (cartlist.length == 0) {
        let error = new Error("Empty Cart List");
        error.statusCode = 200;
        throw error;
      }
      var productIds = cartlist.map((item) => {
        return item.id;
      });

      query = `select ap.*,apm.ProductId from ${addonProductMappingTable} as apm join ${addonsProductsTable} as ap on ap.id=apm.AddOnsProductId where apm.ProductId in (${productIds})`;

      database
        .query(query, {})
        .then((addonlist) => {
          if (addonlist.length == 0) {
            return 0;
          }
          return 0;
          response.status(200).json(get_new_cart_list(cartlist, addonlist));
        })
        .then(() => {
          query = `select p.*,si.ProductId,pi.path as photo from ${suggestedItemMapping} as si join ${productTable} as p on p.id=si.SuggestedProductId Left join ${productImageTable} as  pi on p.id=pi.ProductId where si.ProductId in (${productIds})`;
          database
            .query(query, {})
            .then((suggestedlist) => {
              if (suggestedlist.length == 0) {
                return 0;
              }
              response
                .status(200)
                .json(get_new_cart_list(cartlist, suggestedlist));
            })
            .catch((error) => {
              next(error);
            });
        })
        .then(() => {
          query = `select p.*,si.ProductId,pi.path as photo from ${suggestedItemMapping} as si join ${productTable} as p on p.categoryId=si.CategoryId Left join ${productImageTable} as  pi on p.id=pi.ProductId  where si.ProductId in (${productIds}) limit 5`;
          database
            .query(query, {})
            .then((categorylist) => {
              if (categorylist.length == 0) {
                return 0;
              }
              response
                .status(200)
                .json(get_new_cart_list(cartlist, categorylist));
            })
            .catch((error) => {
              next(error);
            });
        })
        .catch((error) => {
          next(error);
        })
        .catch((error) => {
          next(error);
        })
        .catch((error) => {
          next(error);
        });
    })
    .catch((error) => {
      next(error);
    });
};

function get_new_cart_list(cartlist, addonlist, type = "addonlist") {
  var total = 0;
  var addonlistdata = [];
  var cartlistdata = [];

  cartlist.forEach((item, value) => {
    total += item.price;
    addonlist.forEach((item2, value) => {
      if (item.id == item2.ProductId) {
        addonlistdata.push(item2);
      }
    });
    item[type] = addonlistdata;
    addonlistdata = [];
    cartlistdata.push(item);
  });
  return {
    status: true,
    body: cartlistdata,
    totalPrice: total,
  };
}

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

exports.insertOrder = (request, response, next) => {
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
