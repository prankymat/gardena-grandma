function InternetConnectionChecker() {
  const EventEmitter = require('events').EventEmitter;
  const isOnline = require('is-online');

  var ee = new EventEmitter();

  ee.check = function() {
    // Invoke check
    ee.emit('checking');

    isOnline(function(err, online) {
      // do internet connection check
      var status = {status: online === true ? 'ok' : 'disconnected'};

      // notifies when check is done
      ee.emit('finished', status);
    });
  };

  return ee;
}

module.exports = InternetConnectionChecker;
