const {DataTypes} = require("sequelize");

const {Connection} = require("./Database");

module.exports.Vendor = Connection.define("Vendor", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: DataTypes.STRING,
    mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shopName: DataTypes.STRING,
    gstNumber: DataTypes.STRING,
    foodLicense: DataTypes.STRING,
    area: DataTypes.STRING,
    avatar:DataTypes.STRING,
    address:DataTypes.STRING,
    accountStatus: {
        type: DataTypes.INTEGER,
        default:1,
        comment: "1:active 2:inactive 3:confirm 4:not confirm",
    },
    updateOnColumn: {type: DataTypes.STRING,
      comment:"{columns:[shopName],values:[value]}"},
    adminConfirmOn: {
        type: DataTypes.INTEGER,
        default:1,
        comment: "1:confirm 0:not confirm",
    }
},{
    tableName:"vendor_user",
    paranoid: true,
});
