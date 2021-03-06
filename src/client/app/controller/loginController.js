/**
 * Created by Desyon, Eric on 09.06.2017.
 */

angular.module('ngCalendarApp.controllers')

.controller('LoginController',
    function loginCtrl($scope, $log, $q, $http,
        REST_API_ENDPOINT, $localStorage, $rootScope, $location, notification) {
      $log.debug('Initializing UserController');

      $scope.loginAs = function () {
        let deferred = $q.defer();

        $log.debug('UserService - Sending Post Request');
        let username = $scope.user.username;
        let password = $scope.user.password;

        let data = {
          'username': username,
          'password': password,
        };

        $http.post(REST_API_ENDPOINT + '/user/login', data)
        .then(function (response) {
              $localStorage.currentToken = response.data.token;
              $rootScope.username = username;
              $rootScope.isLoggedIn = true;

              notification.success(response);
              $log.debug('LoginService - Logged in');
              $location.path('/events');

              deferred.resolve(response.data);
            },

            function (response) {
              notification.error(response);
              $log.error('LoginService - Failed to log in');
              deferred.reject(response);
            });

        return deferred.promise;
      };
    }
);
