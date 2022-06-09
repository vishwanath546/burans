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
const settingTable = `setting`;
const couponcodeTable = "coupon_code";
const paymentdetailsTable = "payment_details";
const ordersTable = "orders";
const ordersitemsTable = "order_items";
const adminTable = "admin_user";
const useraddressTable = "user_address";
const { clearImage } = require("../../util/helpers");
const storage = require("node-sessionstorage");
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
  let cust_id = "";
  if ("user" in request.cookies) {
    cust_id = request.cookies.user.authId;
  }
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
    getwishlistid = `,(select id from ${wish_listtable} where cust_id=${cust_id} and product_id=${productTable}.id) as wishlisid`;
  }

  let query = `select *${getwishlistid},(select path from ${productImageTable} where ProductId=${productTable}.id) image from ${productTable} where status=1 and activeStatus=1  ${searchbyid} order by sequenceNumber asc`;

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
  let cust_id = request.cust_id;
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
  try {
    var { ProductId, qty, type, menutype } = request.body;
    let cust_id = "";
    if ("cust_id" in request) {
      cust_id = request.cust_id;
    }
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
  } catch (err) {
    next(error);
  }
};
exports.addtowishlist = (request, response, next) => {
  var { ProductId, qty, type, menutype } = request.body;
  let cust_id = request.cust_id;
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
exports.redirectpayment = (request, response, next) => {
  let couponCode = request.body.couponCode;
  let Note = request.body.Note;
  let couponsData = { couponCode: couponCode, Note: Note };
  storage.setItem("couponsData", couponsData);
  response.status(200).json({
    status: true,
  });
};
exports.getCartList = (request, response, next) => {
  let couponCode = request.body.couponCode ?? "";
  let Note = request.body.Note ?? "";
  let cust_id = request.cust_id;
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
        .then(async (addonlist) => {
          if (addonlist.length == 0) {
            return 0;
          }
          return 0;
          response
            .status(200)
            .json(await get_new_cart_list(cartlist, addonlist, couponCode));
        })
        .then(() => {
          query = `select p.*,si.ProductId,pi.path as photo from ${suggestedItemMapping} as si join ${productTable} as p on p.id=si.SuggestedProductId Left join ${productImageTable} as  pi on p.id=pi.ProductId where si.ProductId in (${productIds})`;
          database
            .query(query, {})
            .then(async (suggestedlist) => {
              if (suggestedlist.length == 0) {
                return 0;
              }
              response
                .status(200)
                .json(
                  await get_new_cart_list(cartlist, suggestedlist, couponCode)
                );
            })
            .catch((error) => {
              next(error);
            });
        })
        .then(() => {
          query = `select p.*,si.ProductId,pi.path as photo from ${suggestedItemMapping} as si join ${productTable} as p on p.categoryId=si.CategoryId Left join ${productImageTable} as  pi on p.id=pi.ProductId  where si.ProductId in (${productIds}) limit 5`;
          database
            .query(query, {})
            .then(async (categorylist) => {
              if (categorylist.length == 0) {
                return 0;
              }
              response
                .status(200)
                .json(
                  await get_new_cart_list(cartlist, categorylist, couponCode)
                );
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

async function get_delivery_charges() {
  try {
    var delivery_charge = 0;
    var query = `select * from ${settingTable} where status=1`;
    var delivery_charges = await database.query(query, {});
    if (delivery_charges.length > 0) {
      delivery_charges.forEach((v) => {
        delivery_charge = +v.value;
      });
    }
    return delivery_charge;
  } catch (err) {
    throw err;
  }
}

async function get_discount_charges(couponCode = "") {
  try {
    let couponCodequery = "";
    var discountamt = 0;
    if (couponCode != "") {
      couponCodequery = `code=${couponCode} and `;
    } else {
      if (storage.getItem("couponsData") !== undefined) {
        let codedata = storage.getItem("couponsData");
        couponCodequery = `code=${codedata.couponCode} and `;
      }
    }
    if (couponCodequery != "") {
      var query = `select discountAmount,discountType,applyTo from ${couponcodeTable} where ${couponCodequery} status=1`;
      var result = await database.query(query, {});
      if (result.length > 0) {
        result.forEach((v) => {
          if (v.discountType == 2) {
            discountamt = +v.discountAmount;
          }
        });
      }
    }
    return Math.round(discountamt);
  } catch (err) {
    console.log(err);
    throw err;
  }
}
async function get_new_cart_list(
  cartlist,
  addonlist,
  couponCode = "",
  type = "addonlist"
) {
  try {
    var total = 0;
    var restaurant_charges = 0;
    var addonlistdata = [];
    var cartlistdata = [];
    cartlist.forEach((item, value) => {
      total += item.price * item.qty;
      restaurant_charges += +item.specialDeliveryCharges * item.qty;
      addonlist.forEach((item2, value) => {
        if (item.id == item2.ProductId) {
          addonlistdata.push(item2);
        }
      });
      item[type] = addonlistdata;
      addonlistdata = [];
      cartlistdata.push(item);
    });
    var delivery_charge = await get_delivery_charges();
    let discountamt = await get_discount_charges(couponCode);
    var finalPrice = 0;
    finalPrice = restaurant_charges + total + delivery_charge;
    discountamt = (finalPrice / 100) * discountamt;
    finalPrice = finalPrice - discountamt;
    return {
      status: true,
      body: cartlistdata,
      totalPrice: total,
      finalPrice: Math.round(finalPrice),
      restaurant_charges: restaurant_charges,
      delivery_charge: delivery_charge,
      discount_value: Math.round(discountamt),
    };
  } catch (err) {
    throw err;
  }
}

exports.getwishList = (request, response, next) => {
  let cust_id = request.cust_id;
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
  let cust_id = request.cust_id;
  var query = `select ac.qty,p.*,pi.path as photo,pi.ProductId from ${addtocarttable} as ac join ${productTable} as p  on ac.ProductId=p.id Left join ${productImageTable} as  pi on p.id=pi.ProductId where ac.cust_id=${cust_id} and ac.status=1 and p.status=1 and p.activeStatus=1`;
  database
    .query(query, {})
    .then(async (cartlist) => {
      if (cartlist.length == 0) {
        let error = new Error("Empty Cart List");
        error.statusCode = 200;
        throw error;
      }
      var productIds = cartlist.map((item) => {
        return item.id;
      });
      var amountlist = await get_new_cart_list(cartlist, []);
      finalPrice = amountlist.finalPrice;
      database
        .insert(paymentdetailsTable, {
          cust_id: cust_id,
          final_amount: finalPrice,
          payment_mode: request.body.payment_mode,
          payment_date: database.currentTimeStamp(),
          status: 1,
        })
        .then((payment_details) => {
          if (!payment_details.status) {
            let error = new Error("Payment Faild");
            error.statusCode = 200;
            throw error;
          }
          return payment_details;
        })
        .then((payment_result) => {
          var codedata = {};
          if (storage.getItem("couponsData") !== undefined) {
            codedata = storage.getItem("couponsData");
          }
          database
            .insert(ordersTable, {
              amount: finalPrice,
              paymentMethod: request.body.payment_mode,
              preparationTime: "00:30:00",
              createdAt: database.currentTimeStamp(),
              UserAddressId: 1,
              UserId: cust_id,
              discountAmount: amountlist.discount_value,
              status: 1,
              CouponCode: codedata.couponCode || "",
              Note: codedata.Note || "",
            })
            .then((order_result) => {
              if (!order_result.status) {
                let error = new Error("Faild To add order");
                error.statusCode = 200;
                throw error;
              }
              return order_result;
            })
            .then((order_result) => {
              let orderdata = cartlist.map((v, index) => {
                return [
                  v.qty,
                  v.price,
                  v.salePrice,
                  v.ProductId,
                  order_result.insertId,
                ];
              });

              database
                .query(
                  "insert into ?? (quantity,amount,saleAmount,ProductId,OrderId) values ?",
                  [ordersitemsTable, orderdata]
                )
                .then((result) => {
                  if (!result) {
                    let error = new Error("Failed To insert Order");
                    error.statusCode = 404;
                    throw error;
                  }
                  return result;
                })
                .then((final_result) => {
                  database
                    ._delete(addtocarttable, {
                      cust_id: cust_id,
                    })
                    .then((cartdata) => {
                      if (!cartdata.status) {
                        let error = new Error("Faild To delete cart list");
                        error.statusCode = 200;
                        throw error;
                      }
                      return cartdata;
                    })
                    .then((cartdata) => {
                      response.status(200).json({
                        status: true,
                        body: "Order Successfully",
                      });
                    })
                    .catch((error) => {
                      next(error);
                    });
                })
                .catch((error) => {
                  next(error);
                });
            })
            .catch((error) => {
              next(error);
            });
        })
        .catch((error) => {
          next(error);
        });
    })
    .catch((error) => {
      next(error);
    });
};

exports.insert_address = (request, response, next) => {
  let cust_id = request.cust_id;
  request.body.UserId = cust_id;
  request.body.status = 1;
  database
    .insert(useraddressTable, request.body)
    .then((result) => {
      if (!result.status) {
        let error = new Error("Faild to insert address");
        error.statusCode = 200;
        throw error;
      }
      response.status(200).json({
        status: true,
        body: "Address Successfully inserted",
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.update_address = (request, response, next) => {
  let {
    id,
    addressLineOne,
    addressLineTwo,
    city,
    state,
    pinCode,
    contactNumber,
    address_type,
  } = request.body;
  let UserId = request.body.UserId;
  let status = request.body.status;
  database
    .update(
      useraddressTable,
      { id: id },
      {
        addressLineOne: addressLineOne,
        addressLineTwo: addressLineTwo,
        city: city,
        state: state,
        pinCode: pinCode,
        contactNumber: contactNumber,
        address_type: address_type,
        UserId: UserId,
        status: status,
      }
    )
    .then((result) => {
      if (!result.status) {
        let error = new Error("Faild to update address");
        error.statusCode = 200;
        throw error;
      }
      response.status(200).json({
        status: true,
        body: "Address Successfully updateed",
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.view_address = (request, response, next) => {
  let cust_id = request.cust_id;
  database
    .select(useraddressTable, { status: 1, UserId: cust_id })
    .then((address) => {
      if (address.length == 0) {
        let error = new Error("Address Not Found");
        error.statusCode = 404;
        throw error;
      }
      response.status(200).json({
        status: true,
        body: address,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.delete_address = (request, response, next) => {
  var { id } = request.body;
  let cust_id = request.cust_id;
  database
    ._deleteall(useraddressTable, {
      id: +id,
      cust_id: cust_id,
    })
    .then((deletadress) => {
      if (deletadress.affectedRows == 0) {
        let error = new Error("Faild to delete Address");
        error.statusCode = 200;
        throw error;
      }
      response.status(200).json({
        status: true,
        body: "Successfully Address deleted",
      });
    });
};

exports.getOrders = (request, response, next) => {
  let cust_id = request.cust_id;
  console.log("fdfdsfds");
  var query = `select ord.*,ot.ProductId,ot.quantity as qty,pi.path as photo,p.name,p.description,p.price as p_price from ${ordersTable} as ord Right join ${ordersitemsTable} as ot on ord.id=ot.OrderId
  join ${productTable} as p  on ot.ProductId=p.id  join ${productImageTable} as  pi on p.id=pi.ProductId
   where ord.UserId=${cust_id}`;
  database
    .query(query, {})
    .then(async (orderList) => {
      if (orderList.length == 0) {
        let error = new Error("Empty Order");
        error.statusCode = 200;
        throw error;
      }
      response.status(200).json({
        status: true,
        body: orderList,
      });
    })
    .catch((error) => {
      next(error);
    });
};
