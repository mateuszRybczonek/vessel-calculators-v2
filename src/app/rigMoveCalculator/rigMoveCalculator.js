function rigMoveCalculator() {
  return {
    restrict: "E",
    templateUrl: "rigMoveCalculator/rigMoveCalculator.html",
    replace: true,
    transclude: false,
    controller: rigMoveController
  }
}

function rigMoveController($scope) {
  $scope.isCollapsedWaypoint = false;
  $scope.WPTTableHeaders = ['WPT no.',
    'WPT name',
    'Coordinate Easting [m]',
    'Coordinate Northing [m]',
    'Distance leg [m]',
    'Distance done [m]',
    'Distance remaining [m]',
    'Time leg',
    'Time remaining',
    'Selected'];

  $scope.WPT = WPT;
}

function WPT(name, easting, northing) {
  this.name = name;
  this.easting = easting;
  this.northing = northing;
}