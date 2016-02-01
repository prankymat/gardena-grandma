var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const ROOT = __dirname;

app.get('/', function(req, res){
  res.sendFile('./static/index.html', {root: ROOT});
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


setInterval(function() {
  io.emit('internet connection status', {status:'ok'})
}, 1000);

app.use(express.static('static'));
