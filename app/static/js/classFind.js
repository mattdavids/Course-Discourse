classFindApp = angular.module('findClasses', ['ngRoute']);

classFindApp.config(function($routeProvider) {
    $routeProvider.when('/', {
        template: '<class-find></class-find>'
    }).when('/:chatId', {
        template: '<conversation></conversation>'
    }).otherwise('/');
});



classFindApp.component('headerTop', {
    templateUrl: 'templates/headerTop.template.html',
    controller: function($scope, $http, $location, $window) {
        $scope.logout = true;
        
        $scope.logoutFunc = function() {
            $http({
                method: 'GET',
                url: '/logout'
            }).then(function(response) {
                $window.location.href = '/';
            });
        }
    }
});

classFindApp.component('classFind', {
    templateUrl: 'templates/classFind.template.html',
    controller: function($scope, $http, $window, $location, profile) {
        $scope.logout = true;
        
        $scope.user = {};
        $scope.displayedRecommended = [];
        $scope.allClasses = [];
        $scope.conversations = [];
        
        $http({
            method: 'GET',
            url: '/profile',
        }).then(
            function(response) {
                
                profile.setProfile(response.data);
                $scope.user = response.data;
                $scope.user.chats.forEach(function(chat) {
                    $scope.conversations.push({
                        id: chat._id,
                        topic: chat.topic,
                    });
                    
                });
        },  function(response) {
            $location.path('/');
        });
        
        $http({
            method: 'GET',
            url: '/recommended',
        }).then(
            function(response) {
                if (!$.isEmptyObject(response.data)) {
                    let temp = response.data.sort(function(a, b) {
                        return a.courseName.toLowerCase().localeCompare(b.courseName.toLowerCase());
                    });
                    for (let i = 0; i < temp.length - 1; i ++) {
                        if (temp[i + 1].courseName != temp[i].courseName) {
                            $scope.recommended.push(temp[i]);
                        }
                    }
                    $scope.recommended.map(function(item) {
                        item.recommended = true;
                        return item;
                    });
                    $scope.displayedRecommended = makeTableFriendly($scope.recommended.sort(function(a, b) {
                        return a.courseName.toLowerCase().localeCompare(b.courseName.toLowerCase());
                    }));
                }
        },  function(response) {
            $location.path('/');
        });
    
        $http({
            method: 'GET',
            url: '/courses/currentYear',
        }).then(
            function(response) {
                $scope.allClasses = response.data;
                $scope.allClasses.sort(function(a, b) {
                    return a.courseName.toLowerCase().localeCompare(b.courseName.toLowerCase());
                });
                let result = [];
                for (let i = 0; i < $scope.allClasses.length - 1; i ++) {
                    if ($scope.allClasses[i + 1].courseName != $scope.allClasses[i].courseName) {
                        result.push($scope.allClasses[i]);
                    }
                }  
                $scope.allClasses = result;
                
                $scope.updateClassSearch();
        },  function(response) {
            $location.path('/');
        });
        
        $scope.selectedClasses = [];
        $scope.searchTerm = '';

        function makeTableFriendly(arr) {
            let newArr = [];
            if (arr.length % 2 == 0) {
                for(let i = 0; i < arr.length; i+= 2) {
                newArr.push([arr[i], arr[i + 1]]);
                }
            } else {
                for(let i = 0; i < arr.length - 1; i+= 2) {
                    newArr.push([arr[i], arr[i + 1]]);
                }
                newArr.push([arr[arr.length - 1]]);
            }

            return newArr;
        }   

        $scope.updateClassSearch = function() {
            $scope.displayedAll =
                makeTableFriendly($scope.allClasses.filter(function(course) {
                    
                return  course.courseName.toLowerCase().includes($scope.searchTerm.toLowerCase()) || 
                        course.departmentCode.toLowerCase().includes($scope.searchTerm.toLowerCase()) ||
                        course.departmentName.toLowerCase().includes($scope.searchTerm.toLowerCase()) ||
                        course.courseNumber.toLowerCase().includes($scope.searchTerm.toLowerCase());
            }).sort(function(a, b) {
                return a.courseName.toLowerCase().localeCompare(b.courseName.toLowerCase());
            })); 
        }

        $scope.createConversation = function(classDiscussing) {
            removeFromArray($scope.allClasses, classDiscussing);
            removeFromArray($scope.displayedRecommended, classDiscussing);
            $scope.conversations.push(classDiscussing);

            $scope.updateClassSearch();
            $scope.displayedRecommended = $scope.displayedRecommended;
        }

        $scope.removeFromSelected = function(classToRemove){
            removeFromArray($scope.conversations, classToRemove);
            if(!classToRemove.courseName) {
                $http({
                    method: 'POST',
                    url: '/remove',
                    transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                },
                    data: classToRemove,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                });
            } else {
                classToRemove.noMatch = false;
                $scope.allClasses.push(classToRemove);
                $scope.updateClassSearch();
            }
        }

        function removeFromArray(arr, item) {
            let indexOfItem = arr.indexOf(item);
            if(indexOfItem != -1) {
                arr.splice(indexOfItem, 1);
            }
        }
        
        $scope.gotoMessage = function(convo) {
            if (convo.id) {
                $location.path('/' + convo.id); 
            }
            else {
                $http({
                    method: 'GET',
                    url: '/match/' + convo._id,
                }).then(
                    function(response) {
                    $location.path('/' + response.data._id);
                        if (response.data.msg) {
                            convo.noMatch = true;
                        } else {
                },  function(response) {
                        $location.path('/');
                        convo.noMatch = true;
            }); 
            }
        }
    }
});


