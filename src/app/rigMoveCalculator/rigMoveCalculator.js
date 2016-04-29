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
  $scope.track = {};
  $scope.selectedIndex = -1;

  $scope.WPT = WPT;
  $scope.addNewWPT = addNewWPT;
  $scope.exportToJSON = exportToJSON;
  $scope.importFromJSON = importFromJSON;
  $scope.clearTable = clearTable;
  $scope.readWPT = readWPT;
  $scope.updateSelectedRow = updateSelectedRow;
  $scope.removeSelectedRow = removeSelectedRow;
  $scope.selectRow = selectRow;

  function WPT(name, easting, northing, index) {
    this.name = name;
    this.easting = easting;
    this.northing = northing;
    this.index = index;
  }

  function addNewWPT() {
    var WPTDataInputs = $(".WPT-data .form-control");
    var newWPT = new WPT(WPTDataInputs[0].value,
      WPTDataInputs[1].value,
      WPTDataInputs[2].value,
      $scope.WPTS.length + 1);
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
    $scope.apply();
  }

  function readWPT() {
    var tableWPT = $(".tableWPT")[0];
    var rowCount = tableWPT.rows.length;
    for (var row = 0; row < rowCount; row++) {
      if (tableWPT.rows[row].cells[9].firstChild.checked == 1) {
        for (var iteration = 1; iteration < 4; iteration++) {
          newText = tableWPT.rows[row].cells[iteration].innerHTML;
          var item = $(".WPT-data input");
          item[iteration - 1].value = newText;
        }
      }
    }
  }

  function updateSelectedRow() {
    var WPTDataInputs = $(".WPT-data .form-control");
    var updatedWPT = new WPT(WPTDataInputs[0].value,
      WPTDataInputs[1].value,
      WPTDataInputs[2].value,
      $scope.selectedIndex + 1);

    $scope.WPTS[$scope.selectedIndex] = updatedWPT;
  }

  function removeSelectedRow() {
    $scope.WPTS.splice($scope.selectedIndex, 1);
    $scope.WPTS.map(function (WPT, index) {
      WPT.index = index + 1;
    });
    console.log($scope.WPTS);

  }

  function selectRow(WPTIndex) {
    $scope.selectedIndex = WPTIndex - 1;
    var selectedRow = $('.tableWPT > tbody > tr')[$scope.selectedIndex];
    console.log(selectedRow);
    console.log(selectedRow.childNodes[19].firstChild.checked = 1);

  }

}



