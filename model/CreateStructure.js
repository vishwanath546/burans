const {Connection} = require('./Database');
// models
const {Products} = require('./Products');
const {Category} = require('./Category');

const {DeliveryBoy} = require('./DeliveryBoy');
const {DeliveryBoyOrders}=require('./DeliveryBoyOrders');

const {Vendor} = require('./Vendor');
const {VendorProduct} = require('./VendorProducts');
const {VendorOrders} = require('./VendorOrders');

const {Users} = require('./Users');
const {UserAddress} = require('./UserAddress')
const {UserAuth} = require('./UserAuth');
const {AdminUser}=require('./AdminUser');
const {Orders} = require('./Orders');
const {OrderItems} = require('./OrderItems');

const {CouponCode} =require('./CouponCode');
module.exports.createDatabase = (callback) => {

    Products.belongsTo(Category);

    Users.hasMany(UserAddress);
    Users.hasOne(UserAuth,{onDelete:"CASCADE"});
    AdminUser.hasOne(UserAuth,{onDelete:"CASCADE",foreignKey:'AdminUserId'});
    UserAuth.belongsTo(AdminUser,{foreignKey:'AdminUserId'});
    Orders.hasMany(OrderItems,{onDelete:"CASCADE",onUpdate:"CASCADE"});
    CouponCode.hasMany(Orders);
    Orders.belongsTo(CouponCode);
    OrderItems.belongsTo(Products);
    Users.hasMany(Orders);
    UserAddress.hasOne(Orders);

    Vendor.hasOne(UserAuth,{onDelete:"CASCADE"});
    Vendor.belongsToMany(Products, {through: VendorProduct});
    Vendor.belongsToMany(Orders, {through: VendorOrders})

    DeliveryBoy.hasOne(UserAuth,{onDelete:"CASCADE"});
    DeliveryBoy.belongsToMany(Orders,{through:DeliveryBoyOrders});


    Connection.query('SET FOREIGN_KEY_CHECKS = 0', {raw: true}).then(r => {
        Connection.sync({force: true}).then(() => {
            callback();
        })
    }).catch(error => {
        console.log("Error", error);
    })
}

