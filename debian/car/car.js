'use strict';

var net = require('net');
var sys = require('sys');
var exec = require('child_process').exec;
var rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.question('Press key to start...', function(evt) {

  var c = net.connect({
    host: '192.168.2.56',
    port: 15121
  }, function() {
    console.log('connected to server, sending init');
  });

  c.on('data', function(data) {
    console.log(data.toString());
    var cmd = data.toString().trim();
    console.log(cmd.length);
    if (cmd === 'hello') {
      c.write('init');
    }
    if (cmd === 'reqvnc') {
      var vncto = setInterval(function() {
        testVNC(function(err, port) {
          if (err) {
            c.write('wait');
            if (err.toString() === 'EVNCDOWN') {
              return console.log('VNC not up yet...');
            } else {
              return console.log(err);
            }
          }
          c.write('goahead');
          clearInterval(vncto);
        });
      }, 1000);
    }
  });
  c.on('end', function() {
    console.log('disconnected from server');
  });

  function testVNC(cb) {
    console.log('Probing for VNC:');
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

});
