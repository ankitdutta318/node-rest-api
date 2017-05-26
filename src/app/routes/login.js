'use strict';

const loginRoutes = require('express').Router();
const {db} = require('../db');
const randomString = require('randomstring');
const bcrypt = require('bcryptjs');
const {validateEmail, validateUsername, makeToken} = require('../helpers');

loginRoutes.route('/')
    .post((req, res) => {
        // Catch all form data
        let username = req.body.username;
        var password = req.body.password;
        //let token = makeToken();

        if(!username || username.length < 5) {
            return res.status(422).json({
                status: 'failed',
                message: 'invalid username'
            });
        }

        if(!password || password.length < 5) {
            return res.status(422).json({
                status: 'failed',
                message: 'password too small'
            });
        }

        // Sanitize username
        username = validateUsername(username);
        let conn = null;
        let token = null;

        // Get data from DB
        db.then((connection) => {
            conn = connection;
            return connection.query('SELECT username, usertoken, password FROM users WHERE username= ?', [username]);
        })
        .then((result) => {
            
            if(result.length < 1) {
                return res.status(401).json({
                    status : 'failed',
                    message : 'invalid username'
                });
            }

            // comparing password             
            return bcrypt.compare(password, result[0].password);
        })
        .then((isValidPass) => {
            if(!isValidPass) {
                console.log('Password Did Not Matched');  
                return res.status(401).json({
                    status: 'failed',
                    message: 'invalid password'
                }); 
            }
            
            // create a new token 
            token = randomString.generate(40);
            res.setHeader('x-token', token);            

            // insert the token in the token DB
            conn.query('INSERT INTO tokens SET ?', {
                username,
                token
            });
            
            // send success response with token in the heder of response
            return res.status(200).json({
                status: 'success',
                message: 'login successful'
            });  
        })
        .catch((err) => {
            console.log(err);
            return res.status(503).json({
                status : 'failed',
                message: 'service broken'
            });
        })
        
    });


module.exports = {
    loginRoutes
}