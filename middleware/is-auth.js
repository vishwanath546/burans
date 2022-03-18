const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = (request,response,next)=>{

    let authorization = request.get("Authorization");

    if(authorization){

        let token = authorization.split(' ')[1];
        let decodeToken;
        try{
            decodeToken = jwt.verify(token,process.env.JWT_SECRET)
        }catch (e) {
           return response.status(500).json({
                body: e
            })
        }

        if(!decodeToken){
            return response.status(200).json({
                status: 201,
                body: "Not authenticated"
            })
        }
        request.userId = decodeToken.userId;
        next();
    }else{
        return response.status(401).json({
            body: "Not authenticated"
        })
    }

}
