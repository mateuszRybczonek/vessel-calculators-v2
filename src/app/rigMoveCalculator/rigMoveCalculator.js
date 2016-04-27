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
  $scope.WPTS = [];

  $scope.WPT = WPT;
  $scope.addNewWPT = addNewWPT;

  function WPT(name, easting, northing, index) {
    this.name = name;
    this.easting = easting;
    this.northing = northing;
    this.index = index;
  }

  function addNewWPT (name, easting, northing){
    var newWPT = new WPT(name, easting, northing, $scope.WPTS.length+1);
    $scope.WPTS.push(newWPT);
    console.log($scope.WPTS);
  }
}

