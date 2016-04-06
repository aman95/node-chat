/**
 * Created by aman on 27/03/16.
 */
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var chatSchema = new Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    oneSignalPlayerID: { type: String, required: true },
    chatMsgs: [{
        sentBy: String,
        timeStamp: { type : Date, default : Date.now },
        msg: String
    }],
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Chat = mongoose.model('Chat', chatSchema);

// make this available in our Node applications
module.exports = Chat;