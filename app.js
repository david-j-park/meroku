var express = require('express');

var app = express();

app.get('/', function(req, res){
    res.send("Hello, world!");
});

app.listen(process.env.PORT);
console.log('Server listening on port ' + process.env.PORT);