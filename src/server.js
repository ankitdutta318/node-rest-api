'use strict';

// require all the packages
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// require the config file

const configs = require('./app/config/config');

const port = process.env.PORT || 3000;
const environment  = process.env.NODE_ENV;

const app = express();

// all the middlewares goes here
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.listen(port, () => {
    console.log('running at port : ', port);
})