const database = require("../model/db");
const { clearImage } = require("../util/helpers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const vendorTable = "vendor_user";
const userAuthTable = "user_auth";
const vendorLocationTable = "vendor_locations";

exports.login_vendor = (request, response, next) => {
  var { mobile_Number } = request.body;
  database
    .select(userAuthTable, { mobileNumber: mobile_Number }, "", 1)
    .then((userdata) => {
      if (userdata.length == 0) {
        let error = new Error("User Not Found");
        error.statusCode = 404;
        error.status = false;
        throw error;
      }
      return userdata;
    })
    .then((userdata) => {
      let otp = Math.floor(1000 + Math.random() * 9000);
      var data = {
        otpToken: otp,
      };
      return database.update(userAuthTable, data, {
        id: userdata[0].id,
      });
    })
    .then((result) => {
      if (result.affectedRows > 0) {
        response.status(200).json({
          status: true,
          body: "Otp sent Successfully",
        });
      } else {
        response.status(401).json({
          status: false,
          body: "Failed to sent otp",
        });
      }
    })
    .catch((error) => {
      next(error);
    });
};

exports.otpVerification = (request, response, next) => {
  var { mobile_Number, otp } = request.body;
  console.log(mobile_Number, otp);
  database
    .select(
      userAuthTable,
      { mobileNumber: mobile_Number, otpToken: otp },
      "",
      1
    )
    .then((userdata) => {
      if (userdata.length == 0) {
        let error = new Error("Invalid user or Otp");
        error.statusCode = 404;
        error.status = false;
        throw error;
      }
      return userdata;
    })
    .then((result) => {
      database
        .select(vendorTable, { id: result[0].id }, "", 1)
        .then((vendordata) => {
          if (vendordata.length == 0) {
            let error = new Error("Vendor Not Found");
            error.statusCode = 404;
            error.status = false;
            throw error;
          }
          return vendordata;
        })
        .then((vendordata) => {
          request.session.user = {
            authId: vendordata[0].id,
            mobileNumber: vendordata[0].mobileNumber,
            email: vendordata[0].email,
            shopName: vendordata[0].shopName,
            avatar: vendordata[0].avatar,
          };
          console.log(request.session.user);
          response.status(200).json({
            status: true,
            body: "Vendor login Sucessfully",
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

exports.vendorRegistration = async (request, response, next) => {
  let { name, shopName, email, mobileNumber, gstNumber, foodLicense, area } =
    request.body;

  if (!request.files) {
    return response.status(401).json({
      status: 401,
      body: "no image provided",
    });
  }
  const avatar = request.files.shopImage[0].path;

  try {
    const connection = await database.transaction();
    await connection.beginTransaction();
    const [vendorResult, error] = await connection.query(
      "insert into ?? set ?",
      [
        vendorTable,
        {
          name: name,
          shopName: shopName,
          mobileNumber: mobileNumber,
          gstNumber: gstNumber,
          email: email,
          foodLicense: foodLicense,
          accountStatus: 1,
          avatar: avatar,
          createdAt: database.currentTimeStamp(),
        },
      ]
    );
    if (error) {
      await connection.rollback();
      connection.release();
      throw new Error("Failed To Create Vendor");
    }
    const hashPassword = await bcrypt.hash("123456", 12);
    const [authUserResult, authError] = await connection.query(
      "insert into ?? set ?",
      [
        userAuthTable,
        {
          userType: 2,
          mobileNumber: mobileNumber,
          password: hashPassword,
          VendorId: vendorResult.insertId,
          createdAt: database.currentTimeStamp(),
        },
      ]
    );

    if (area) {
      let allAreas = area.map((a) => {
        return connection.query("insert into ?? set ?", [
          vendorLocationTable,
          { locationId: a, vendorId: vendorResult.insertId },
        ]);
      });
      Promise.all(allAreas).then(async (areaResult, areaError) => {
        if (areaError) {
          await connection.rollback();
          throw new Error("Failed To Create Vendor Areas");
        }
        await connection.commit();
        connection.release();
        response.status(200).json({
          body: "Create Category Successfully",
        });
      });
    } else {
      if (authError || !authUserResult.status) {
        await connection.rollback();
        connection.release();
        throw new Error("Failed To Create Vendor auth");
      }
      await connection.commit();
      connection.release();
      response.status(200).json({
        body: "Create Category Successfully",
      });
    }
  } catch (e) {
    next(e);
  }
};

exports.vendorUpdate = async (request, response, next) => {
  let userId = request.params.userId;
  let updateBy = 1; //request.userId;
  let { name, shopName, email, mobileNumber, gstNumber, foodLicense, area } =
    request.body;
  let avatar;
  if (request.files) {
    avatar = request.files.shopImage[0].path;
  }

  try {
    const connection = await database.transaction();
    await connection.beginTransaction();
    const [vendors] = await connection.query(
      `select *,
       (select group_concat(locationId) from vendor_locations where vendorId=vendor_user.id) as mapAreas,
       (select mobileNumber from user_auth where VendorId=vendor_user.id) as user_mobileNumber
                                            from vendor_user where id=?`,
      [userId]
    );
    if (vendors.length === 0) {
      connection.release();
      let error = new Error("User Not Found");
      error.statusCode = 404;
      throw error;
    }
    let vendor = vendors[0];
    let updateObject = { columns: [], values: [] };
    if (vendor.updateOnColumn != null && vendor.updateOnColumn !== "") {
      updateObject = JSON.parse(vendor.updateOnColumn);
    }
    let vendorObject = {};
    vendorObject.name = name;
    vendorObject.email = email;
    if (vendor.mobileNumber !== mobileNumber) {
      if (updateObject.columns.findIndex((i) => i === "mobileNumber") === -1) {
        updateObject.columns.push("mobileNumber");
        updateObject.values.push(mobileNumber);
      }
    }
    if (vendor.shopName !== shopName) {
      if (updateObject.columns.findIndex((i) => i === "shopName") === -1) {
        updateObject.columns.push("shopName");
        updateObject.values.push(shopName);
      }
    }
    if (vendor.gstNumber !== gstNumber) {
      if (updateObject.columns.findIndex((i) => i === "gstNumber") === -1) {
        updateObject.columns.push("gstNumber");
        updateObject.values.push(gstNumber);
      }
    }
    if (vendor.foodLicense !== foodLicense) {
      if (updateObject.columns.findIndex((i) => i === "foodLicense") === -1) {
        updateObject.columns.push("foodLicense");
        updateObject.values.push(foodLicense);
      }
    }
    if (vendor.mapAreas !== area.join(",")) {
      if (updateObject.columns.findIndex((i) => i === "area") === -1) {
        updateObject.columns.push("area");
        updateObject.values.push(area);
      }
    }
    if (avatar) {
      vendorObject.avatar = avatar;
    }
    if (updateObject.columns.length > 0) {
      vendorObject.adminConfirmOn = 0;
      vendorObject.updateOnColumn = JSON.stringify(updateObject);
    }
    const [result, vendorUpdateError] = await connection.query(
      "update ?? set ? where ?",
      [vendorTable, vendorObject, { id: userId }]
    );
    if (vendorUpdateError) {
      await connection.rollback();
      connection.release();
      throw new Error("Failed To Create Vendor");
    }

    if (vendor.user_mobileNumber !== mobileNumber) {
      const [userAuthResult, userAuthError] = await connection.query(
        "update ?? set ? where ?",
        [userAuthTable, { mobileNumber: mobileNumber }, { VendorId: userId }]
      );
      if (userAuthError) {
        await connection.rollback();
        connection.release();
        throw new Error("Failed To Update Vendor ");
      }
    }
    await connection.commit();
    if (avatar) {
      vendorObject.avatar = avatar;
    }
    connection.release();
    response.status(200).json({
      body: "Create Category Successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.deleteVendor = (request, response, next) => {
  let userId = request.params.vendorId;

  database
    .select(vendorTable, { id: userId })
    .then((user) => {
      if (user.length === 0) {
        let error = new Error("User Not Found");
        error.statusCode = 404;
        throw error;
      }
      clearImage(user[0].avatar);
      return database.update(
        vendorTable,
        { activeStatus: 0, deletedAt: database.currentTimeStamp() },
        { id: userId }
      );
    })
    .then((result) => {
      if (!result.status) {
        let error = new Error("Failed to delete vendor");
        error.statusCode = 500;
        throw error;
      }
      return database.update(
        userAuthTable,
        { activeStatus: 0, deletedAt: database.currentTimeStamp() },
        { VendorId: userId }
      );
    })
    .then((result) => {
      if (!result.status) {
        let error = new Error("Failed to delete vendor");
        error.statusCode = 500;
        throw error;
      }
      response.status(200).json({
        body: "Successfully delete vendor",
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getVendor = (request, response, next) => {
  let userId = request.body.vendorId;
  database
    .select(vendorTable, { id: userId }, [
      "id",
      "name",
      "email",
      "mobileNumber",
      "avatar",
      "shopName",
      "gstNumber",
      "foodLicense",
      "updateOnColumn",
      "adminConfirmOn",
      "accountStatus",
      "(select group_concat(locationId) from vendor_locations where vendorId=vendor_user.id) as area",
      "accountStatus",
    ])
    .then((user) => {
      if (user.length === 0) {
        let error = new Error("User Not Found");
        error.statusCode = 404;
        throw error;
      }
      return response.status(200).json(user[0]);
    })
    .catch((error) => {
      next(error);
    });
};

exports.getAllVendorsTables = (request, response, next) => {
  let { start, length, draw } = request.body;
  let search = request.body["search[value]"];

  database
    .findAllCount(vendorTable, { activeStatus: 1 })
    .then((totalCount) => {
      database
        .dataTableSource(
          vendorTable,
          [
            "id",
            "name",
            "email",
            "mobileNumber",
            "gstNumber",
            "foodLicense",
            "avatar",
            "accountStatus",
            "createdAt",
            "adminConfirmOn",
            "(select group_concat(name) from location where id in(select locationId from vendor_locations where vendorId=vendor_user.id)) as area",
          ],
          { activeStatus: 1 },
          "createdAt",
          "name",
          search,
          "desc",
          parseInt(start),
          parseInt(length),
          false
        )
        .then((result) => {
          return response.status(200).json({
            draw: parseInt(draw),
            recordsTotal: totalCount,
            recordsFiltered: result.length,
            data: result,
          });
        });
    })
    .catch((error) => {
      response.status(400).json({
        body: "Not Found",
        exception: error,
      });
    });
};

exports.getAllVendorOptions = (request, response, next) => {
  database
    .select(vendorTable, { activeStatus: 1 }, ["id", "shopName as text"])
    .then((vendors) => {
      response.status(200).json({
        results: [{ id: -1, text: "", disabled: true }, ...vendors],
      });
    })
    .catch((error) => {
      response.status(500).json({
        body: error.message,
      });
    });
};

exports.approval = (request, response, next) => {
  let userId = request.body.vendorId;
  let column = request.body.column;

  database
    .select(vendorTable, { id: userId, adminConfirmOn: 0 }, [
      "id",
      "updateOnColumn",
      "adminConfirmOn",
    ])
    .then(async (deliveryBoy) => {
      if (deliveryBoy.length === 0) {
        let error = new Error("User Not Found");
        error.statusCode = 404;
        throw error;
      }
      if (parseInt(deliveryBoy[0].adminConfirmOn) === 0) {
        let object = JSON.parse(deliveryBoy[0].updateOnColumn);
        let updateObject = {};
        let columnIndex = -1;
        let columnValue;
        if (object.columns.length !== 0) {
          columnIndex = object.columns.findIndex((value) => value === column);
          if (columnIndex !== -1) {
            if (column !== "area") {
              updateObject[column] = object.values[columnIndex];
            }
            columnValue = object.values[columnIndex];
            object.columns.splice(columnIndex, 1);
            object.values.splice(columnIndex, 1);
          }
          if (object.columns.length === 0) {
            updateObject.updateOnColumn = null;
            updateObject.adminConfirmOn = 1;
          } else {
            updateObject.updateOnColumn = JSON.stringify(object);
          }
        } else {
          updateObject.adminConfirmOn = 1;
        }
        if (column === "area") {
          let connection = await database.transaction();
          await connection.beginTransaction();
          const [result, error] = await connection.query(
            "delete from ?? where ?",
            [vendorLocationTable, { vendorId: userId }]
          );
          if (error) {
            let error = new Error("Failed To update");
            await connection.rollback();
            connection.release();
            error.statusCode = 401;
            throw error;
          }
          let updateArea = [];
          if (Array.isArray(columnValue)) {
            updateArea = columnValue.map((i) => [userId, i]);
          } else {
            updateArea.push([userId, columnValue]);
          }
          const [insertResult, insertError] = await connection.query(
            "insert into ?? (vendorId,locationId) values ?",
            [vendorLocationTable, updateArea]
          );
          if (insertError) {
            let error = new Error("Failed To update");
            await connection.rollback();
            connection.release();
            error.statusCode = 401;
            throw error;
          }
          const [updateResult, updateError] = await connection.query(
            "update ?? set ? where ?",
            [vendorTable, updateObject, { id: userId }]
          );
          if (updateError) {
            let error = new Error("Failed To update");
            await connection.rollback();
            connection.release();
            error.statusCode = 401;
            throw error;
          }
          await connection.commit();
          connection.release();
          return Promise.resolve({ error: null });
        } else {
          return database.update(vendorTable, updateObject, { id: userId });
        }
      } else {
        return database.update(
          vendorTable,
          { adminConfirmOn: 1 },
          { id: userId }
        );
      }
    })
    .then((result) => {
      if (result.error) {
        let error = new Error("Failed To update");
        error.statusCode = 401;
        throw error;
      }
      return response.status(200).json({ message: "Save Changes" });
    })
    .catch((error) => {
      next(error);
    });
};
