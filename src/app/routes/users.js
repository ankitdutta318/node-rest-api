'use strict';

const userRoutes = require('express').Router();
// Require DB connection 
const {db} = require('../db');
// require helpers to sanitize username and password
const {validateEmail, validateUsername } = require('../helpers');

userRoutes.route('/')
    .get((req, res) => {
        db.then((connection) => {
            return connection.query('SELECT * FROM users');
        }).then((result) => {
            if(result.length < 1) {
                return res.status(404).json({
                    status : 'failed',
                    message : 'data not found'
                });
            }
            return res.status(200).json({
                status : 'success',
                data : result
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(503).json({
                status : 'failed',
                message : 'service broken'
            });
        });    
    })
    .post((req, res) => {

        // catch all the form data here 
        let username    = req.body.username || null;
        let email       = req.body.email || null;
        let password    = req.body.password || null; 

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
        
        // construct the user object 
        let user = {
            username,
            email,
            password        
        };

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
    });

userRoutes.route('/:username')
    .get((req, res) => {
        db.then((connection) => {
            return connection.query('SELECT * FROM users where username = ?', [req.params.username]);
        }).then((result) => {
            if(result.length < 1) {
                return res.status(404).json({
                    status : 'failed',
                    message : 'user not found'
                });
            }
            return res.status(200).json({
                status : 'success',
                data : result
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(503).json({
                status : 'failed',
                message : 'service broken'
            });
        }); 
    })
    .patch((req, res) => {
        let username = req.params.username || null;
        let email = req.params.email || null;
        let password =  req.params.password || null;

        let updateField = {};
        var username = validateUsername(username);
        
        if(username && username > 5)    updateField.username    = username;
        if(email || null)       updateField.email       = email;
        if(password || null)    updateField.password    = password;
        db.then((connection) => {


            if(updateField == null) {
                return res.status(200).json({
                    status : 'success',
                    message : 'Nothing to update.'
                });
            } else {
                return connection.query('');
            }   
        })
        res.status(200).json({
            status: 'success',
            message: 'ok'
        });
    })
    .delete((req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'ok'
        });
    });



module.exports = {
    userRoutes
}
