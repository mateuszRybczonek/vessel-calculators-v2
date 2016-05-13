var app = angular.module('vesselCalculatorsApp',
  ['ngAnimate', 'ui.bootstrap', 'LocalStorageModule', 'ngRoute']);

(function () {
  app
    .directive('mainFrame', mainFrame)
    .controller('rigMoveController', rigMoveController)
    .controller('tatVerificationController', tatVerificationController)
    .controller('lblArrayPlanningController', lblArrayPlanningController);
}());


