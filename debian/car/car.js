'use strict';

var net = require('net');
var sys = require('sys');
var exec = require('child_process').exec;
var rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});


var vncup = false;
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
        testVNC(function(err, avail) {
          if (err) {
            vncup = false;

            if (err.code === 3) {
              // not running ("failed")
              avail = false;
            } else if (err.code === 127) {
              // service unit not found
              clearInterval(vncto);
              return console.log('Service unit onlinux-vnc is not installed.');
            } else {
              return console.log(err);
            }
          }
          vncup = avail;
          if (vncup) {
            c.write('goahead');
            clearInterval(vncto);
          } else {
            c.write('wait');
          }
        });
      }, 1000);
    }
  });
  c.on('end', function() {
    console.log('disconnected from server');
  });

  function testVNC(cb) {
    console.log('Probing for VNC:');
    exec('service onlinux-vnc status', function(err, stdout, stderr) {
      if (err) {
        return cb(err);
      }
      if (stdout.toString().indexOf('active (running)') > -1) {
        console.log('VNC is running');
        return cb(null, true);
      } else {
        console.log('VNC is not running');
        return cb(null, false);
      }
    });
  };
});
