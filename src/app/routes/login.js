'use strict';

const loginRoutes = require('express').Router();
// Require dependencies
const bcrypt = require('bcryptjs');
const randomString = require('randomstring');
// Require DB connection
const {db} = require('../db');
// Require validation
const {validateEmail} = require('../helpers');

loginRoutes.route('/')
    .post((req, res) => {
        let username = null;
        let email = req.body.email;
        let password = req.body.password;
        let emailExist = null;
        let conn = null;

        db
        .then((connection) => {
            conn = connection;
            return connection.query('SELECT username, password FROM users WHERE email = ?', [email]);
        })
        .then((result) => {
            if(result.length < 1) {
                emailExist = false;
            }
            username = result[0].username;
            return bcrypt.compare(password, result[0].password);
        })
        .then((isValid) => {
            if(isValid) {
                let token = randomString.generate(40);

                res.header('x-token', token);
                let insertObj = {
                    username,
                    token
                };
                conn.query('SELECT * FROM tokens WHERE username = ?', [username])
                .then((result) => {
                    if(result.length < 1) {
                        conn.query('INSERT INTO tokens SET ?', insertObj);
                    }
                    else {
                        conn.query('UPDATE tokens SET username = ?, token = ? WHERE username = ? ', [username, token, username]);
                    }
                });
                console.log('Login Successful');
                return res.status(200).json({
                    status: 'success',
                    message: 'login successful'
                });
            } else {
                return res.status(402).json({
                   status: 'failed',
                   message: 'login unsuccessful' 
                });
            }
        })
        .catch((err) => {
            if(emailExist == false) {
                return res.status(404).json({
                    status: 'failed',
                    message: 'email doesnt exist'
                });
            }
            return res.status(503).json({
                status: 'failed',
                message: 'service broken'
            });
        })
    });


module.exports = {
    loginRoutes
}