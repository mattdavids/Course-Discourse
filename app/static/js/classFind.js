classFindApp = angular.module('findClasses', ['ngRoute']);

classFindApp.config(function($routeProvider) {
    $routeProvider.when('/', {
        template: '<class-find></class-find>'
    }).when('/:chatId', {
        template: '<conversation></conversation>'
    }).otherwise('/');
});

classFindApp.component('headerTop', {
    templateUrl: 'headerTop.template.html',
});

classFindApp.component('classFind', {
    templateUrl: 'classFind.template.html',
    controller: function($scope, $http, $window, $location, profile) {
        
        $scope.user = {};
        $scope.displayedRecommended = [];
        $scope.allClasses = [];
        $scope.conversations = [];
        
        $http({
            method: 'GET',
            url: '/profile',
        }).then(
            function(response) {
                console.log('donecat');
                
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
                $scope.displayedRecommended = response.data;
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
            if (!classToRemove.topic) {
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
                    $location.path('/' + response.data.id);
                },  function(response) {
                    $location.path('/');
            }); 
            }
        }
    }
});


classFindApp.component('conversation', {
    templateUrl: 'conversation.template.html',
    controller: function($scope, $http, $routeParams, conversationsService, profile) {
        
        $scope.conversations = [];
        
        $scope.conversation = [];
        
        $scope.user = profile.getProfile();
        $scope.conversations = $scope.user.chats;                    
        console.log($scope.conversations);
        $scope.conversations.forEach(function(chat) {
            if (chat._id == $routeParams.chatId) {
                $scope.conversation = chat;
            }
        });
        
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




classFindApp.service('profile', function() {
    let user = {};
    
    return {
        setProfile: function(profile1) {
            this.user = profile1; 
        },
        getProfile: function() {return this.user; },
    }
})
    
        
