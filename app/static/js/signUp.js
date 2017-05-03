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
    templateUrl: 'templates/headerTop.template.html',
    controller: function($scope, whichPage) {
        $scope.currentPage = whichPage.get();
    }
});

myApp.component('emailPassword', {
    templateUrl: 'templates/emailPassword.template.html',
    controller: function($scope, $http, $location, whichPage, profile) {
        whichPage.set('Name, Email, and Password, 1/4');
        $scope.user = {
            firstName: '',
            lastName: '',
            password: '',
            password2: '',
            email: '',
        };
        $scope.invalidFirstName = false;
        $scope.invalidLastName = false;
        $scope.invalidEmail = false;
        $scope.emailTaken = false;
        $scope.invalidPassword = false;
        $scope.invalidPassword2 = false;
        
        $scope.submitForm = function() {
            if($scope.user.firstName == '') {
                $scope.invalidFirstName = true;
            } else {
                $scope.invalidFirstName = false;
            }
            if($scope.user.lastName == '') {
                $scope.invalidLastName = true;
            } else {
                $scope.invalidLastName = false;
            }
            if($scope.user.password.length < 8) {
                $scope.invalidPassword = true;
            } else {
                $scope.invalidPassword = false;
            }
            if($scope.user.password2.length < 8 || $scope.user.password != $scope.user.password2) {
                $scope.invalidPassword2 = true;
            } else {
                $scope.invalidPassword2 = false;
            }
            if(!$scope.user.email.includes('@macalester.edu')) {
                $scope.invalidEmail = true;
                $scope.emailTaken = false;
            } else {
                $scope.invalidEmail = false;
                    $http({
                        method: 'GET',
                        url: '/checkUser/' + $scope.user.email,
                    }).then(function(response) {
                        if (response.data.validUser) {
                            $scope.emailTaken = false;
                        } else {
                            $scope.emailTaken = true;
                        }
                        if (validInput()) {
                            profile.setUser($scope.user.email, $scope.user.password, $scope.user.firstName, $scope.user.lastName);
                            $location.path('/major');
                        }
                        
                    }, function(response) {
                        $scope.emailTaken = true;
                    });
            }
            
        }
        
        function validInput() {
            return !$scope.invalidEmail && !$scope.invalidFirstName && !$scope.invalidLastName && !$scope.invalidPassword && !$scope.invalidPassword2 && !$scope.emailTaken;
        }
    }
});

myApp.component('nameMajor', {
    templateUrl: 'templates/nameMajor.template.html',
    controller: function($scope, $http, $location, whichPage, profile) {
        
        whichPage.set('Majors and Minors, 2/4');
        
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
            profile.setMajors($scope.currentMajors);
            profile.setMinors($scope.currentMinors);
            
            $location.path('/interests');
        }
        
    }
});

myApp.component('interestSelect', {
    templateUrl: 'templates/interestSelect.template.html',
    controller: function($scope, $http, $location, whichPage, profile) {
        whichPage.set('Select Interests and Clubs, 3/4');
        
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
            profile.setInterests($scope.currentInterests);
            profile.setClubs($scope.currentClubs);
            
            $location.path('/classes');
        }
    }
});

myApp.component('classSelect', {
    templateUrl: 'templates/classSelect.template.html',
    controller: function($scope, $http, $window, $location, whichPage, profile) {
        whichPage.set('Previously taken Courses, 4/4');
        
        $scope.allCourses = [];
        
        $scope.season = '';
        $scope.year = '';
        
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
            $scope.season = season;
            $scope.year = year;
            let temp = $scope.allCourses.filter(function(course) {
                return course.season == season && course.year == year;
            });
            for (let i = 0; i < temp.length - 1; i ++) {
                if (temp[i + 1].courseName != temp[i].courseName) {
                    $scope.semesterCourses.push(temp[i]);
                }
            }
            $scope.selectedClasses.forEach(function(course) {
                $scope.removeClass(course);
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
        
        $scope.addClassFinal = function(course) {
            if (course.reason) {
                course.noReason = false;
                $scope.chosenCourses.push({
                course: course,
                reason: course.reason,
            });
            $scope.selectedClasses.splice($scope.selectedClasses.indexOf(course), 1);
            } else {
                course.noReason = true;
            }
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
                return {
                    course: course.course._id,
                    reason: course.reason,
                }
            }));
            let result = {
                user: JSON.stringify(profile.getUser()),
                email: profile.getEmail(),
                password: profile.getPassword(),
            }
            $http({
                method: 'POST', 
                url: '/signUp',
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                },
                data: result,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                $window.location.href = '/home'
            }, function(response) {
                $window.location.href = '/home'
            });
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
    let user = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        interests: [],
        clubs: [],
        majors: [],
        minors: [],
        chats: [],
        coursesTaken: [],
        
    }    
    
    return {
        setInterests: function(interests) {user.interests = interests; },
        setClubs: function(clubs) {user.clubs = clubs;},
        setMajors: function(majors) {user.majors = majors;},
        setMinors: function(minors) {user.minors = minors;},
        setCoursesTaken: function(coursesTaken) {user.coursesTaken = coursesTaken;},
        setUser: function(email, password, firstName, lastName) {
            user.email = email;
            user.password = password;
            user.firstName = firstName;
            user.lastName = lastName;
        },
        getEmail: function() {return user.email; },
        getPassword: function() {return user.password; },
        getUser: function() {return user;}
        
    }
})