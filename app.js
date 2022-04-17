const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const multer = require('multer');

// const db = require('./model/db')

const app = express();
const {createDatabase} = require("./sequlizerModel/CreateStructure");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const diskStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        let destinationPath = "public/";
        switch (file.fieldname) {
            case "profileImage":
                destinationPath += "images/avatar"
                break;
            case "idProofImage":
                destinationPath += "images/avatar"
                break;
            case "categoryImage":
                destinationPath += "images/category";
                break;
            case "serviceImage":
                destinationPath += "images/service";
                break;
            case "addOnsProductImage":
            case "productImages":
                destinationPath += "images/products";
                break;
            case "shopImage":
                destinationPath += "images/vendor";
                break;
            case "licenseImage":
            case "bikeRcImage":
                destinationPath += "images/documents";
                break;
        }
        callback(null, destinationPath)
    },
    filename: (request, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        callback(null, uniqueSuffix + "-" + file.originalname)
    }
});
const fileFilter = (request, file, callback) => {

    if (file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/webp"
    ) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

app.use(multer({storage: diskStorage, fileFilter: fileFilter}).fields([
    {name: "profileImage", maxCount: 1},
    {name: "serviceImage", maxCount: 1},
    {name: "categoryImage", maxCount: 4},
    {name: "shopImage", maxCount: 4},
    {name: "productImages", maxCount: 4},
    {name: "addOnsProductImage", maxCount: 1},
    {name: "licenseImage", maxCount: 1},
    {name: "bikeRcImage", maxCount: 1}
]))


app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const adminRouter = require("./routes/admin");
const vendorRouter = require("./routes/vendor");
const webRouter = require("./routes/index");

app.use(webRouter);
app.use("/admin", adminRouter);
app.use("/vendor", vendorRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.statusCode || 500).json({message: err.message});
});

//
// createDatabase(false, () => {
    app.listen(3000, () => console.log("Burans http://localhost:3000/"));
// });


// db.insert("category", {"name":'test', "description":'test', "photo":'232.png'})
//     db._delete("category",{id:8})
// db.select("category",null,["name"])
//     .then(result => {
//         console.log(result)
//     })
//     .catch(error => console.log("hii",error))
