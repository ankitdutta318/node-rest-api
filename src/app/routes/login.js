'use strict';

const loginRoutes = require('express').Router();
const {db} = require('../db');
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
        let token = null;

        // Get data from DB
        db.then((connection) => {
            return connection.query('SELECT username, usertoken, password FROM users WHERE username= ?', [username]);
        })
        .then((result) => {
            
            if(result.length < 1) {
                return res.status(401).json({
                    status : 'failed',
                    message : 'invalid username'
                });
            }

            // store token 
            token = result[0].usertoken;

            // comparing password             
            return bcrypt.compare(password, result[0].password);
        })
        .then((isValidPass) => {
            if(isValidPass) {
                res.setHeader('x-token', token);
                return res.status(200).json({
                    status: 'success',
                    message: 'login successful'
                });
            }
            else {
                console.log('Password Did Not Matched');  
                return res.status(401).json({
                    status: 'failed',
                    message: 'invalid password'
                });          
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(503).json({
                status : 'failed',
                message: 'service broken'
            });
        })
        
    })


module.exports = {
    loginRoutes
}