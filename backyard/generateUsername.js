'use strict';
const {db} = require('../src/app/db');

let generateUsername =  (fname, lname) => {
        let username = fname + '-' + lname + '-';
        db
        .then((connection) => {
            return connection.query('SELECT COUNT(*) AS name_count FROM users WHERE f_name = ? AND l_name = ?', [fname, lname]);
        })
        .then((result) => {
            return username += result[0].name_count;
        })
};

console.log(generateUsername('ashu', 'dutta'));

