(function () {
  app.controller('app', function($scope, $location){
    $scope.setRoute = function(path) {
      if ($location.path().substr(0, path.length) == path) {
        return "active"
      } else {
        return ""
      }
    }
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/',
        {
          template: ""
        })
      .when('/rigMoveCalculator',
        {
          templateUrl: 'core/rigMoveCalculator/rigMoveCalculator.html',
          controller: 'rigMoveController'
        })
      .when('/LBLArrayPlanning',
        {
          templateUrl: 'core/LBLArrayPlanning/LBLArrayPlanning.html',
          controller: 'lblArrayPlanningController'
        })
      .when('/TATVerification',
        {
          templateUrl: 'core/TATVerification/TATVerification.html',
          controller: 'tatVerificationController'
        })
  });
}());