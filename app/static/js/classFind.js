classFindApp = angular.module('findClasses', ['ngRoute']);

classFindApp.component('headerTop', {
    templateUrl: 'headerTop.template.html',
});

classFindApp.component('classFind', {
    templateUrl: 'classFind.template.html',
    controller: function($scope, $http, $window, $location, selectedChat) {
        
        $scope.profile = {};
        $scope.displayedRecommended = [];
        $scope.allClasses = [];
        $scope.conversations = [];
        
        $http({
            method: 'GET',
            url: '/profile',
        }).then(
            function(response) {
                $scope.profile = response.data;
                $scope.profile.chats.forEach(function(chat) {
                    $scope.conversations.push(chat);
                });
        },  function(response) {
            $location.path('/home');
        });
        
        $http({
            method: 'GET',
            url: '/recommended',
        }).then(
            function(response) {
                $scope.displayedRecommended = response.data;
        },  function(response) {
            $location.path('/home');
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
            $location.path('/home');
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
            $scope.allClasses.push(classToRemove);
            $scope.updateClassSearch();

        }

        function removeFromArray(arr, item) {
            let indexOfItem = arr.indexOf(item);
            if(indexOfItem != -1) {
                arr.splice(indexOfItem, 1);
            }
        }
    }
});

classFindApp.service('selectedChat', function() {
    let selected = '';
    
    return {
        get: function() {return selected; },
        set: function(id) {selected = id;}
    }
})
    
        
