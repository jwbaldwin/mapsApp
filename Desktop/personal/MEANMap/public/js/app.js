// Declares the initial angular module "meanMapApp". Module grabs other controllers and services.
var app = angular.module('meanMapApp', ['addCtrl', 'geolocation', 'gservice', 'ngRoute'])

    // Configures Angular routing -- showing the relevant view and controller when needed.
    .config(function($routeProvider){

        // Join Team Control Panel
        $routeProvider.when('/join', {
            controller: 'addCtrl',
            templateUrl: 'partials/addForm.html',
        // Find Teammates Control Panel
        }).when('/find', {
            templateUrl: 'partials/queryForm.html',
        //Login view
        }).when('/login', {
            templateUrl: 'partials/login.html',
        //Otherwise go to Join Team Control Panel
    }).otherwise({redirectTo:'/login'});
    });
