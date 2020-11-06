var jwt = require('jsonwebtoken');
var config = require('../config');

function VerifyToken(req, res, next) {
    try {
        if (!req.headers.authorization)
            return res.status(403).send({ auth: false, message: 'No token provided.' });
        const parts = req.headers.authorization.split(' ');
        var token = parts[1];
        console.log('', token)


        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            }
            console.log(decoded)
            req.userId = decoded.id;
            next();

        });
    } catch (e) {

    }

}



module.exports = VerifyToken;