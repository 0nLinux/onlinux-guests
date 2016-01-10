'use strict';

var net = require('net');
var sys = require('sys');
var exec = require('child_process').exec;

/*var c = net.connect({
  host: '192.168.2.56',
  port: 15121
}, function() {
  console.log('connected to server, sending init');
  c.write('init');
});

c.on('data', function(data) {
  console.log(data.toString());
  if (data.toString() === 'reqvnc') {

  }
});
c.on('end', function() {
  console.log('disconnected from server');
});*/

function testXserver() {
  exec('xset q', function(err, stdout, stderr) {
    if (err) {
      console.log('exec err:');
      return console.log(err);
    }
    console.log(stdout);
  });
};

testXserver();
