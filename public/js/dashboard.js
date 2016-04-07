// var socket = io.connect('http://localhost:3000');
var socket = io.connect('http://'+window.location.host);
try {
	var uid = window.location.href.split('/')[4].substring(0,24);
} catch(err) {
	var uid = null;
}

socket.on('greet', function (data) {
	console.log(data);
	//socket.emit('msgFromCustomer', { my: 'data' });
});

var app = angular.module('nodeChat',[]);

app.controller('activeChats', ['$scope','$http', function($scope,$http) {

	$http({
	  method: 'GET',
	  url: 'http://'+window.location.host+'/apis/chats/recent'
	}).then(function successCallback(response) {
	    console.log(response);
	    $scope.chats = response.data;
	    //$scope.$apply();
	  }, function errorCallback(response) {
	    $scope.chats = [];
	  });

	socket.on('msgFromServer', function (data) {
		console.log(data);
		var sChat = { "email": data.email, "oneSignalPlayerID": "sdfsdfb0sd0bfd", "name": data.name }
		$scope.chats.unshift(sChat);
		$scope.$apply();
	});

}]);

app.controller('chatMsgs', ['$scope','$http', function($scope, $http){
	if(uid === null) return;
	$http({
	  method: 'GET',
	  url: 'http://localhost:3000/apis/chat/'+uid
	}).then(function successCallback(response) {
	    console.log(response);
	    $scope.name = response.data.name;
	    $scope.email = response.data.email;
	    $scope.chatMsgs = response.data.chatMsgs;
	    //$scope.$apply();
	  }, function errorCallback(response) {
	    $scope.chatMsgs = [];
	  });
	socket.on(uid, function (data) {
		console.log(data);
		// var sChat = { "email": data.email, "oneSignalPlayerID": "sdfsdfb0sd0bfd", "name": data.name }
		$scope.chatMsgs.push(data);
		$scope.$apply();
	});

	$scope.sendMsgSocket = function() {
		var newChatMsg = {
			msg: $scope.msgText,
			sentBy: "admin"
		};
		socket.emit('msgFromAdmin', {
			userID: uid,
			msg: $scope.msgText
		});
		$scope.chatMsgs.push(newChatMsg);
		$scope.msgText = '';
		// $scope.$apply();

	}

}]);

