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
  $scope.WPTTableHeaders = ['#',
    'WPT name',
    'Easting [m]',
    'Northing [m]',
    'Distance leg [m]',
    'Dist. done [m]',
    'Dist. remaining [m]',
    'Time leg',
    'Time remaining',
    'Selected'];
  $scope.WPTS = [];
  $scope.track = {};
  $scope.selectedIndex = -1;
  $scope.showForms = false;

  $scope.WPT = WPT;
  $scope.addNewWPT = addNewWPT;
  $scope.exportToJSON = exportToJSON;
  $scope.importFromJSON = importFromJSON;
  $scope.clearTable = clearTable;
  $scope.removeRow = removeRow;
  $scope.saveChanges = saveChanges;

  function WPT(name, easting, northing, index) {
    this.name = name;
    this.easting = easting;
    this.northing = northing;
    this.index = index;
  }

  function addNewWPT() {
    var newWPT = new WPT("","","","");
    $scope.WPTS.push(newWPT);
  }

  function exportToJSON() {
    $scope.track.trackName = $('.track-name input')[0].value;
    $scope.track.projectedSpeed = $('.projected-speed input')[0].value;
    $scope.track.WPTJSON = $scope.WPTJSON;
    var exportData = JSON.stringify($scope.track);
    //create default file name
    var fileName = $scope.track.trackName + "-RigMove";
    var uri = 'data:JSON; charset=utf-8,' + exportData;
    // generate temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;
    //visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".json";
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function importFromJSON() {
    var input, file, fileReader, lines;
    input = $('#select-file')[0];
    if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file to load first");
    }
    else {
      file = input.files[0];
      fileReader = new FileReader();
      fileReader.onload = receivedText;
      fileReader.readAsText(file);
    }

    function receivedText(e) {
      lines = e.target.result;
      $scope.WPTJSON = JSON.parse(lines);
      $('.track-name-input')[0].value = $scope.WPTJSON.trackName;
      $('.projected-speed-input')[0].value = $scope.WPTJSON.projectedSpeed;
      $scope.WPTS = $scope.WPTJSON.WPTS;
      $scope.$apply();
    }
  }

  function clearTable() {
    $scope.WPTS = [];
  }

  function saveChanges (index, name, easting, northing) {
    $scope.WPTS[index] = {'index': index+1, 'name':name, 'easting':easting, 'northing':northing};
  }

  function removeRow(selectedIndex) {
    $scope.WPTS.splice(selectedIndex, 1);
    $scope.WPTS.map(function (WPT, index) {
      WPT.index = index + 1;
    });
    console.log($scope.WPTS);

  }

}



