var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var VerifyToken = require('../auth/VerifyToken');
var redisClient = require('../redis')



router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());



router.post('/register',
    async function RegisterUser(req, res) {
        try {
            var hashedPassword = bcrypt.hashSync(req.body.password, 8);
            let user = { id: null, email: req.body.email, password: hashedPassword };
            //Already exist check
            redisClient.lrange('Users', 0, -1, function(error, items) {
                if (items.length != 0 && items.find(item => JSON.parse(item).email == user.email) != null) {
                    console.log("email already exist");
                    res.status(500).send({ message: "email already exist" });
                } else {
                    console.log("email not exist");
                    //Add new user
                    redisClient.incr('users_count', function(err, reply) {
                        user.id = reply;
                        redisClient.rpush(['Users', JSON.stringify(user)]);
                        console.log("User added");
                        delete user.password;
                        res.status(200).send(user);
                    })
                }
            })
        } catch (e) {
            res.status(500).send({ message: e });

        }





    });

router.post('/login',
    async function Login(req, res) {
        try {
            let user = { email: req.body.email, password: req.body.password };

            //Already exist check
            redisClient.lrange('Users', 0, -1, function(error, items) {
                if (items.length != 0) {
                    let FoundUser = items.find(item => JSON.parse(item).email == user.email);
                    if (FoundUser != null) {
                        var isPasswordValid = bcrypt.compareSync(req.body.password, JSON.parse(FoundUser).password);
                        if (!isPasswordValid) {
                            return res.status(500).send({ message: "Password you entered is incorrect" });
                        } else {
                            var token = jwt.sign({ id: JSON.parse(FoundUser).id }, config.secret, {
                                expiresIn: 86400 // expires in 24 hours
                            });
                            res.status(200).send({ jwt: token });
                        }
                    } else {
                        console.log("email does not exist");
                        res.status(500).send({ message: "email does not exist" });
                    }

                }


            })
        } catch (e) {
            res.status(500).send({ message: e });

        }


    });


router.get('/user',
    VerifyToken,
    function GetLoggedInUser(req, res, next) {

        try {
            redisClient.lrange('Users', 0, -1, function(error, items) {
                if (items.length != 0) {
                    //sending Logged In User Data
                    let FoundUser = JSON.parse(items.find(item => JSON.parse(item).id == req.userId));
                    if (!!FoundUser) {
                        delete FoundUser.password;
                        res.status(200).send(FoundUser);
                    }

                } else {
                    console.log("User does not exist");
                    res.status(500).send({ message: "Internal server error" });
                }

            });
        } catch (e) {
            res.status(500).send({ message: e });

        }

    });




module.exports = router;