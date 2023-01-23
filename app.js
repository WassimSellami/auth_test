const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const app = express();

dotenv.config();

let PORT = process.env.PORT || 3000;

app.listen(PORT, () =>{
    console.log(`Server is up and running on ${PORT}`)
});  
  

// Post request to generate JWT and sends it in response
    app.post("/user/generateToken", async(req, res) =>  {
        try{
            let jwtSecretKey = process.env.JWT_SECRET_KEY;
            let data = {
                "user_id": 12,
                time: Date()
            };
            const token = jwt.sign(data, jwtSecretKey);
            res.send(token);
        }
        catch(e){

            res.end(e.message ||e.toString());
        }
    });


// Get request containing the JWT token in the header and sends back validation resposne

app.get('/user/validateToken', (req, res) =>{
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    try{
        const token = req.headers.authorization.split(' ')[1]; 
        // Bearer token
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
            res.send("You are authenticated !");
        }else{
            return res.status(401).send(error);
        }
    }
    catch(err){
        return res.status(401).send(err);
    }
});
