myApp = angular.module('signUp', ['ngRoute']);

myApp.config(function($routeProvider) {
    $routeProvider.when('/', {
        template: '<name-major></name-major>'
    }).otherwise('/');
});

myApp.component('headerTop', {
    templateUrl: 'headerTop.template.html',
    controller: function($scope, whichPage) {
        $scope.currentPage = whichPage.get();
    }
});

myApp.component('emailPassword', {
    templateUrl: 'emailPassword.template.html',
    controller: function($scope, $http, whichPage) {
        whichPage.set('Email and Password');
        
        $scope.user = {};
        
        $scope.submitForm = function() {
            $http({
                method: 'POST', 
                url: '/',
                data: $scope.user,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }
    }
});

myApp.component('nameMajor', {
    templateUrl: 'nameMajor.template.html',
    controller: function($scope, $http, whichPage) {
        
        whichPage.set('Name and Major');
        
        $scope.majors = ['CompSci', 'Anthropology', 'Linguistics'];
        $scope.minors = ['CompSci', 'Math', 'Data Science'];
        $scope.user = {};
        
        let numMajors = 1;
        let numMinors = 0;
        
        $scope.majorItems = [{
            majorNum: 1,
            model: 'user.major1'
        }];
        
        $scope.minorItems = [];
        
        $scope.addNewMajor = function() {
            numMajors += 1;
            $scope.majorItems.push({
                majorNum: numMajors,
                model: 'user.major' + numMajors,
            });
        }
        
        $scope.addNewMinor = function() {
            numMinors += 1;
            $scope.minorItems.push({
                minorNum: numMinors,
                model: 'user.minor' + numMinors,
            });
        }
        
        $scope.submitForm = function() {
            $http({
                method: 'POST', 
                url: '/',
                data: $scope.user,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }
        

    }
});

myApp.component('interestSelect', {
    templateUrl: 'interestSelect.template.html',
    controller: function($scope, whichPage) {
        whichPage.set('Clubs and Interests');
    }
});

myApp.component('classSelect', {
    templateUrl: 'classSelect.template.html',
    controller: function($scope, whichPage) {
        whichPage.set('Previously taken Courses');
    }
});

myApp.service('whichPage', function() {
    let page = 'Email and Password';
    
    return {
        set: function(text) {page = text},
        get: function() {return page}
    }
})