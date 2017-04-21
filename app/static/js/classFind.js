classFindApp = angular.module('findClasses', ['ngRoute']);

classFindApp.component('headerTop', {
    templateUrl: 'headerTop.template.html',
});

classFindApp.component('classFind', {
    templateUrl: 'classFind.template.html',
    controller: function($scope) {
        $scope.recommendedClasses = ['Object-Oriented Programming', 'Internet Computing', 'Software Development'];
        $scope.allClasses = ['Intro to CS', 'Intro to Anthro', 'Object-Oriented Programming', 'Internet Computing', 'Software Development', 'English 101', 'Calc 1', 'Calc 2', 'Calc 3', 'Linear Algebra'];
        $scope.selectedClasses = [];
        $scope.searchTerm = '';

        $scope.displayedAll = makeTableFriendly($scope.allClasses);
        $scope.displayedRecommended = makeTableFriendly($scope.recommendedClasses);
        $scope.conversations = [];

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
                makeTableFriendly($scope.allClasses.filter(function(term) {
                return term.toLowerCase().includes($scope.searchTerm.toLowerCase());
            }).sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            })); 
        } 

        $scope.createConversation = function(classDiscussing) {
            removeFromArray($scope.allClasses, classDiscussing);
            removeFromArray($scope.recommendedClasses, classDiscussing);
            $scope.conversations.push(classDiscussing);

            $scope.displayedAll = makeTableFriendly($scope.allClasses);
            $scope.displayedRecommended = makeTableFriendly($scope.recommendedClasses);
        }

        $scope.removeFromSelected = function(classToRemove){
            removeFromArray($scope.conversations, classToRemove);
            $scope.allClasses.push(classToRemove);
            $scope.displayedAll = makeTableFriendly($scope.allClasses);

        }

        function removeFromArray(arr, item) {
            let indexOfItem = arr.indexOf(item);
            if(indexOfItem != -1) {
                arr.splice(indexOfItem, 1);
            }
        }
    }
});