function mainFrame(){
  return {
    restrict: "E",
    templateUrl: "directives/mainFrame/mainFrame.tpl.html",
    controller: mainController
  }
}

function mainController($scope) {
  $scope.accordion = 0;
  $scope.isCollapsed = true;
}


