'use strict';
const {db} = require('../src/app/db');

 db.then((connection) => {
            return connection.query('SELECT username FROM tokens WHERE token = ?', [token]);
        }).then((result) => {
            console.log(result);
        });
