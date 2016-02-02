const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const InternetConnectionChecker = require('./internetConnectionChecker.js')

const ROOT = __dirname;

app.get('/', function(req, res){
  res.sendFile('static/index.html', {root: ROOT});
});

io.on('connection', function(socket){
  console.log('a user connected');

  // client request for an internet connection check
  socket.on('check internet connection', function() {
    internetChecker.check();
  });
});

var internetChecker = new InternetConnectionChecker();

internetChecker.on('checking', function() {
  io.emit('internet connection status', {status: 'checking'})
});

internetChecker.on('finished', function(status) {
  io.emit('internet connection status', status)
});


// regular internet connection check
setInterval(function() {
  internetChecker.check();
}, 1000);


http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.use(express.static('static'));
