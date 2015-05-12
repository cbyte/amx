var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(2222)
console.log('Listening on Port 2222.')


app.get('/', function(req,res){
	res.sendFile(__dirname + '/public/index.html');
})

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  socket.on('orientation', function (data) {
    console.log('received orientation data');
    console.dir(data);
  });
});