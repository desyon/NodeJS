/**
 * Created by Desyon, Eric on 06.06.17.
 */

angular.module('ngCalendarApp', [
  'ngAnimate',
  'ngStorage',
  'ui.bootstrap',
  'ui.router',
  'ui-notification',
  'ngCalendarApp.config',
  'ngCalendarApp.templates',
  'ngCalendarApp.controllers',
])
.factory('httpRequestInterceptor', function ($localStorage) {
  return {
    request: function (config) {
      config.headers['Authorization'] = $localStorage.currentToken;
      config.headers['Content-Type'] = 'application/json';

      return config;
    },
  };
})

.config(
    function (ENABLE_DEBUG, $logProvider, $stateProvider, NotificationProvider,
        $urlRouterProvider, $httpProvider, $qProvider) {
      $httpProvider.interceptors.push('httpRequestInterceptor');
      $logProvider.debugEnabled(ENABLE_DEBUG);
      $urlRouterProvider.otherwise('/login');

      // Ignore unhandled rejections
      $qProvider.errorOnUnhandledRejections(false);

      NotificationProvider.setOptions({
        delay: 3000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'left',
        positionY: 'bottom',
        maxCount: 3,
      });

      $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/views/login.tpl.html',
        controller: 'LoginController',
      })
      .state('register', {
        url: '/register',
        templateUrl: 'app/views/register.tpl.html',
        controller: 'RegisterController',
      })
      .state('events', {
        url: '/events',
        templateUrl: 'app/views/events.tpl.html',
        controller: 'EventController',
      })
      .state('eventDetail', {
        url: '/eventDetail',
        templateUrl: 'app/views/eventDetail.tpl.html',
        controller: 'EventController',
      })
      .state('categories', {
        url: '/categories',
        templateUrl: 'app/views/categories.tpl.html',
        controller: 'CategoryController',
      })
      .state('categoryDetail', {
        url: '/categoryDetail',
        templateUrl: 'app/views/categoryDetail.tpl.html',
        controller: 'CategoryController',
      })
      .state('account', {
        url: '/account',
        templateUrl: 'app/views/account.tpl.html',
        controller: 'UserController',
      });
    })

.run(
    function ($rootScope, $location, $http, $localStorage, $log, notification) {
      $rootScope.isLoggedIn = false;
    }
)

.controller('AppController',
    function ($scope, $log, $localStorage, $rootScope, $http, $location,
        notification) {
      $log.debug('CalendarApp initialized');

      $rootScope.isLoggedIn = false;
      if ($localStorage.currentToken !== undefined) {
        $log.debug('Found Token - Logged In');
        $rootScope.isLoggedIn = true;
      }

      $scope.logout = function () {
        $localStorage.currentToken = undefined;

        $rootScope.isLoggedIn = false;
        notification.success({data: {msg: 'Success'}});
        $log.debug('AppService - User logged out');
        $location.path('/login');
      };
    }
);

angular.module('ngCalendarApp.controllers', []);
