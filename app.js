var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const fs = require("fs");

const mongoose = require('mongoose');

const { BlobServiceClient } = require('@azure/storage-blob');

const userModel = require("./schemas/user");
const videoModel = require("./schemas/video");

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();


// const io = new Server(server);

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: '*'
}));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

let datatransferRate = 0;

app.get('/', function (req, res, next) {
  res.sendFile('/home/shehan/projects/Prodax/index.html');
});

app.get('/getDataRate',function(req, res, next) {
  res.json({datatransferRate});
})


app.get("/videof", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "North.mp4";
  const videoSize = fs.statSync("North.mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = (10 ** 6) / 10; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);


  datatransferRate += 100;
  // setTimeout(() => {
  //   datatransferRate -= 100;
  //   console.log("Delayed for 1 second.");
  // }, "1000")

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

app.get("/homeVideos", async (req, res) => {
  const videoData = await videoModel.find()
  console.log(videoData)
  res.json(videoData)
})

app.get("/video/:id", async (req, res) => {

  console.log(req.params.id)
  const videoData = await videoModel.findOne({ '_id': req.params.id })
  console.log(videoData)

  const blobName = videoData.fileName 

  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  try {
    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      "DefaultEndpointsProtocol=https;AccountName=prodaxstorageaccount;AccountKey=48YwLyJ4SI/4wbdSgIYZOEPOBVLRU8g5wHyirbs11K18KGn63ANc5o/DsyxeK/kdGa81DVkm7PR6+AStVze2Ow==;EndpointSuffix=core.windows.net"
    );

    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

    const containerName = 'prodaxcontainer';

    // const blobName = "Blade.mp4";

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const contentLengthTotal = await (await blockBlobClient.getProperties()).contentLength;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = (10 ** 6) / 10; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, contentLengthTotal - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${contentLengthTotal}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    console.log('\nDownloaded blob content...');

    const downloadBlockBlobResponse = await blockBlobClient.download(start, contentLength);

    downloadBlockBlobResponse.readableStreamBody.pipe(res);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }

});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





module.exports = app;
