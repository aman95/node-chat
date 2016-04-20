// var socket = io.connect('http://localhost:3000');
var BASE_URL = 'http://'+window.location.host;
var socket = io.connect(BASE_URL);
try {
	var uid = window.location.href.split('/')[5].substring(0,24);
} catch(err) {
	var uid = null;
}

socket.on('greet', function (data) {
	console.log(data);
	//socket.emit('msgFromCustomer', { my: 'data' });
});

var app = angular.module('nodeChat',[]);

app.directive('scrollToBottom', function() {
    return {
        restrict: 'A',
        priority: 0,
        link: function(scope, element) {
		      scope.$watchCollection('chatMsgs', function() {
        		var $list = $('#chatPanelBody');
				var scrollHeight = $list.prop('scrollHeight');
				$list.animate({scrollTop: scrollHeight}, 500);	
		      });
		    }
    };
});


app.controller('chatMsgs', ['$scope','$http', function($scope, $http){
	if(uid === null) return;
	$http({
	  method: 'GET',
	  url: BASE_URL+'/apis/chat/'+uid
	}).then(function successCallback(response) {
	    console.log(response);
	    $scope.name = response.data.name;
	    $scope.email = response.data.email;
	    $scope.chatMsgs = response.data.chatMsgs;
	    $scope.phone = response.data.phone;
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
		if($scope.msgText.length == 0) return;
		var newChatMsg = {
			msg: $scope.msgText,
			sentBy: "admin"
		};
		socket.emit('msgFromAdmin', {
			userID: uid,
			msg: $scope.msgText
		});
		// $scope.chatMsgs.push(newChatMsg);
		$scope.msgText = '';

	}

}]);

