var socket = io.connect('http://localhost:3000');
socket.on('greet', function (data) {
console.log(data);
//socket.emit('msgFromCustomer', { my: 'data' });
});
socket.on('msgFromAdmin', function (data) {
	console.log(data);
});

var app = angular.module('nodeChat',[]);

app.controller('activeChats', function($scope){
	$scope.chats = [
		{
			name: "aman",
			email: "aman@gmail.com",
			player_id: "hkasdjh2g7bds",
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
				},
				{
					sentBy: "admin",
					msg: "Wait a min, I need to check the status."
				},
				{
					sentBy: "admin",
					msg: "I have updated the status, check the app again."
				},
				{
					sentBy: "cust",
					msg: "Now it showing, Thanks"
				}
			]
		},
		{
			name: "mohit",
			email: "mohit@gmail.com",
			player_id: "hkasdjhsfg7bds",
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
				},
				{
					sentBy: "admin",
					msg: "Wait a min, I need to check the status."
				},
				{
					sentBy: "admin",
					msg: "I have updated the status, check the app again."
				},
				{
					sentBy: "cust",
					msg: "Now it showing, Thanks"
				}
			]
		},
		{
			name: "nitin",
			email: "nitin@gmail.com",
			player_id: "hkas3r3fg7bds",
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
				},
				{
					sentBy: "admin",
					msg: "Wait a min, I need to check the status."
				},
				{
					sentBy: "admin",
					msg: "I have updated the status, check the app again."
				},
				{
					sentBy: "cust",
					msg: "Now it showing, Thanks"
				}
			]
		},
		{
			name: "aashish",
			email: "aashish@gmail.com",
			player_id: "sddfdv9dsuf9",
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
				},
				{
					sentBy: "admin",
					msg: "Wait a min, I need to check the status."
				},
				{
					sentBy: "admin",
					msg: "I have updated the status, check the app again."
				},
				{
					sentBy: "cust",
					msg: "Now it showing, Thanks"
				}
			]
		},
		{
			name: "sandeep",
			player_id: "sdfsdfb0sd0bfd",
			email: "sandeep@gmail.com",
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
				},
				{
					sentBy: "admin",
					msg: "Wait a min, I need to check the status."
				},
				{
					sentBy: "admin",
					msg: "I have updated the status, check the app again."
				},
				{
					sentBy: "cust",
					msg: "Now it showing, Thanks"
				}
			]
		}
	];

	socket.on('msgFromServer', function (data) {
		console.log(data);
		$scope.chats.push(data);
		$scope.$apply();
	});

});