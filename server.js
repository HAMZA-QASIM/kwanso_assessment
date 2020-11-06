var app = require('./app');
var port = process.env.PORT || 4000;
var redis = require('redis');
var client = redis.createClient();

var server = app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});