var express = require('express');
var path = require('path');
require('dotenv').config();
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');
mongoose.connect(process.env.M_LAB_URI);

server.listen(3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname+'/node_modules', 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));


// MongoDB configuration
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Connected to mLab");
});
var Chat = require('./models/Chat');

// ===================================== oneSignal Function ===============================================
var sendNotification = function(data) {
  var headers = {
    "Content-Type": "application/json",
    "Authorization": process.env.ONE_SIGNAL_AUTH
  };
  
  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };
  
  var https = require('https');
  var req = https.request(options, function(res) {  
    res.on('data', function(data) {
      console.log("Response:");
      console.log(JSON.parse(data));
    });
  });
  
  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
  });
  
  req.write(JSON.stringify(data));
  req.end();
};


// ============================================= Routing =====================================================
// View Rendering
app.get('/chats', function (req, res) {

    res.sendFile(path.join(__dirname, './public', 'dash.html'));
});

app.get('/chat/:id', function (req, res) {

    res.sendFile(path.join(__dirname, './public', 'dash.html'));
});

//APIS
app.get('/apis/chats/recent', function (req, res) {

    Chat.find({},function (err, doc) {
    	// console.log(err);
        res.jsonp(doc);
    }).sort({'updatedAt': -1}).select({ 'name': 1, '_id': 1, 'email':1, 'updatedAt':1, 'oneSignalPlayerID':1});
});

app.get('/apis/chat/:id', function (req, res) {

    Chat.findOne({ _id: req.params.id},function (err, doc) {
    	if(err) res.json({error: 404});
    	else res.jsonp(doc);
    });
    
});


app.post('/apis/chat/user/create', function (req, res) {
	var oneSignalPID = req.body.player_id;
	var email = req.body.email;
	// var msg = req.body.chatMsg;
	var name = req.body.name;
	var phone = req.body.phone;

	Chat.findOneAndUpdate(
		{email: email},
		{
			name: name,
			email: email,
			phone: phone,
			oneSignalPlayerID: oneSignalPID
		},
		{safe: true, upsert: true, setDefaultsOnInsert:true, new:true},
		function(err, model) {
			if(err) {
				res.json({error: 502});
			} else {
				res.json(model);
			}			
		}
	);
});

app.post('/apis/chat/user/msg', function (req, res) {
	var oneSignalPID = req.body.player_id;
	//var email = req.body.email;
	var msg = req.body.chatMsg;
	var id = req.body.chatID;

	console.log("Chat submit req: ");
	console.log(req.body);

	var message = {
        sentBy: 'cust',
        msg: msg
    };

	Chat.findOneAndUpdate(
		{_id: id},
		{
			oneSignalPlayerID: oneSignalPID,
			$push: {chatMsgs: message}
		},
		{safe: true, new:true},
		function(err, model) {
			// console.log("Error: "+err);
			// console.log("Model: "+model);
			if(!err) {
				var data = model.chatMsgs.pop();
				// console.log(data);
				io.sockets.emit(id, data);

				Chat.find({},function (err, doc) {
			    	// console.log(err);
			        io.sockets.emit('recentChatsFromServer', doc);
			    }).sort({'updatedAt': -1}).select({ 'name': 1, '_id': 1, 'email':1, 'updatedAt':1, 'oneSignalPlayerID':1});
				// io.sockets.emit('msgFromAdmin', {reply: 'from outside'});
				console.log("Chat res success ");
				res.json({success: true, data:data});
			} else {
				console.log("Chat res error ");
				res.json({error:502});
			}
			
		}
	);
});



// ===================================== socket Functions ===============================================
io.on('connection', function (socket) {
  // console.log(socket.id);
  socket.emit('greet', { hey: 'there' });
  // socket.on('msgFromCustomer', function (data) {
  // 	socket.emit('msgFromAdmin', {response: 'from Admin'});
  //   console.log(data);
  // });
  socket.on('msgFromAdmin', function (data) {
  	//socket.emit('msgFromAdmin', {response: 'from Admin'});
  	var aChat = {
  		msg: data.msg,
  		sentBy: 'admin'
  	};
  	Chat.findOneAndUpdate({ _id: data.userID},{
			$push: {chatMsgs: aChat}
		},
		{safe: true, new:true},function (err, doc) {
    	if(err) console.log({error: 404});
    	else {
    		var payload = doc.chatMsgs.pop();
    		var message = { 
				app_id: process.env.ONE_SIGNAL_APP_ID,
				contents: {"en": data.msg},
				headings: {"en": process.env.CHAT_MSG_HEAD},
				android_background_data: true,
				include_player_ids: [doc.oneSignalPlayerID],
				data: {
					type: "chat",
					chat: payload
				}
			};

			sendNotification(message);
    		// console.log(doc);
    	}
    });
    // console.log(data);
  });
});