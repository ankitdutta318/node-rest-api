'use strict';

const userRoutes = require('express').Router();
const bcrypt = require('bcryptjs');
// Require DB connection 
const {db} = require('../db');
// require helpers to sanitize username and password
const {validateEmail, validateUsername, makeToken} = require('../helpers');

let conn = null;

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
        let paramUsername = req.params.username;
        let newUsername =  req.body.username || null;
        let newEmail = req.body.email || null;
        let newPassword =  req.body.password || null;
        let conn = null;

        let token = req.header('x-token');

        let updateFields = [];

        if(paramUsername.length < 5) {
            return res.status(422).json({
                status: 'failed',
                message: 'username too small'
            });
        }
        
        if(newUsername){
            if(validateUsername(newUsername).length < 5) {
                    return res.status(422).json({
                    status : 'failed',
                    message : 'invalid username or username too small.'
                });
            }
            updateFields.push(`username = '${newUsername}'`);   
        }   

        if(newEmail) {
            if(!newEmail || !validateEmail(newEmail)) {
                return res.status(422).json({
                    status: 'Failed',
                    message: 'Invalid email.'
                });
            }
            updateFields.push(`email = '${newEmail}'`);
        }
        
        if(newPassword) {
        if(newPassword.length < 5) {
            return res.status(422).json({
                status : 'failed',
                message : 'password too small.'
            });
        } 
        updateFields.push(`password = '${newPassword}'`);
        }              

        console.log(updateFields);
        // If request contains nothing to update
        if(updateFields.length < 1) {
            return res.status(200).json({
                status : 'success',
                message : 'nothing to update.'
            });
        }

        let authenticatedUser = null;
        let updateQuery = 'UPDATE users SET ';
        updateQuery += updateFields.join(', ');
        updateQuery += `WHERE username = '${paramUsername}'`;

        console.log(updateQuery);     
        
        db.then((connection) => {
            conn = connection;
            conn.query('SELECT * FROM tokens WHERE token = ? ', [token])
            .then((result) => {
                if(result[0].username != paramUsername) {
                    authenticatedUser = false;
                }
            });
            
            return connection.query(updateQuery);
        }).then((result) => {
            //console.log(result);
            if(!authenticatedUser) {
                return res.status(401).json({
                    status: 'failed',
                    message: 'not authorized to change user details'
                });
            }
            if(result.changedRows === 0) {
                console.warn( '**PATCH /users' + req.url + ' : Nothing changed in DB as username does not exists');
                return res.status(401).json({
                    status: 'failed',
                    message: 'nothing to update'
                });
            }

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
        let username = validateUsername(req.params.username);
        let token = req.header('x-token');
        if(username.length < 5) {
            res.status().json(422).json({
                status: 'Failed',
                message: 'Invalid username.'
            });
        }

       

        db.then((connection) => {
            return connection.query('DELETE FROM users WHERE username=? AND usertoken=?', [username, token]);
        }).then((result) => {
            if(result.changedRows === 0) {
                console.warn( '**DELETE /users' + req.url + ' : Nothing changed in DB as username or token does not exists');
                return res.status(401).json({
                    status: 'failed',
                    message: 'invalid username or invalid token'
                });
            }
            res.status(200).json({
                status: 'success',
                message: 'User successfully deleted.'
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(503).json({
                status : 'Failed',
                message : 'Service broken'
            });
        })
    });


module.exports = {
    userRoutes
}
