myApp = angular.module('signUp', ['ngRoute']);

myApp.config(function($routeProvider) {
    $routeProvider.when('/', {
        template: '<email-password></email-password>'
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
    controller: function($scope, whichPage) {
        whichPage.set('Email and Password');
    }
});

myApp.component('nameMajor', {
    templateUrl: 'nameMajor.template.html',
    controller: function($scope, whichPage) {
        whichPage.set('Name and Major');
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