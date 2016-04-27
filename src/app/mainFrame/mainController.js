function mainController($scope) {
  $scope.accordion = 0;
  $scope.tab = 1;
  $scope.isCollapsed = true;

  $scope.selectTab = function (setTab) {
    if (setTab > 0 && setTab <= 4) {
      $scope.tab = setTab;
      $scope.isCollapsed = !$scope.isCollapsed
    }
    else $scope.tab = 1;
  };

  $scope.ifTabSelected = function (checkTab) {
    return $scope.tab === checkTab;
  };
}
