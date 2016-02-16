const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const InternetConnectionChecker = require('./internetConnectionChecker.js');
const DatabaseManager = require('./DatabaseManager.js');

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

  socket.on('retrieve histories', function() {
    dbManager.getAllHistories(function(histories) {
      io.emit('histories', histories);
    });
  });
});

var internetChecker = new InternetConnectionChecker();

internetChecker.on('checking', function() {
  io.emit('internet connection status', {status: 'checking'})
});

internetChecker.on('finished', function(status) {
  io.emit('internet connection status', status);

  if (status.status != "ok") {
    dbManager.logOffline();
  } else {
    dbManager.logOnline();
  }
});

var dbManager = new DatabaseManager();

dbManager.on('history-added', function() {
  dbManager.getAllHistories(function(histories) {
    io.emit('histories', histories);
  });
});

// regular internet connection check
setInterval(function() {
  internetChecker.check();
  // io.emit('histories', [{tfrom: "02/03/2016 15:00:00", tto: "02/03/2016 15:05:00"}, {tfrom: "02/03/2016 15:00:00", tto: "02/03/2016 15:05:00"}, {tfrom: "02/03/2016 15:00:00", tto: "02/03/2016 15:05:00"}])
}, 1000);


http.listen(80, function(){
  console.log('listening on *:80');
});

app.use(express.static('static'));
