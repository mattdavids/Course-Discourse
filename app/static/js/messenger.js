messengerApp = angular.module('messenger', ['ngRoute']);

messengerApp.config(function($routeProvider) {
    $routeProvider.when('/:userId', {
        template: '<conversation></conversation>'
    }).otherwise('/');
});

messengerApp.component('conversation', {
    templateUrl: 'conversation.template.html',
    controller: function($scope, $routeParams, conversationsService) {
        $scope.conversation = conversationsService.get($routeParams.userId);
    }
});

messengerApp.service('conversationsService', function() {
    let conversations = [{
        otherUser: 1, 
        messages: [{
                        sent: true, 
                        text: 'Hi!'
                    }, {
                        sent: false, 
                        text: 'Hello'
                    }, {
                        sent: true, 
                        text: 'Did you like the prof for Comp 124?'
                    }, {
                        sent: false, 
                        text: 'Yeah! They were awesome!'
                    }]
    } , {
        otherUser: 2, 
        messages: [{
            sent: true, 
            text: 'Hello?'
        }, {
            sent: true, 
            text: 'Are you there??'
        }, {
            sent: false,
            text: 'Sorry, I was at Cafe Mac! What questions do you have?'
        }]
    }, {
        otherUser: 3, 
        messages: [{
            sent: true,
            text: 'Bryro?!'
        }]
    }];

    return {
        all: function() { return conversations }, 
        get: function (otherUserId) {
            return conversations.find(function(convo) {
                return convo.otherUser == otherUserId;    
            });
        }
    };
});