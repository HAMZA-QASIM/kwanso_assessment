var redis = require('redis');
var redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log('connected');
});
redisClient.on('error', function() {
    console.log('error on ')
})
module.exports = redisClient;