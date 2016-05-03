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
  $scope.moveUp = moveUp;
  $scope.moveDown = moveDown;
  $scope.calculate = calculate;

  function WPT(name, easting, northing, index) {
    this.name = name;
    this.easting = easting;
    this.northing = northing;
    this.index = index;
  }

  function addNewWPT() {
    var newWPT = new WPT("", "", "", "");
    $scope.WPTS.push(newWPT);
    calculate();
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

  function saveChanges(index, name, easting, northing) {
    $scope.WPTS[index] = {'index': index + 1, 'name': name, 'easting': easting, 'northing': northing};
    calculate();
  }

  function removeRow(selectedIndex) {
    $scope.WPTS.splice(selectedIndex, 1);
    debugger;
    $scope.WPTS.map(function (WPT, index) {
      WPT.index = index + 1;
    });
    calculate();
  }

  function moveRow(start, end) {
    var stash = $scope.WPTS[end];
    $scope.WPTS[end] = $scope.WPTS[start];
    $scope.WPTS[start] = stash;
    $scope.WPTS[start].index = start + 1;
    $scope.WPTS[end].index = end + 1;
  }

  function moveUp(index) {
    moveRow(index, index - 1);
    calculate();
  }

  function moveDown(index) {
    moveRow(index, index + 1);
    calculate();
  }

  function calculate() {
    var iteration;
    var myTable = $('.tableWPT>tbody')[0]; //select table as var
    var rowCount = myTable.rows.length;
    var eastingDifference, northingDifference, dDistanceLeg, dDistanceDone, dDD1, dDD2, dTimeLeg, speed, hours, minutes, dDistanceRemaining, dDistanceRemaining1stRow, dTimeRemaining, dTimeRemaining1stRow, speed1stRow, hours1stRow, minutes1stRow;

    function legDistanceCalculation() {
      for (iteration = 1; iteration < rowCount; iteration++) {
        eastingDifference = (myTable.rows[iteration].cells[3].textContent - myTable.rows[iteration - 1].cells[3].textContent);
        northingDifference = (myTable.rows[iteration].cells[5].textContent - myTable.rows[iteration - 1].cells[5].textContent);
        dDistanceLeg = Math.sqrt(eastingDifference * eastingDifference + northingDifference * northingDifference);
        myTable.rows[iteration].cells[7].textContent = dDistanceLeg.toFixed(0);
      }
    }

    function distanceDoneCalculation() {
      for (iteration = 1; iteration < rowCount; iteration++) {
        //if previous distanceDone empty
        if (myTable.rows[iteration - 1].cells[7].textContent == null) {
          dDistanceDone = parseFloat(0 + myTable.rows[iteration].cells[7].textContent);
        }
        else if (myTable.rows[iteration - 1].cells[7].textContent == "") {
          dDistanceDone = parseFloat(0 + myTable.rows[iteration].cells[7].textContent);
        }
        else {
          dDD1 = myTable.rows[iteration - 1].cells[8].textContent; //previous leg
          dDD2 = myTable.rows[iteration].cells[7].textContent; // current leg
          dDistanceDone = parseFloat(dDD1) + parseFloat(dDD2);
        }

        myTable.rows[iteration].cells[8].textContent = dDistanceDone;
      }
    }

    function legTimeCalculation() {
      for (iteration = 1; iteration < rowCount; iteration++) {
        {
          speed = $('.projected-speed-input').val();
          dTimeLeg = (myTable.rows[iteration].cells[7].textContent) / 1852 / speed;
          hours = Math.round(dTimeLeg);
          minutes = ((dTimeLeg - hours) * 60);
          if (minutes < 0) minutes = 60 + minutes;
          myTable.rows[iteration].cells[10].textContent = hours + " h " + minutes.toFixed(0) + " min";
        }
      }
    }

    function remainingTimeCalculation() {
      for (iteration = 1; iteration < rowCount; iteration++) {
        dDistanceRemaining = myTable.rows[rowCount - 1].cells[8].textContent
          - myTable.rows[iteration].cells[8].textContent;
        myTable.rows[iteration].cells[9].textContent = dDistanceRemaining;

        speed = $('.projected-speed-input').val();
        dTimeRemaining = dDistanceRemaining / 1852 / speed;
        hours = Math.round(dTimeRemaining);
        minutes = ((dTimeRemaining - hours) * 60);
        if (minutes < 0) minutes = 60 + minutes;
        myTable.rows[iteration].cells[11].textContent = hours + " h " + minutes.toFixed(0) + " min";
      }
    }

    function distanceRemainingAndTimeRemaining1stRow() {
      dDistanceRemaining1stRow = myTable.rows[rowCount - 1].cells[8].textContent;
      myTable.rows[0].cells[9].textContent = dDistanceRemaining1stRow;
      speed1stRow = $('.projected-speed-input').val();

      dTimeRemaining1stRow = dDistanceRemaining1stRow / 1852 / speed1stRow;
      hours1stRow = Math.round(dTimeRemaining1stRow);
      minutes1stRow = (dTimeRemaining1stRow - hours1stRow) * 60;
      if (minutes1stRow < 0) minutes1stRow = 60 + minutes1stRow;
      myTable.rows[0].cells[11].textContent = hours1stRow + " h " + minutes1stRow.toFixed(0) + " min";
    }


    legDistanceCalculation();
    distanceDoneCalculation();
    legTimeCalculation();
    remainingTimeCalculation();
    distanceRemainingAndTimeRemaining1stRow();
    //drawing();
  }
}



