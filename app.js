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
    	console.log(err);
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

	Chat.findOneAndUpdate(
		{email: email},
		{
			name: name,
			email: email,
			oneSignalPlayerID: oneSignalPID
		},
		{safe: true, upsert: true, setDefaultsOnInsert:true, new:true},
		function(err, model) {
			// console.log("Error: "+err);
			// console.log("Model: "+model);
			res.json(model);
		}
	);
});

app.post('/apis/chat/user/msg', function (req, res) {
	var oneSignalPID = req.body.player_id;
	//var email = req.body.email;
	var msg = req.body.chatMsg;
	var id = req.body.chatID;

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
				console.log(data);
				io.sockets.emit(id, data);

				Chat.find({},function (err, doc) {
			    	console.log(err);
			        io.sockets.emit('recentChatsFromServer', doc);
			    }).sort({'updatedAt': -1}).select({ 'name': 1, '_id': 1, 'email':1, 'updatedAt':1, 'oneSignalPlayerID':1});
				// io.sockets.emit('msgFromAdmin', {reply: 'from outside'});

				res.json({success: true, data:data});
			} else {
				res.json({error:502});
			}
			
		}
	);
});
app.get('/sendMsg', function (req, res) {
	io.sockets.emit('msgFromAdmin', {reply: 'from outside'});
	var message = { 
		app_id: process.env.ONE_SIGNAL_APP_ID,
		contents: {"en": "Hey! User whats up."},
		headings: {"en": "Message from Admin - NodeChat"},
		included_segments: ["All"],
		data: {
			msg: "Hey Buddy"
		}
	};

	sendNotification(message);
	res.json({status:true});
});

app.post('/cust/chat', function (req, res) {
	var oneSignalPID = req.body.player_id;
	var email = req.body.email;
	var msg = req.body.chatMsg;
	var name = req.body.name;

	var rChat = {
        sentBy: 'cust',
        msg: req.body.chatMsg
    };

	Chat.findOneAndUpdate(
		{email: email},
		{
			name: name,
			email: email,
			oneSignalPlayerID: oneSignalPID,
			$push: {chatMsgs: rChat}
		},
		{safe: true, upsert: true},
		function(err, model) {
			console.log("Error: "+err);
			console.log("Model: "+model);
			Chat.findOne({email: email}, function (err, chat) {
				if(!err)
					res.json(chat);
				else res.send("error");
			});
		}
	);

	// Chat.findOne({email: email}, function (err, chat) {
	// 	if(err)
	// 		console.log("Error occurred: "+err);

	// 	else if(!chat) {
	// 		console.log("Record does not exists...");

	// 		var newChat = new Chat({
	// 			name: name,
	// 			email: email,
	// 			oneSignalPlayerID: oneSignalPID,
	// 			chatMsgs: [{
	// 			    sentBy: "cust",
	// 			    msg: msg
	// 			}]
	// 		});

	// 		newChat.save(function(err,result) {
	// 			if (err) {
	// 			  console.log('Error occurred while saving Chat!');
	// 			} else {
	// 			  console.log('Chat saved successfully!');
	// 			  res.json(result);
	// 			}
	// 		});
	// 	}
	// 	else {
	// 		console.log("Found: "+chat);

	// 		chat.push

	// 		res.send(chat);
	// 	}
			
	// });

	// res.send("success");

});

app.get('/sendObj', function (req, res) {
	io.sockets.emit('msgFromServer', {
		name: "test",
		player_id: "sdfsdfb0sd0bfd",
		email: "test@gmail.com",
		chatMsgs: [
			{
				sentBy: "cust",
				msg: "Hey there, I need some help regarding my current request"
			},
			{
				sentBy: "admin",
				msg: "Welcome, Tell us your problem"
			},
			{
				sentBy: "cust",
				msg: "My current request is not showing in the requests page in the app"
			}
		]
	});
  res.json({status:true});
});
// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });


// ===================================== socket Functions ===============================================
io.on('connection', function (socket) {
  console.log(socket.id);
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
		{safe: true},function (err, doc) {
    	if(err) console.log({error: 404});
    	else {
    		var message = { 
				app_id: process.env.ONE_SIGNAL_APP_ID,
				contents: {"en": data.msg},
				headings: {"en": process.env.CHAT_MSG_HEAD},
				android_background_data: true,
				include_player_ids: [doc.oneSignalPlayerID],
				data: {
					type: "chat"
					msg: data.msg
				}
			};

			sendNotification(message);
    		// console.log(doc);
    	}
    });
    // console.log(data);
  });
});