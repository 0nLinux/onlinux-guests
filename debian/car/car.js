'use strict';

var net = require('net');
var sys = require('sys');
var exec = require('child_process').exec;
/*var rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.question('Press key to start...', function(evt) {
*/
  var c = net.connect({
    host: '192.168.2.56',
    port: 15121
  }, function() {
    console.log('connected to server, waiting for hello');
  });

  c.on('data', function(data) {

    data = parseData(data.toString());

    if (data.type === 'status') {
      if (data.msg === 'hello') {
        c.write(message('status', 'init'));
      }
    }

    if (data.type === 'cmd') {
      if (data.msg === 'reqvnc') {
        console.log('Probing for VNC:');
        var vncto = setInterval(function() {
          testVNC(function(err, port) {
            if (err) {
              c.write('wait');
              if (err.message === 'EVNCDOWN') {
                return console.log('VNC not up yet...');
              } else {
                return console.log(err);
              }
            }
            c.write(message('status', 'goahead', { 'port': port }));
            clearInterval(vncto);
          });
        }, 1000);
      } // msg
    } // type
  });
  c.on('end', function() {
    console.log('disconnected from server');
  });

  function testVNC(cb) {
    var cmd = 'netstat -npl | sed -nr \'s/.*?[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+:([0-9]+).*?x11vnc/\\1/ p\'';
    exec(cmd, function(err, stdout, stderr) {
      var port;
      if (err) {
        return cb(err);
      }
      port = parseInt(stdout.toString()) || 0;
      if (port !== 0) {
        return cb(null, port);
      } else {
        return cb(new Error('EVNCDOWN'));
      }
    });
  };

  function parseData(data) {
    data = data.trim();
    try {
      console.log(data);
      return JSON.parse(data); 
    } catch (err) {
      console.log(err);
    }
  }

  function message(type, msg, data) {
    return JSON.stringify({ 
      type: type,
      data: data,
      msg: msg
    });
  };

//});
