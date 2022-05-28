const app = require("./index");

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
