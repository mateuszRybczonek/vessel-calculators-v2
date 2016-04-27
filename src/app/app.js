(function () {
  angular.module('vesselCalculatorsApp',
    ['ngAnimate', 'ui.bootstrap', 'LocalStorageModule'])
    .directive('mainFrame', mainFrame);
}());
