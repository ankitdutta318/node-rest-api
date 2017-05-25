'use strict';

// require all the packages
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// require the config file

const configs = require('./app/config/config');

// require the routes
const {userRoutes} = require('./app/routes/users'); // using ES6 destructuring
const {loginRoutes} = require('./app/routes/login'); // using ES6 destructuring

const isValidToken = require('./app/middlewares/validateToken').validateToken;

const port = process.env.PORT || 3000;
const environment  = process.env.NODE_ENV;

const app = express();

// all the middlewares goes here
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
// use Morgan to print all the route logs with time taken to serve
app.use(morgan('dev'));

// routes here 

app.use('/users', isValidToken, userRoutes);
app.use('/login', loginRoutes);

app.listen(port, () => {
    console.log('running at port : ', port);
})