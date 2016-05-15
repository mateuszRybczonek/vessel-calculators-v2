var app = angular.module('vesselCalculatorsApp',
  ['ngAnimate', 'ui.bootstrap', 'LocalStorageModule', 'ngRoute']);

(function () {
  app
    .directive('mainFrame', mainFrame)
    .directive('inputElement', inputElement)
    .directive('inputElementUnits', inputElementUnits)
    .controller('rigMoveController', rigMoveController)
    .controller('tatVerificationController', tatVerificationController)
    .controller('lblArrayPlanningController', lblArrayPlanningController);
}());


