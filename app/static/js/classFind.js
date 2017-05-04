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
    controller: function($scope, $http, $location, $window, profile) {
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
    controller: function($scope, $http, $window, $location, profile, keepTopic) {
        $scope.logout = true;
        
        $scope.user = {};
        $scope.displayedRecommended = [];
        $scope.allClasses = [];
        $scope.conversations = [];
        $scope.recommended = [];
        $scope.coursesTaken = [];
        
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
                        yesMatch: true,
                    });
                    
                });
        },  function(response) {
            $location.path('/');
        });
        
        $http({
            method: 'GET',
            url: '/coursesTaken',
        }).then(
            function(response) {
                $scope.coursesTaken = response.data;
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
                    updateDisplayedRecommended()
                }
        },  function(response) {
            $location.path('/');
        });
    
        $http({
            method: 'GET',
            url: '/courses/currentYear',
        }).then(
            function(response) {
                let temp = response.data.sort(function(a, b) {
                    return a.courseName.toLowerCase().localeCompare(b.courseName.toLowerCase());
                });
                for (let i = 0; i < temp.length - 1; i ++) {
                    if (temp[i + 1].courseName != temp[i].courseName) {
                        $scope.allClasses.push(temp[i]);
                    }
                }  
                
                $scope.updateClassSearch();
        },  function(response) {
            $location.path('/');
        });
        
        function updateDisplayedRecommended() {
            $scope.displayedRecommended = makeTableFriendly($scope.recommended.filter(function(course) {
                 return !checkCourseTopicInArray(course.departmentCode + " " + course.courseNumber.slice(0, 3), $scope.conversations) && 
                        !checkCourseInArray(course.departmentCode + " " + course.courseNumber.slice(0, 3), $scope.coursesTaken);
            }).sort(function(a, b) {
                if (a.departmentCode.toLowerCase() > b.departmentCode.toLowerCase()) {
                    return 1;
                } else if (a.departmentCode.toLowerCase() < b.departmentCode.toLowerCase()) {
                    return -1;
                }
                if (a.courseNumber.toLowerCase() > b.courseNumber.toLowerCase()) {
                    return 1;
                } else if (a.courseNumber.toLowerCase() < b.courseNumber.toLowerCase()){
                    return -1;
                } else {
                    return 0;
                }
            }));
        }
        
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
                    
                return  ((course.courseName.toLowerCase().includes($scope.searchTerm.toLowerCase()) || 
                        course.departmentCode.toLowerCase().includes($scope.searchTerm.toLowerCase()) ||
                        course.departmentName.toLowerCase().includes($scope.searchTerm.toLowerCase()) ||
                        course.courseNumber.toLowerCase().includes($scope.searchTerm.toLowerCase())) && !checkCourseTopicInArray(course.departmentCode + " " + course.courseNumber.slice(0, 3), $scope.conversations) && !checkCourseInArray(course.departmentCode + " " + course.courseNumber.slice(0, 3), $scope.coursesTaken));
            }).sort(function(a, b) {
                if (a.departmentCode.toLowerCase() > b.departmentCode.toLowerCase()) {
                    return 1;
                } else if (a.departmentCode.toLowerCase() < b.departmentCode.toLowerCase()) {
                    return -1;
                }
                if (a.courseNumber.toLowerCase() > b.courseNumber.toLowerCase()) {
                    return 1;
                } else if (a.courseNumber.toLowerCase() < b.courseNumber.toLowerCase()){
                    return -1;
                } else {
                    return 0;
                }
            })); 
        }

        function checkCourseTopicInArray(val, arr) {
            let response = false;
            arr.forEach(function(item) {
                if (item.topic == val) {
                    response = true;
                }
            });
            return response;
        }
        
        function checkCourseInArray(val, arr) {
            let response = false;
            arr.forEach(function(course) {
                if (course.departmentCode + " " + course.courseNumber.slice(0, 3) == val) {
                    response = true;
                }
            });
            return response;
        }
        
        $scope.createConversation = function(classDiscussing) {
            removeFromArray($scope.allClasses, classDiscussing);
            let recommendedclassDiscussing = classDiscussing;
            recommendedclassDiscussing.recommended = true;
            removeFromArray($scope.recommended, recommendedclassDiscussing);
            $scope.conversations.push(classDiscussing);
            updateDisplayedRecommended();
            $scope.updateClassSearch();
            
            $http({
                method: 'GET',
                url: '/match/' + classDiscussing._id,
            }).then(
                function(response) {
                    if (response.data.msg) {
                        classDiscussing.noMatch = true;
                        classDiscussing.yesMatch = false;
                    } else {
                        classDiscussing.yesMatch = true;
                        keepTopic.setTopic(classDiscussing.departmentCode + ' ' + classDiscussing.courseNumber.slice(0, 3));
                        keepTopic.setId(response.data._id);
                        classDiscussing.id = (response.data._id);
                    }

                },  function(response) {
                        $location.path('/');
                        classDiscussing.noMatch = true;
                        classDiscussing.yesMatch = false;
            }); 
        };

        $scope.removeFromSelected = function(classToRemove){
            removeFromArray($scope.conversations, classToRemove);
            if(classToRemove.yesMatch) {
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
            }
            if (classToRemove.courseName) {
                classToRemove.noMatch = false;
                $scope.allClasses.push(classToRemove);
                if(classToRemove.recommended) {
                    $scope.recommended.push(classToRemove);
                }
            }
            updateDisplayedRecommended()
            $scope.updateClassSearch();
        }

        function removeFromArray(arr, item) {
            let indexOfItem = -1;
            for (let i = 0; i < arr.length; i ++) {
                if (item._id == arr[i]._id) {
                    indexOfItem = i;
                }
            }
            if(indexOfItem != -1) {
                arr.splice(indexOfItem, 1);
            }
        }
        
        $scope.gotoMessage = function(convo) {
            if (convo.id) {
                $location.path('/' + convo.id); 
            }
            else {
                convo.noMatch = true;
                convo.yesMatch = false;
            }
        }
    }
});


classFindApp.component('conversation', {
    templateUrl: 'templates/conversation.template.html',
    controller: function($scope, $http, $routeParams, $location, $rootScope, profile, socket, keepTopic) {
        $scope.location = $location;
        
        $scope.conversations = [];
        
        $scope.conversation = {
            members: [],
            topic: '',
            messages: [],
        };
        
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
                    $scope.conversation = chat;
                }
            });
        });
        
        $scope.back = function() {
            $location.path('/');
        }
        
    }
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
    
        