classFindApp.component('conversation', {
    templateUrl: 'templates/conversation.template.html',
    controller: function($scope, $http, $routeParams, $location, conversationsService, profile, socket) {
        
        $scope.conversations = [];
        
        $scope.conversation = [];
        
        $scope.user = profile.getProfile();
        
        if (!$scope.user) {
            $http({
                method: 'GET',
                url: '/profile',
            }).then(
            function(response) {
                profile.setProfile(response.data);
                $scope.user = profile.getProfile();
                readDataChats();
            });
        } else {
            readDataChats();
        }
        
        function readDataChats() {
            $scope.conversations = $scope.user.chats                    
            $scope.conversations.forEach(function(chat) {
                if (chat._id == $routeParams.chatId) {
                    $scope.conversation = chat;
                    $scope.conversation.messages.forEach(function(msg) {
                        if (msg.sender != $scope.user._id) {
                            msg.sent = false;
                        } else {
                            msg.sent = true;
                        }
                    });
                }
            });
            
            $scope.isNewChat = true;
            $scope.conversations.forEach(function(chat) {
                if ('/' + chat._id == $location.path()) {
                    $scope.isNewChat = false;
                }
            });
            if($scope.isNewChat) {
                $scope.conversation.topic = keepTopic.getTopic();
                $scope.conversation._id = keepTopic.getId();
                $scope.conversations.push($scope.conversation);
            }
        }
        
        $scope.sendMessage = function() {
            
            $scope.conversation.messages.push({
                sender: $scope.user._id,
                senderName: $scope.user.firstName,
                sentAt: Date.now(),
                text: $scope.msgText,  
                sent: true,
            });
            
            socket.emit('send', {
                chatId: $routeParams.chatId,
                text: $scope.msgText,
            });
            
            $scope.msgText = '';
        }
        
        socket.on('receiveMessage', function(obj) {
            $scope.conversations.forEach(function(chat) {
                if (chat._id == obj.chatId) {
                    obj.message.sent = false;
                    chat.messages.push(obj.message);

                    if (obj.chatId == $routeParams.chatId) {
                        $scope.conversation.push(obj.message);
                    }
                }
            });
        });
        
        $scope.back = function() {
            $location.path('/');
        }
        
    }
});

classFindApp.service('conversationsService', function() {
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


classFindApp.factory('socket', function($rootScope) {
    let socket = io.connect('localhost:3000');

    return {
        on: function (eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback ) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});

classFindApp.service('profile', function() {
    let user = {};
    
    return {
        setProfile: function(profile1) {
            this.user = profile1; 
        },
        getProfile: function() {return this.user; },
    }
});

classFindApp.service('keepTopic', function() {
    let topic = '';
    let id = '';
    return {
        getTopic: function() {return this.topic; },
        setTopic: function(topic) {this.topic = topic; },
        getId: function() {return this.id; },
        setId: function(id) {this.id = id; }
    }
})
    
        
