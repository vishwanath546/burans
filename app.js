const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const multer = require('multer');
const adminRouter = require("./routes/admin");
const vendor = require("./routes/vendor");

const diskStorage = multer.diskStorage({
  destination:(request,file,callback)=>{
    let destinationPath ="public/";
    switch (file.fieldname) {
      case "profileImage":
        destinationPath += "images/avatar"
        break;
      case "idProofImage":
        destinationPath += "images/avatar"
            break;
    }
    callback(null,destinationPath)
  },
  filename:(request,file,callback)=>{
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    callback(null,uniqueSuffix+"-"+file.originalname)
  }
});

const fileFilter = (request,file,callback)=>{

  if(file.mimetype==="image/png" ||
    file.mimetype ==="image/jpg" ||
      file.mimetype === "image/jpeg"
  ){
    callback(null,true)
  }else{
    callback(null,false)
  }
}

const app = express();
const { createDatabase } = require("./model/CreateStructure");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(multer({storage:diskStorage,fileFilter:fileFilter}).fields([{name:"profileImage",maxCount:1}]))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRouter);
app.use(vendor);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

createDatabase(false,()=>{
    app.listen(3000, () => console.log("Burans Application Running on Port 3000"));
});
