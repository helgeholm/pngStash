# png-stash

[![NPM](https://nodei.co/npm/png-stash.png)](https://nodei.co/npm/png-stash/)

A very low level tool to read and write a message in the least
significant bits of a PNG image's pixels.

Also contains two command-line programs `bin/readfile.js` and
`bin/writefile.js` to read and write data up to 16777215 characters in
length.  These will print usage instructions when executed.

## Quick Example 1: Write Data

```javascript
var pngStash = require('png-stash');

var stash = pngStash('avatar.png', function(err, stash) {
    if (err) throw new Error(err);

    stash.write("Code underpants is go. Make it so.");
    stash.save(finished);

    function finished(err) {
        if (err) throw new Error(err);
        console.log("Message stored!");
    }); 
});
```

## Quick Example 2: Read Data

```javascript
var pngStash = require('png-stash');

var stash = pngStash('avatar.png', function(err, stash) {
    if (err) throw new Error(err);

    var message = stash.read(0, 34); // 34 is length of message from example 1.

    console.log(message);
});
```

<a name="download" />
## Download

For [Node.js](http://nodejs.org/), use [npm](http://npmjs.org/):

    npm install png-stash

## Documentation

### Constructor

* [pngStash](#pngStash)

### Instance Functions

* [getByte](#getByte)
* [setByte](#setByte)
* [read](#read)
* [write](#write)
* [save](#save)

-----------------------------------

<a name="pngStash" />
## pngStash(pngFileName, callback)

Reads the specified PNG file and yields a reader-writer object with
the following properties:

* length - Total number of bytes that can be hidden in this PNG file.
* getByte()
* setByte()
* write()
* read()
* save()

See below for function documentation.

__Arguments__

* pngFileName - Must be an existing valid PNG file.
* callback - `function(err, stash)`.  If PNG file was successfully loaded, `err` will be `undefined`.  `stash` will be reader-writer object mentioned in description above.

__Example__

```javascript
var pngStash = require('png-stash');

pngStash("test.png", function(err, stash) {
  console.log("Available bytes: " + stash.length);
});
```

-----------------------------------

<a name="getByte" />
## stash.getByte(index)

Reads a single byte from the "invisible" bits of the PNG file.

__Arguments__

* index - Position among all bytes composed by the PNG's "invisible" bits.  Must be less than the `pngStash` instance's `length` property.

__Example__

```javascript
var pngStash = require('png-stash');

pngStash("comic.png", function(err, stash) {
  var b1 = stash.getByte(1000);
  var b2 = stash.getByte(2000);
  var b3 = stash.getByte(3000);
  if (b1 == 0xaa && b2 == 0x44 && b3 == 0xff) {
    console.log("Watermark detected!");
  } else {
    console.log("No watermark detected.");
  }
});
```

-----------------------------------

<a name="setByte" />
## stash.setByte(index, value)

Writes a single byte to the "invisible" bits of the PNG, but does not
save it to disk.  To save, call `save()`.

__Arguments__

* index - Position among all bytes composed by the PNG's "invisible" bits.  Must be less than the `pngStash` instance's `length` property.
* value - Byte to store.  Must be an integer in the 8-bit range (`0 < value < 256`).

__Example__

```javascript
var pngStash = require('png-stash');

pngStash("comic.png", function(err, stash) {
  stash.setByte(1000, 0xaa);
  stash.setByte(2000, 0x44);
  stash.setByte(3000, 0xff);
  stash.save(function(err) {
    console.log(err || "Watermark inserted.");
  });
});
```

-----------------------------------

<a name="read" />
## stash.read(offset, length)
## stash.read(offset)
## stash.read()

Reads a sequence of bytes from the PNG's "invisible" bits, and returns
them as a `Buffer`.

__Arguments__

* offset - default=`0`. At which byte position to start reading from.
* length - default=`stash.length`.  How many bytes to read.

__Example__

```javascript
var pngStash = require('png-stash');

pngStash("message.png", function(err, stash) {
  var messageLength = stash.getByte(0) * 65536
                    + stash.getByte(1) * 256
                    + stash.getByte(2);
  var message = stash.read(messageLength, 3);
  console.log("Found message: " + message);
});
```

-----------------------------------

<a name="write" />
## stash.write(data, offset, length)
## stash.write(data, offset)
## stash.write(data)

Writes a sequence of bytes to the PNG's "invisible" bits, but does not
save to disk.  To save to disk, call `save()`.

__Arguments__

* data - Bytes to store in the PNG.  Must be string or Buffer.  If string, will be UTF-8 encoded.
* offset - default=`0`.  At which byte position to start writing to.
* length - default=all.  How many bytes from `data` to write.  Be aware that the `.length` of a string may not correspond to the number of bytes in its resulting UTF-8 representation.

__Example__

```javascript
var pngStash = require('png-stash');

pngStash("message.png", function(err, stash) {
  var message = new Buffer("Hello there!");
  stash.setByte(0, message.length >> 16 & 0xff);
  stash.setByte(1, message.length >>  8 & 0xff);
  stash.setByte(2, message.length >>  0 & 0xff);
  stash.write(message, 3);
});
```

-----------------------------------

<a name="save" />
## stash.save(callback)

Stores the PNG data back into the file.  You want to call this
function after writing data to the `stash` instance.

__Arguments__

* callback - `function(err)`.  `err` will be `undefined` if save was successful.  Otherwise it will represent an error.

__Example__

// See examples for `stash.write()` and `stash.setByte()`.
