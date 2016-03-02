function humanifyTimeDiff(a, b) {
  var seconds = b.diff(a, 'seconds');
  var r_seconds = seconds % 60;
  var minutes = Math.trunc(seconds/60);

  var r_minutes = minutes % 60;
  var hours = Math.trunc(minutes/60);
  if (hours > 0) {
    if (r_minutes == 0) {
      return hours + " hours";
    } else if (r_seconds == 0) {
      return hours + " hours and " + r_minutes + " minutes";
    } else {
      return hours + " hours and " + r_minutes + " minutes and " + r_seconds + " seconds";
    }
  } else if (r_seconds == 0) {
    return minutes + " minutes";
  } else if (minutes == 0) {
    return seconds + " seconds";
  } else {
    return minutes + " minutes and " + r_seconds + " seconds";
  }
}

function addHistory(history, element) {
  var table = document.getElementById(element);
  var row = table.insertRow();

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);

  var tfrom = moment(history.tfrom);
  var tto = moment(history.tto);

  cell1.innerHTML = tfrom.format('L');
  cell2.innerHTML = tfrom.format('HH:mm:ss') + ' - ' + tto.format('HH:mm:ss');
  cell3.innerHTML = humanifyTimeDiff(tfrom,tto);
};

var socket = io();

function getStatusLight(color) {
  color || (color = '#e74c3c');
  return '<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="' + color + '"/>OK</svg>'
}

// returns human readable time string (24hrs)
Date.prototype.timeNow = function () {
  return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

socket.on('internet connection status', function(msg){
  // got status update from server
  $("#connection_status").html(getStatusLight({'ok': '#29b463', 'checking': '#f1c615'}[msg.status]));
  $("#connection_timestamp").text(new Date().timeNow());
});

socket.on('disconnect', function() {
  // disconnected with server
  $("#server_connection_failed").show();
  $("#ICC_body").hide();
});

socket.on('reconnect', function() {
  // reconnect was successful
  $("#server_connection_failed").hide();
  $("#ICC_body").show();
});

socket.on('connect', function(){
  $(document).ready(function() {
    socket.emit('retrieve histories');
  });
});

socket.on('histories', function(histories) {
  $("#all-offline-history tr:not(#head)").remove();
  histories.reverse();
  $("#all_count").text(histories.length);
  for (var history in histories) {
    addHistory(histories[history], "all-offline-history");
  }
});

$("#check_internet_connection").click(function(){
  socket.emit('check internet connection');
});

$("#reload_table").click(function() {
  socket.emit('retrieve histories');
});
