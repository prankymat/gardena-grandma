function DatabaseManager() {
  const EventEmitter = require('events').EventEmitter;
  const moment = require('moment');
  var cutoff = moment();
  var ee = new EventEmitter();
  var db = initDB();

  function initDB() {
    var fs = require("fs");
    var file = __dirname + "/" + "history.db"
    var exists = fs.existsSync(file);

    if(!exists) {
      console.log("Creating DB file.");
      fs.openSync(file, "w");
    }

    var sqlite3 = require("sqlite3").verbose();
    var db = new sqlite3.Database(file);

    db.serialize(function() {
      if(!exists) {
        db.run("CREATE TABLE Histories (tfrom DATETIME PRIMARY KEY, tto DATETIME)");
      }
    });

    return db;
  }

  ee.logOnline = function() {
    cutoff = moment();
  }

  ee.logOffline = function() {
    var now = moment();

    if ((now - cutoff) > 1000) {
      db.run("INSERT OR REPLACE INTO Histories (tfrom, tto) VALUES (?, ?)", [cutoff.format(),now.format(),])
      ee.emit('history-added');
    }
  };

  ee.getAllHistories = function(callback) {
    db.all("SELECT * FROM Histories", function(err, rows) {
      callback && callback(rows);
    })
  };
  return ee;
}

module.exports = DatabaseManager;
