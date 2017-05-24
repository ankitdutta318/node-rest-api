'use strict';

const mysql = require('promise-mysql');
const config = require('../config/config');

const dbDetails = config['db-config'];
module.exports = {
    db : mysql.createConnection(dbDetails)
};