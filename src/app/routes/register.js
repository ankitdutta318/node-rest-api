'use strict';

const registerRoutes = require('express').Router(); 
const bcrypt = require('bcryptjs');
// Require DB connection
const {db} = require('../db');
// Require validation file
const {validateUsername, validateEmail, makeToken} = require('../helpers');

registerRoutes.route('/')
    .post((req, res) => {
        
        // catch all the form data here 
        let username    = req.body.username || null;
        let email       = req.body.email || null;
        let password    = req.body.password || null; 
        let userToken   = makeToken();

        if(!username || username.length < 5) {
            return res.status(422).json({
                status : 'failed',
                message : 'invalid username'
            });
        }

        if(!email || !validateEmail(email)) {
            return res.status(422).json({
                status : 'failed',
                message : 'invalid email'
            });
        }

        if(!password || password.length < 5) {
            return res.status(422).json({
                status : 'failed',
                message : 'password too small'
            });
        }

        // sanitize the username sent by client
        username = validateUsername(username);
        
        

        // hash the password 
        bcrypt.genSalt(10)
        .then((salt) => {
            return bcrypt.hash(password, salt);
        })
        .then((hashedPassword) => {
            // construct the user object 
            let user = {
                username,
                email,
                password : hashedPassword,
                usertoken : userToken
            };

            // insert into db
            db.then((connection) => {
                return connection.query('INSERT INTO users SET ?', user);
            }).then((result) => {
                return res.status(200).json({
                    status : 'success',
                    message : 'Value successfully inserted into DB'
                });
            })
            .catch((err) => {
                if(err.code === 'ER_DUP_ENTRY') {
                    console.log('Duplicate username sent');
                    return res.status(409).json({
                        status : 'failed',
                        message : 'username already taken'
                    });
                }
                console.log(err);
                return res.status(503).json({
                    status : 'failed',
                    message : 'service broken'
                });
            });
        })
    });


    module.exports = {
        registerRoutes
    }
