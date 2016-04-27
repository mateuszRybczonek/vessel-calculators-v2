(function () {
  angular.module('vesselCalculatorsApp',
    ['ngAnimate', 'ui.bootstrap', 'LocalStorageModule'])
    .directive('mainFrame', mainFrame)
    .directive('rigMoveCalculator', rigMoveCalculator)
    .directive('lblArrayPlanning', lblArrayPlanning)
    .directive('tatVerification', tatVerification);
}());
