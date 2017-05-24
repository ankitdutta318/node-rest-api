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
    // Route to 'GET' an user details
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

    // Route to 'UPDATE' an user details
    .patch((req, res) => {
        let paramUsername = validateUsername(req.params.username);
        let usernameTC = validateUsername(req.body.username) || null;
        let emailTC = req.body.email || null;
        let passwordTC =  req.body.password || null;

        let updateFields = {};

        if(paramUsername.length < 5) {
            return res.status(422).json({
                status: 'failed',
                message: 'username too small'
            });
        }
        
        if(usernameTC.length < 5) {
            return res.status(422).json({
                status : 'failed',
                message : 'invalid username or username too small.'
            });
        }   
        if(!emailTC || !validateEmail(emailTC)) {
            return res.status(422).json({
                status: 'Failed',
                message: 'Invalid email.'
            });
        }      
        if(passwordTC.length < 5) {
            return res.status(422).json({
                status : 'failed',
                message : 'password too small.'
            });
        } 

        updateFields.username = usernameTC;
        updateFields.email = emailTC;
        updateFields.password = passwordTC;
        
        // If request contains nothing to update
        if(Object.keys(updateFields).length === 0 && updateFields.constructor === Object) {
            return res.status(200).json({
                status : 'success',
                message : 'nothing to update.'
            });
        }
        
        db.then((connection) => {
            return connection.query('UPDATE users SET username = ?, email = ?, password = ? WHERE username = ?', [updateFields.username, updateFields.email, updateFields.password, paramUsername]);
        }).then(function (result){
            console.log(process(result));
            console.log(result);
            return res.status(200).json({
                status: 'success',
                message: 'user details successfully updated.'
            });
        })
        .catch((err) => {
            if(err.code === 'ER_DUP_ENTRY') {
                console.log('duplicate username sent');
                return res.status(409).json({
                    status : 'failed',
                    message : 'username already taken.'
                });
            }
            console.log(err);
            return res.status(503).json({
                status : 'Failed',
                message : 'Service broken'
            });
        });   
    })

    // Route to 'DELETE' a particular user from DB
    .delete((req, res) => {
        let username = validateUser(req.params.username);
        if(username.length < 5) {
            res.status().json(422).json({
                status: 'Failed',
                message: 'Invalid username.'
            });
        }

        db.then((connection) => {
            return connection.query('DELETE form users WHERE username=?', [username]);
        }).then((result) => {
            console.log(result);
            res.status(200).json({
                status: 'success',
                message: 'User successfully deleted.'
            });
        })
        .catch((err) => {
            return res.status(503).json({
                status : 'Failed',
                message : 'Service broken'
            });
        })
    });



module.exports = {
    userRoutes
}
