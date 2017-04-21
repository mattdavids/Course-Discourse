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
    controller: function($scope, $http, $window, whichPage) {
        whichPage.set('Previously taken Courses');
        
        $scope.current = {
            classSearch: '',
            department: 'CompSci'
        }
        
        $scope.years = [2012, 2013, 2014, 2015, 2016, 2017];
        $scope.departments = ['CompSci', 'Anthropology', 'Wizarding'];
        $scope.CompSci = ['intro to CS', 'intro to other', 'intro to programming', 'intro to computing', 'intro to math', 'intro to logic','intro to CS', 'intro to other', 'intro to programming', 'intro to computing', 'intro to math', 'intro to logic','intro to CS', 'intro to other', 'intro to programming', 'intro to computing', 'intro to math', 'intro to logic','intro to CS', 'intro to other', 'intro to programming', 'intro to computing', 'intro to math', 'intro to logic','intro to CS', 'intro to other', 'intro to programming', 'intro to computing', 'intro to math', 'intro to logic','intro to CS', 'intro to other', 'intro to programming', 'intro to computing', 'intro to math', 'intro to logic'];
        $scope.Anthropology = ['intro to CS', 'intro to other', 'intro to programming', 'intro to computing', 'intro to math', 'intro to logic'];
        $scope.Wizarding = ['intro to CS', 'intro to other', 'intro to programming', 'intro to computing', 'intro to math', 'intro to logic'];
        
        $scope.classes = ['intro to CS', 'intro to other', 'intro to programming', 'intro to computing', 'intro to math', 'intro to logic', 'economics 401', 'economics 402', 'economics 403', 'economics 404', 'economics 405', 'economics 406', 'economics 407', 'economics 408'];
        
        $scope.reasons = ['For major (wanted to)', 'For major (required)', 'For gen ed (wanted to)', 'For gen ed (required)', 'For interest (wanted to)', 'For interest (required)'];
        
        $scope.selectedClasses = [];
        
        $scope.currentClasses = [];
        
        $scope.currentDepartmentClasses = [];
        
        $scope.departmentUpdate = function() {
            $scope.currentDepartmentClasses = makeTableFriendly($scope.getClasses($scope.current.department));
        }
        
        $scope.getClasses = function(department) {
            return $scope.CompSci;
        }
        
        $scope.addClassToSelected = function(item) {
            $scope.selectedClasses.push(item);
            removeFromArray(item, $scope.classes);
            removeFromArray(item, $scope.CompSci);
            $scope.updateClassSearch();
            $scope.departmentUpdate();
            
        }
        
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
        
        function removeFromArray(item, array) {
            array.splice(array.indexOf(item), 1);
        }
        
        $scope.updateClassSearch = function() {
            $scope.classResult =
                makeTableFriendly($scope.classes.filter(function(term) {
                return term.toLowerCase().includes($scope.current.classSearch.toLowerCase());
            }).sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            })); 
        }
        
        $scope.addClassFinal = function(item) {
            $scope.currentClasses.push(item);
            $scope.selectedClasses.splice($scope.selectedClasses.indexOf(item), 1);
        }
        
        $scope.removeClass = function(item) {
            $scope.selectedClasses.splice($scope.selectedClasses.indexOf(item), 1);
            $scope.classes.push(item);
            $scope.CompSci.push(item);
            $scope.updateClassSearch();
            $scope.departmentUpdate();
            
        }
        
        $scope.removeFromCurrentClasses = function(item) {
            $scope.currentClasses.splice($scope.currentClasses.indexOf(item), 1);
            $scope.classes.push(item);
            $scope.CompSci.push(item);
            $scope.updateClassSearch();
            $scope.departmentUpdate();
        }
        
        $scope.submitForm = function() {
            $http({
                method: 'POST', 
                url: '/',
                data: $scope.current,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            $window.location.href = '/home';
        }
        
        $scope.departmentUpdate();
        $scope.updateClassSearch();
    }
});

myApp.service('whichPage', function() {
    let page = 'Email and Password';
    
    return {
        set: function(text) {page = text},
        get: function() {return page}
    }
})