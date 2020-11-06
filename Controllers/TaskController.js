var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var redisClient = require('../redis')
var VerifyToken = require('../auth/VerifyToken');



router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());




router.post('/create-task',
    VerifyToken,
    async function CreateTask(req, res) {
        try {
            if (req.body.name == null || req.body.name == '') {
                req.body.name = 'empty_body';
            }
            let task = { id: null, name: req.body.name };
            redisClient.incr('tasks_count', function(err, reply) {
                task.id = reply;
                redisClient.rpush(['Tasks', JSON.stringify(task)]);
                console.log("task added");
                res.status(200).send(task);
                if (err) {
                    return res.status(500).send("There was a problem registering the task.")
                }
            })
        } catch (e) {
            res.status(500).send({ message: e });

        }


    });



router.get('/list_tasks',
    VerifyToken,
    async function GetAllTasksList(req, res, next) {
        try {
            redisClient.lrange('Tasks', 0, -1, function(error, items) {

                if (items.length != 0) {
                    console.log('items Found');
                    items = items.map(obj => JSON.parse(obj));
                    res.status(200).send({ tasks: items });
                } else {
                    console.log("Tasks does not exist");
                    res.status(500).send({ message: "Tasks does not exist" });
                }


            });

        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }

    });

module.exports = router;