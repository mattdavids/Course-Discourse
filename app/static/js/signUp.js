myApp = angular.module('signUp', ['ngRoute']);

myApp.config(function($routeProvider) {
    $routeProvider.when('/', {
        template: '<email-password></email-password>'
    }).when('/major', {
        template: '<name-major></name-major>'
    }).when('/interests', {
        template: '<interest-select></interest-select>'
    }).when('/classes', {
        template: '<class-select></class-select>'
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
    controller: function($scope, $http, $location, whichPage) {
        whichPage.set('Name, Email, and Password');
        $scope.user = {};
        
        $scope.submitForm = function() {
            $http({
                method: 'POST', 
                url: '/',
                data: $scope.user,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            $location.path('/major');
        }
    }
});

myApp.component('nameMajor', {
    templateUrl: 'nameMajor.template.html',
    controller: function($scope, $http, $location, whichPage) {
        
        whichPage.set('Majors and Minors');
        
        $scope.user = {};
        
        $scope.currentMajors = [];
        $scope.currentMinors = [];
        
        $scope.majors = ['Academics', 'Reading', 'Hearthstone', 'Dogs', 'Cats', 'Table Tennis', 'Miniature Sports', 'Model Trains', 'War Gaming', 'Gaming', 'Origami', 'Competative Battleship', 'Jogging', 'Competative Eating', 'Computers', 'Street Fighting', 'Street Fighter', 'Back Alley Brawls'];       
        $scope.minors = ['CompSci', 'Math', 'Data Science'];
        
        $scope.search = {
            minorVal: '',
            majorVal: ''
        };
        
        $scope.addMajor = function(major) {
            $scope.currentMajors.push(major);
            $scope.majors.splice($scope.majors.indexOf(major), 1);
            $scope.updateMajorSearch();
            $scope.currentMajors.sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        }
        
        $scope.deleteMajor = function(major) {
            $scope.currentMajors.splice($scope.currentMajors.indexOf(major), 1);
            $scope.majors.push(major);
            $scope.updateMajorSearch();
        }
        
        $scope.updateMajorSearch = function() {
            $scope.majorsResult = $scope.majors.filter(function(term) {
                return term.toLowerCase().includes($scope.search.majorVal.toLowerCase());
            }).sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            }).slice(0, 5);  
        }
        
        $scope.addMinor = function(minor) {
            $scope.currentMinors.push(minor);
            $scope.minors.splice($scope.minors.indexOf(minor), 1);
            $scope.updateMinorSearch();
            $scope.currentMinors.sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        }
        
        $scope.deleteMinor = function(minor) {
            $scope.currentMinors.splice($scope.currentMinors.indexOf(minor), 1);
            $scope.minors.push(minor);
            $scope.updateMinorSearch();
        }
        
        $scope.updateMinorSearch = function() {
            $scope.minorsResult = $scope.minors.filter(function(term) {
                return term.toLowerCase().includes($scope.search.minorVal.toLowerCase());
            }).sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            }).slice(0, 5);  
        }
        
        $scope.submitForm = function() {
            $scope.user.currentMajors = $scope.currentMajors;
            $scope.user.currenMinors = $scope.currentMinors;
            $http({
                method: 'POST', 
                url: '/',
                data: $scope.user,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            $location.path('/clubs');
        }
        $scope.updateMajorSearch();
        $scope.updateMinorSearch();
        
        $scope.submitForm = function() {
            $http({
                method: 'POST', 
                url: '/',
                data: $scope.user,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            $location.path('/interests');
        }
        

    }
});

myApp.component('interestSelect', {
    templateUrl: 'interestSelect.template.html',
    controller: function($scope, $http, $location, whichPage) {
        whichPage.set('Select Interests and Clubs');
        
        $scope.currentInterests = [];
        
        $scope.interests = ['Academics', 'Reading', 'Hearthstone', 'Dogs', 'Cats', 'Table Tennis', 'Miniature Sports', 'Model Trains', 'War Gaming', 'Gaming', 'Origami', 'Competative Battleship', 'Jogging', 'Competative Eating', 'Computers', 'Street Fighting', 'Street Fighter', 'Back Alley Brawls'];       
        
        $scope.currentClubs = [];
        
        $scope.clubs = ['Bridge', 'Mac Weekly', 'Anime', 'Yarn', 'Fossil Free', 'Minnesota Public Interest Group']; 
        
        $scope.search = {
            interestsVal: '',
            clubVal: ''
        };
        
        $scope.addInterest = function(interest) {
            $scope.currentInterests.push(interest);
            $scope.interests.splice($scope.interests.indexOf(interest), 1);
            $scope.updateInterestSearch();
            $scope.currentInterests.sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        }
        
        $scope.deleteInterest = function(interest) {
            $scope.currentInterests.splice($scope.currentInterests.indexOf(interest), 1);
            $scope.interests.push(interest);
            $scope.updateInterestSearch();
        }
        
        $scope.updateInterestSearch = function() {
            $scope.interestsResult = $scope.interests.filter(function(term) {
                return term.toLowerCase().includes($scope.search.interestsVal.toLowerCase());
            }).sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            }).slice(0, 5);  
        }
        
        $scope.addClub = function(club) {
            $scope.currentClubs.push(club);
            $scope.clubs.splice($scope.clubs.indexOf(club), 1);
            $scope.updateClubSearch();
            $scope.currentClubs.sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        };
        
        $scope.deleteClub = function(club) {
            $scope.currentClubs.splice($scope.currentClubs.indexOf(club), 1);
            $scope.clubs.push(club);
            $scope.updateClubSearch();
        }
        
        $scope.updateClubSearch = function() {
            $scope.clubsResult = $scope.clubs.filter(function(term) {
                return term.toLowerCase().includes($scope.search.clubVal);
            }).sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            }).slice(0, 5);
        }
        
        $scope.submitForm = function() {
            $http({
                method: 'POST', 
                url: '/',
                data: {
                    Interests: $scope.currentInterests,
                    Clubs: $scope.currentClubs
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            $location.path('/classes');
        }
        $scope.updateInterestSearch();
        $scope.updateClubSearch();
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