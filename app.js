const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bodyParser = require('body-parser');  
// const { query } = require('express');
const util = require('util');

const app = express();
let PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();


var con = mysql.createConnection({
    host: "sql8.freemysqlhosting.net",
    user: "sql8592135",
    password: "yqLrSE3zLc",
    database: "sql8592135"
  });
const query = util.promisify(con.query).bind(con);

  
  con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
  });
  

app.listen(PORT, () =>{
    console.log(`Server is up and running on ${PORT}`)
});  


// Login in post method generating JWT and returning it with additionnal user data
app.post('/user/login', async (req, res, next) => {
    var sql = "SELECT * FROM user where code = ?";
    var code = req.body.code;
    try {
        queryResult = await query(sql, [code]);
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    }
    // if (!existingUser || existingUser.password != password) {
    if (!queryResult) {
        const error = Error("Wrong details please check at once");
        return next(error);
    }
    let token;
    let user = queryResult[0];
    try {
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        userData = {
            "username": user.username,
            "is_present": user.is_present,
            time: Date()
        };
        //Creating jwt token
        token = jwt.sign(userData, jwtSecretKey);

    } catch (err) {
        console.log(err);
        const error = new Error("Error! Something went wrong.");
        return next(error);
    }
    res.status(200).send({
        "success": true,
        "token": token
    });
}),

// Get request containing the JWT token in the header and sends back validation resposne
app.get('/user/validate_token', (req, res) =>{
    
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    try{
        const token = req.headers.authorization.split(' ')[1]; 
        // Bearer token
        if(!token){ 
            response = {
                "success":false,
                "message": "Error! Token was not provided."
            }
            return res.status(200).send(response);
        }

        const verifiedToken = jwt.verify(token, jwtSecretKey);
        console.log(verifiedToken);
        if(verifiedToken){
            let data = {
                "username":verifiedToken.username,
                "is_present": verifiedToken.is_present,
                "time":verifiedToken.time
            };
            let response ={
                "success" : true,
                "data": data,
                "message": "You are authenticated !"
            }
            return res.status(200).send(response);
        }
        response = {
            "success" : false,
            "message": "Invalid Token !"
        }
        return res.status(200).send(response);
    }
    catch(err){
        console.log("catch");
        return res.status(401).send(err);
    }
});
