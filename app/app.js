var express = require('express');
var app = express();
var http = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/static/signUp.html');
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/static/login.html');
});

app.get('/home', function(req, res) {
    res.sendFile(__dirname + '/static/findClasses.html');
});


app.use(express.static(__dirname + '/static'));

http.listen(3000, function() {
   console.log('listening on *:3000'); 
});