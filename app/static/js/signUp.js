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
    controller: function($scope, $http, $location, whichPage, profile) {
        whichPage.set('Name, Email, and Password');
        $scope.user = {};
        
        $scope.submitForm = function() {
            profile.setUser($scope.user.email, $scope.user.password, $scope.user.firstName, $scope.user.lastName);
            $location.path('/major');
        }
    }
});

myApp.component('nameMajor', {
    templateUrl: 'nameMajor.template.html',
    controller: function($scope, $http, $location, whichPage, profile) {
        
        whichPage.set('Majors and Minors');
        
        $scope.user = {};
        
        $scope.currentMajors = [];
        $scope.currentMinors = [];
        
        $scope.majors = [];
        $scope.minors = [];
        
        $http({
            method: 'GET',
            url: '/data/majors',
        }).then(
            function(response) {
            $scope.majors = response.data;
            
            $scope.updateMajorSearch();
        },  function(response) {
            $location.path('/major');
        });
        
        $http({
            method: 'GET',
            url: '/data/minors',
        }).then(
            function(response) {
            $scope.minors = response.data;
            
            $scope.updateMinorSearch();
        },  function(response) {
            $location.path('/major');
        });
        
        
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
            });  
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
            });  
        }
        
        $scope.submitForm = function() {
            profile.setMajors = $scope.currentMajors;
            profile.setMinors = $scope.currentMinors;
            
            $location.path('/interests');
        }
        
    }
});

myApp.component('interestSelect', {
    templateUrl: 'interestSelect.template.html',
    controller: function($scope, $http, $location, whichPage, profile) {
        whichPage.set('Select Interests and Clubs');
        
        $scope.currentInterests = [];
        $scope.currentClubs = [];
        
        $scope.interests = [];
        $scope.clubs = [];
        
        $http({
            method: 'GET',
            url: '/data/interests',
        }).then(
            function(response) {
            $scope.interests = response.data;
            
            $scope.updateInterestSearch();
        },  function(response) {
            $location.path('/interests');
        });
        
        $http({
            method: 'GET',
            url: '/data/clubs',
        }).then(
            function(response) {
            $scope.clubs = response.data;
            
            $scope.updateClubSearch();
        },  function(response) {
            $location.path('/interests');
        });     
        
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
            });  
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
            });
        }
        
        $scope.submitForm = function() {
            profile.setInterests = $scope.currentInterests;
            profile.setClubs = $scope.currentClubs;
            
            $location.path('/classes');
        }
    }
});

myApp.component('classSelect', {
    templateUrl: 'classSelect.template.html',
    controller: function($scope, $http, $window, whichPage, profile) {
        whichPage.set('Previously taken Courses');
        
        $scope.allCourses = [];
        
        $scope.current = {
            classSearch: '',
            department: ''
        }
        
        $scope.semester = {
            season: '',
            year: ''
        }
        
        $http({
            method: 'GET',
            url: '/courses',
        }).then(
            function(response) {
            $scope.allCourses = response.data;
        },  function(response) {
            $location.path('/classes');
        });
        
        $scope.semesterCourses = [];
        $scope.chosenCourses = [];        
        
        $scope.years = [2013, 2014, 2015, 2016, 2017];
        
        $scope.reasons = ['For major (wanted to)', 'For major (required)', 'For gen ed (wanted to)', 'For gen ed (required)', 'For interest (wanted to)', 'For interest (required)'];
        
        $scope.selectedClasses = [];
        
        $scope.currentClasses = [];
        
        $scope.updateSemesterCourses = function(season, year) {
            $scope.semesterCourses = $scope.allCourses.filter(function(course) {
                return course.season == season && course.year == year;
            });
            $scope.updateClassSearch();
        }
        
        $scope.addClassToSelected = function(item) {
            $scope.selectedClasses.push(item);
            removeFromArray(item, $scope.semesterCourses);
            $scope.updateClassSearch();
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
                makeTableFriendly($scope.semesterCourses.filter(function(course) {
                    
                return  course.courseName.toLowerCase().includes($scope.current.classSearch.toLowerCase()) || 
                        course.departmentCode.toLowerCase().includes($scope.current.classSearch.toLowerCase()) ||
                        course.departmentName.toLowerCase().includes($scope.current.classSearch.toLowerCase()) ||
                        course.courseNumber.toLowerCase().includes($scope.current.classSearch.toLowerCase());
            }).sort(function(a, b) {
                return a.courseName.toLowerCase().localeCompare(b.courseName.toLowerCase());
            })); 
        }
        
        $scope.addClassFinal = function(course) {
            let reason = $scope.current[$scope.semester.year][$scope.semester.season][course].reason;          
            $scope.chosenCourses.push({
                course: course,
                reason: reason,
            });
            $scope.selectedClasses.splice($scope.selectedClasses.indexOf(course), 1);
        }
        
        $scope.removeClass = function(item) {
            $scope.selectedClasses.splice($scope.selectedClasses.indexOf(item), 1);
            $scope.semesterCourses.push(item);
            $scope.updateClassSearch();
        }
        
        $scope.removeFromCurrentClasses = function(item) {
            $scope.chosenCourses.splice($scope.chosenCourses.indexOf(item), 1);
            $scope.semesterCourses.push(item);
            $scope.updateClassSearch();
        }
        
        $scope.submitForm = function() {
            profile.setCoursesTaken($scope.chosenCourses.map(function(course) {
                return course._id;
            }));
            let result = {
                user: profile.getUser(),
                profile: profile.getProfile(),                
            }
            $http({
                method: 'POST', 
                url: '/signUp',
                data: result,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            $window.location.href = '/home';
        }
    }
});

myApp.service('whichPage', function() {
    let page = 'Email and Password';
    
    return {
        set: function(text) {page = text},
        get: function() {return page}
    }
});


myApp.service('profile', function() {
    let profile = {
        interests: [],
        clubs: [],
        majors: [],
        minors: [],
        chats: [],
        coursesTaken: [],
    }
    
    let user = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    }
    
    
    return {
        setInterests: function(interests) {profile.interests = interests;},
        setClubs: function(clubs) {profile.clubs = clubs;},
        setMajors: function(majors) {profile.majors = majors;},
        setMinors: function(minors) {profile.minors = minors;},
        setCoursesTaken: function(coursesTaken) {profile.coursesTaken = coursesTaken;},
        getProfile: function() {return profile;},
        setUser: function(email, password, firstName, lastName) {
            user.email = email;
            user.password = password;
            user.firstName = firstName;
            user.lastName = lastName;
        },
        getUser: function() {return user;}
        
    }
})