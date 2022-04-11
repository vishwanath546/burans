const {Connection} = require('./Database');
// models
const {Products} = require('./Products');
const {ProductImages} = require('./ProductImages');

const {Category} = require('./Category');

const {DeliveryBoy} = require('./DeliveryBoy');
const {DeliveryBoyOrders} = require('./DeliveryBoyOrders');

const {Vendor} = require('./Vendor');
const {VendorProduct} = require('./VendorProducts');
const {VendorOrders} = require('./VendorOrders');

const {Users} = require('./Users');
const {UserAddress} = require('./UserAddress')
const {UserAuth} = require('./UserAuth');
const {AdminUser} = require('./AdminUser');
const {Orders} = require('./Orders');
const {OrderItems} = require('./OrderItems');
const {AddOnsProduct} = require('./AddOnsProduct');
const {AddOnProductMapping} = require('./AddOnProductMapping');
const {SuggestedProductCategory} = require('./SuggestedProductMapping');
const {SubcategoryMapping} = require('./SubcategoryMapping');

const {CouponCode} = require('./CouponCode');
module.exports.createDatabase = (isForce, callback) => {

    Products.belongsTo(Category,{onDelete: "CASCADE", as: 'category',foreignKey:'categoryId'});
    Products.belongsTo(Category,{onDelete: "CASCADE", as: 'subCategory',foreignKey:'subcategoryId'});
    Products.hasMany(ProductImages);

    Products.belongsToMany(AddOnsProduct,{through:AddOnProductMapping})
    Products.belongsToMany(Products,{through:SuggestedProductCategory,as:'SuggestedProduct'})
    Products.belongsToMany(Category,{through:SuggestedProductCategory,as:'SuggestedCategory'})

    Category.belongsToMany(Category,{through:SubcategoryMapping,as:'subcategory'});
    Users.hasMany(UserAddress);
    Users.hasOne(UserAuth, {onDelete: "CASCADE"});
    AdminUser.hasOne(UserAuth, {onDelete: "CASCADE", foreignKey: 'AdminUserId'});
    UserAuth.belongsTo(AdminUser, {foreignKey: 'AdminUserId'});
    Orders.hasMany(OrderItems, {onDelete: "CASCADE", onUpdate: "CASCADE"});
    CouponCode.hasMany(Orders);
    Orders.belongsTo(CouponCode);
    OrderItems.belongsTo(Products);
    Users.hasMany(Orders);
    UserAddress.hasOne(Orders);

    Vendor.hasOne(UserAuth, {onDelete: "CASCADE"});
    Vendor.belongsToMany(Products, {through: VendorProduct});
    Vendor.belongsToMany(Orders, {through: VendorOrders})

    DeliveryBoy.hasOne(UserAuth, {onDelete: "CASCADE"});
    DeliveryBoy.belongsToMany(Orders, {through: DeliveryBoyOrders});

    if (isForce) {
        Connection.query('SET FOREIGN_KEY_CHECKS = 0', {raw: true}).then(r => {
            Connection.sync({force: isForce}).then(() => {
                callback();
            })
        }).catch(error => {
            console.log("Error", error);
        })
    } else {
        Connection.sync().then(() => {
            callback();
        }).catch(error => {
            console.log("Error", error);
        })
    }

}


