const mongoose = require("../lib/connection");
const { Schema } = require('mongoose');

// create an schema
var videoSchema = new Schema({
    videoMetaDta: {type: Object, default: {}},
    thumbNailMetaData: {type: Object, default: {}},
    cdnUrlThumbnail: {type: String, default: ''},
    cdnUrlVideo: {type: String, default: ''},
    fileName: {type: String, default: ''},
    videoTitle: {type:String, default: ''},
    videoDescription: {type:String, default: ''},
    
});

var videoModel = mongoose.model('Videos', videoSchema);

module.exports = videoModel;