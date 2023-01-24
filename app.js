const express = require('express')
var mysql = require('mysql');
const app = express()
var bodyParser = require('body-parser');  
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const port = process.env.PORT || 3000;


var con = mysql.createConnection({
  host: "sql8.freemysqlhosting.net",
  user: "sql8592135",
  password: "yqLrSE3zLc",
  database: "sql8592135"
});



con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});


// Reach RAS home page
app.get('/', (req, res) => {
    res.send("Welcome to RAS Home Page !");
});


// Get list of presence(list of username)
app.get('/get_presence_list', (req, res) => {

    var sql = "SELECT username FROM user where is_present = ?"
    con.query(sql,[1], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
})


// Get user by code
app.post('/get_user', (req, res, next) => {
    var sql = "SELECT * FROM user where code = ?";
    var code = req.body.code;
    con.query(sql, [code], function (err, result) {
        if (err) throw err;
        if(result.length>0){
            console.log(result);
            let user = result[0];
            let data = {
                "username": user.username, 
                "is_present": user.is_present
            }
            result = {
                "success" : true,
                "data": data
            }
        }else{
            result = {
                "success": false,
            }
        }
        res.send(result);
    });
})


// Update The presence status of a user by code
app.patch('/set_presence', function (req, res) {
    let code = req.body.code;
    let new_presence = req.body.is_present;
    let sql = "UPDATE user SET is_present = ? where code = ?";
    con.query(sql, [new_presence, code], (err, result) => {
        if (err){
            result = {
                "success" : false,
                "message": "Update failed !"
            }
            throw err;
        } else{
            result = {
                "success" : true,
                "message": "User updated successfully !"
            }
        }
        res.send(result);
    });
  });





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})