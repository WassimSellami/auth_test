const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const util = require('util');
const bodyParser = require('body-parser');  
const cookieParser = require("cookie-parser");
const nodemailer = require('nodemailer');

const app = express();
let PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();


var transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'wassim.sellami@supcom.tn',
    pass: process.env.OUTLOOK_PASSWORD
  }
});


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

//checks if the token is valid.
const authorization = (req, res, next) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = req.cookies.token;
    if (!token) {
      return res.sendStatus(403);
    }
    try {
      const data = jwt.verify(token, jwtSecretKey);
      req.username = data.username;
      req.is_present = data.is_present;
      req.time = data.time;
      return next();
    } catch {
      return res.sendStatus(403);
    }
  };

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
        // Creating jwt token
        token = jwt.sign(userData, jwtSecretKey);

    } catch (err) {
        console.log(err);
        const error = new Error("Error! Something went wrong.");
        return next(error);
    }
    sendEmail("User Login", user.username);
    return res.
    cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .send({
        "message" : "Logged in successfully !"
    });
})

// Getting protected info by token
app.get('/user/get_protected_info', authorization,(req, res) =>{        
            let data = {
                "username":req.username,
                "is_present": req.is_present,
                "time":req.time
            };
            let response ={
                "success" : true,
                "data": data,
                "message": "You are authorized !"
            }
            return res.status(200).send(response);
       
});

// Logout: removing cookie.
app.get("/user/logout", authorization,  (req, res) => {
    sendEmail("User Logout", req.username);
    return res
      .clearCookie("token")
      .status(200)
      .send({ "message": "Successfully logged out !"});
  });


function sendEmail(subject, username){
  let mailOptions = {
    from: process.env.SENDER,
    to: process.env.RECEIVER,
    subject: subject,
    text: "User : "+username+"\n\n\nSent from a NodeJS server."
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}