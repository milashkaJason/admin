const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
const base_url = "/api/users"

const app = express();

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

const jsonParser = express.json();

const mongoClient = new MongoClient("mongodb://localhost:9999/", { useUnifiedTopology: true });

let dbClient;

app.use(express.static(__dirname + "/public"));

mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("usersdb").collection("users");
    app.listen(8888, function(){
        console.log("Сервер ожидает подключения...");
    });
});

app.get(`${base_url}`, function(req, res){

    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, users){

        if(err) return console.log(err);
        res.send(users)
    });

});

app.get(`${base_url}:id`, function(req, res){

    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, user){
        console.log('here')

        if(err) return console.log(err);
        res.send(user);
    });
});

app.post(`${base_url}`, jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);

    const userName = req.body.name;
    const userAge = req.body.age;
    const user = {name: userName, age: userAge};

    const collection = req.app.locals.collection;
    collection.insertOne(user, function(err, result){

        if(err) return console.log(err);
        res.send(user);
    });
});

app.delete(`${base_url}:id`, function(req, res){

    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){

        if(err) return console.log(err);
        let user = result.value;
        res.send(user);
    });
});

app.put(`${base_url}`, jsonParser, function(req, res){

    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const userName = req.body.name;
    const userAge = req.body.age;

    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {age: userAge, name: userName}},
        {returnOriginal: false },function(err, result){

            if(err) return console.log(err);
            const user = result.value;
            res.send(user);
        });
});

// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});