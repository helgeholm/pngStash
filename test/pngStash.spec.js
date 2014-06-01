var assert = require('assert');
var fs = require('fs');

var pngStash = require(__dirname + '/../pngStash');

describe('pngStash', function() {
  it('needs to exist', function(done) {
    assert(pngStash);
    done();
  });

  it('can read a message at an offset', function(done) {
    pngStash(__dirname + '/withMessage.png', function(err, stash) {
      if (err) return done(err);
      var message = stash.read(3, 10).toString();
      assert.equal(message, "Greetings!");
      done();
    });
  });

  it('can write up to file end, and read rest-of-file from an offset', function(done) {
    var testFile = __dirname + '/writeTest.png';
    function cleanDone(err) {
      fs.unlink(testFile, function ignore() {});
      done(err);
    }
    var testMessage = new Buffer("Quite Interesting");
    fs.unlink(testFile, copyBase);
    function copyBase(_ignoreError) {
      fs.createReadStream(__dirname + '/base.png')
        .pipe(fs.createWriteStream(testFile))
        .on('close', writeSomething);
    }
    function writeSomething() {
      pngStash(testFile, function(err, stash) {
        if (err) return cleanDone(err);
        stash.write(testMessage, 3867, 5);
        stash.save(readItBack);
      });
    }
    function readItBack(err) {
      if (err) return cleanDone(err);
      pngStash(testFile, function(err, stash) {
        if (err) return cleanDone(err);
        var readed = stash.read(3867).toString();
        assert.equal(readed, "Quite");
        cleanDone();
      });
    }
  });

  it('can write and read a message with multibyte chars', function(done) {
    var testFile = __dirname + '/writeTest.png';
    function cleanDone(err) {
      fs.unlink(testFile, function ignore() {});
      done(err);
    }
    var testMessage = new Buffer("GLASS PØØP #" + Math.floor(Math.random() * 1000));
    fs.unlink(testFile, copyBase);
    function copyBase(_ignoreError) {
      fs.createReadStream(__dirname + '/base.png')
        .pipe(fs.createWriteStream(testFile))
        .on('close', writeSomething);
    }
    function writeSomething() {
      pngStash(testFile, function(err, stash) {
        if (err) return cleanDone(err);
        stash.write(testMessage);
        stash.save(readItBack);
      });
    }
    function readItBack(err) {
      if (err) return cleanDone(err);
      pngStash(testFile, function(err, stash) {
        if (err) return cleanDone(err);
        var readed = stash.read(0, testMessage.length).toString();
        assert.equal(readed, testMessage);
        cleanDone();
      });
    }
  });
});
