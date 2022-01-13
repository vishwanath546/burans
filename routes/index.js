const express = require('express');
const router = express.Router();


const Vender = require('../model/Vendor');

/* GET home page. */
router.get('/', function (req, res, next) {
    Vender.findAndCountAll({
        where:{
            name:"Narnedra Jadhav"
        }
    }).then(({count, rows})=>{
        console.log(count, rows);
    })
    res.render('index', {title: 'Express'});
});


const createVendor =()=>{



    Vender.create({
        name: "Narnedra Jadhav",
        shopName: "Hexaclan",
        gstNumber: "jdklfh33334",
        foodLicense: "dslka3242",
        mobileNumber: "9920482779",
        area: "Panvel",
        accountStatus: 1
    }).then(() => {
        console.log("New Vender Added");
    }).catch(e => console.log("Create function throw error ", e));

}
module.exports = router;
