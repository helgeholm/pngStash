#!/usr/bin/env node

var fs = require('fs');

var pngStash = require(__dirname + '/../pngStash');

if (process.argv.length < 3) {
  console.log("Usage:");
  console.log(process.argv[0], process.argv[1], "FILE.PNG");
  console.log("Data to write will be read from STDIN.");
  process.exit(1);
}

var filename = process.argv[2];

pngStash(filename, function(err, stash) {
  if (err) throw new Error(err);
  var writtenLength = 0;
  process.stdin.on('data', function (data) {
    stash.write(data, 3 + writtenLength, data.length);
    writtenLength += data.length;
  });
  process.stdin.on('end', function () {
    var b0 = writtenLength >> 16;
    var b1 = (writtenLength >> 8) & 0xff;
    var b2 = writtenLength & 0xff;
    stash.setByte(0, b0);
    stash.setByte(1, b1);
    stash.setByte(2, b2);
    stash.save(function(err) {
      if (err) throw new Error(err);
      console.log(writtenLength + " bytes stored");
    });
  });
});
