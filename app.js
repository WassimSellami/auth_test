const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const app = express();

dotenv.config();

let PORT = process.env.PORT || 3000;

app.listen(PORT, () =>{
    console.log(`Server is up and running on ${Port}`)
});  
  

// Post request to generate JWT and sends it in response
    app.post("user/generateToken", async(req, res) =>  {
        try{
            
        }
        catch(e){
            res.end(e.message ||e.toString());
        }
    });

app.post('/test', async function (req, res) {
    try {  
      const user = 'User';
      const query = 'SELECT [Password] as password FROM [Table] where [User] = ' + SqlString.escape(user);
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .query(querys);
      const password = result.recordset[0].password;
      console.log(password);
      res.end(password);
    } catch (e) {
      res.end(e.message || e.toString());
    }
  });