var express = require('express');
var app = express();

//binding the controllers
var UserController = require('./Controllers/UserController');
var TaskController = require('./Controllers/TaskController');

app.use('/', UserController);
app.use('/', TaskController)

module.exports = app;