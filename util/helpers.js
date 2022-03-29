const path = require('path');
const fs = require('fs');

exports.clearImage = imagePath => {
    let filePath = path.join(__dirname, '..', imagePath);
    fs.unlink(filePath, error => {
        if(error) console.log("Failed to delete image at update",error)
    })
}
