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
          templateUrl: 'core/rigMoveCalculator/rigMoveCalculator.tpl.html',
          controller: 'rigMoveController'
        })
      .when('/LBLArrayPlanning',
        {
          templateUrl: 'core/LBLArrayPlanning/lblArrayPlanning.tpl.html',
          controller: 'lblArrayPlanningController'
        })
      .when('/TATVerification',
        {
          templateUrl: 'core/TATVerification/tatVerification.tpl.html',
          controller: 'tatVerificationController'
        })
  });
}());