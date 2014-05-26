#!/usr/bin/env node

var fs = require('fs');

var pngStash = require(__dirname + '/../pngStash');

if (process.argv.length < 3) {
  console.log("Usage:");
  console.log(process.argv[0], process.argv[1], "FILE.PNG");
  console.log("Read data will be written to STDOUT.");
  process.exit(1);
}

var filename = process.argv[2];

pngStash(filename, function(err, stash) {
  if (err) throw new Error(err);
  var msgLenData = stash.read(0, 3);
  var msgLen = msgLenData[0] * 65536 + msgLenData[1] * 256 + msgLenData[2];
  if (3 + msgLen > stash.length) {
    console.log("No message detected in PNG file.");
    process.exit(2);
  }
  var data = stash.read(3, msgLen);
  process.stdout.write(data);
});
