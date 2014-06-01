var _ = require('underscore');
var fs = require('fs');
var PNG = require('pngjs').PNG;

module.exports = pngStash;

function pngStash(filename, cb_) {
  var cb = _.once(cb_);

  fs.createReadStream(filename)
    .on('error', function(err) { cb(err || "file read error"); })
    .pipe(new PNG())
    .on('parsed', parsed)
    .on('error', function(err) { cb(err || "png parse error"); });

  function parsed() {
    var img = this;
    var data = img.data;
    var length = data.length >> 3;

    function get(idx) {
      if (idx < 0 || idx >= length)
        throw new Error("Index out of bounds (0-" + length + ").");

      idx = idx << 3;
      var val = 0;
      for (var i = 0; i < 8; i++)
        val = (val << 1) + (data[idx + i] & 1);
      return val;
    }

    function set(idx, val) {
      if (idx < 0 || idx >= length)
        throw new Error("Index out of bounds (0-" + length + ").");

      idx = idx << 3;
      for (var i = 7; i >= 0; i--) {
        var bit = val & 1;
        val = val >> 1;
        data[idx + i] = (data[idx + i] & 0xfe) + bit;
      }
    }

    function save(cb_) {
      var cb = _.once(cb_);
      img.pack().pipe(fs.createWriteStream(filename))
        .on('error', function(err) { cb(err || "file save error"); })
        .on('finish', function() { cb(); });
    }

    function write(writeData, offset, writeLength) {
      if (!Buffer.isBuffer(writeData))
        writeData = new Buffer(writeData);

      offset = offset || 0;
      if (writeLength === undefined)
        writeLength = writeData.length;

      if (offset < 0)
        throw new Error("Negative offset.");
      if (offset + writeLength > length)
        throw new Error("Offset + write length exceeds bounds (" + offset + 
                        " + " + writeLength + " > " + length + ").");

      for (var i = 0; i < writeLength; i++)
        set(offset + i, writeData[i]);
    }

    function read(offset, readLength) {
      offset = offset || 0;
      if (readLength === undefined)
        readLength = length - offset;
      
      if (readLength + offset > length)
        throw new Error("Read length + offset exceeds bounds (" + readLength +
                        " + " + offset + " > " + length + ").");
      
      var b = new Buffer(readLength);
      for (var i = 0; i < readLength; i++)
        b[i] = get(offset + i);
      
      return b;
    }

    var accessor = {
      length: length,
      getByte: get,
      setByte: set,
      write: write,
      read: read,
      save: save
    }

    cb(null, accessor);
  }
}
