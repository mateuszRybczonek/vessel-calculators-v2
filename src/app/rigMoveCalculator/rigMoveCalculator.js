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
  $scope.drawing = drawing;

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
    var myTable = $('.tableWPT>tbody')[0];
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
    drawing();
  }

  function drawing() {
    var canvasArray = $('.canvas');
    var context = canvasArray[0].getContext("2d");
    var smallCanvas1Context = canvasArray[1].getContext("2d");
    var smallCanvas2Context = canvasArray[2].getContext("2d");
    var wptNumber, gridSpaceX, gridSpaceY, row, scale;
    var minEasting=0, maxEasting=0, minNorthing=0, maxNorthing=0;
    var eastingFrame=0, northingFrame=0;
    var centerEasting=0, centerNorthing=0;
    var myTable = $('.tableWPT>tbody')[0];
    var wptX, wptY, prevWptX, prevWptY;

    clearCanvas(context, canvasArray[0]);

        //DRAW ON MAIN CANVAS (all route)
    scale = 32;
    getMinMaxEastingsNorthings();
    getCenterPoint(maxEasting, minEasting, maxNorthing, minNorthing);
    roundToNearest500(220, 230);
    drawCoordinates(context);
    document.getElementById("eastingFrameCanvas").value = eastingFrame; //create eastingFrame for "getCoordinates.js"
    document.getElementById("northingFrameCanvas").value = northingFrame; //create northingFrame for "getCoordinates.js"

    for (gridSpaceX = 0; gridSpaceX <= 6; gridSpaceX++) {
      for (gridSpaceY = 0; gridSpaceY <= 6; gridSpaceY++) {
        drawGridLines(context); // drawing 'Grid Lines' on the 'chart'
        drawGridLinesLabels(context); // drawing 'Grid Lines' labels (string)
      }
    }
    for (wptNumber = 0; wptNumber < myTable.rows.length; wptNumber++) {
      drawSHZ(context);
      drawWPTAndLabels(context);
    }

    //DRAW ON SECOND CANVAS (enlargement of start psn)
    clearCanvas(smallCanvas1Context, canvasArray[1]);
    scale = 8;
    centerEasting = myTable.rows[0].cells[3].textContent;
    centerNorthing = myTable.rows[0].cells[5].textContent;

    eastingFrame = Math.floor(centerEasting - 200 * scale);
    northingFrame = Math.floor(centerNorthing - (-150 * scale));

    // drawing coordinates (string) on the gridFrame [0,0]
    drawCoordinates(smallCanvas1Context);

    // drawing 'Grid Lines' on the 'chart' (drawTrackPanel)
    for (gridSpaceX = 0; gridSpaceX <= 6; gridSpaceX++) {
      for (gridSpaceY = 0; gridSpaceY <= 6; gridSpaceY++) {
        drawGridLines(smallCanvas1Context);

        // drawing 'Grid Lines' labels (string)
        drawGridLinesLabels(smallCanvas1Context);
      }
    }
    for (wptNumber = 0; wptNumber < myTable.rows.length; wptNumber++) {
      //draw SHZ
      drawSHZ(smallCanvas1Context);
      // draw WPT and add label with wptNumber to each WPT
      drawWPTAndLabels(smallCanvas1Context);
    }

    //DRAW ON THIRD CANVAS (enlargement of end psn)
    clearCanvas(smallCanvas2Context, canvasArray[2]);
    var tableLength = myTable.rows.length;
    scale = 8;
    centerEasting = myTable.rows[Number(tableLength) - 1].cells[3].textContent;
    centerNorthing = myTable.rows[Number(tableLength) - 1].cells[5].textContent;

    eastingFrame = Math.floor(centerEasting - 200 * scale);
    northingFrame = Math.floor(centerNorthing - (-150 * scale));

    // drawing coordinates (string) on the gridFrame [0,0]
    drawCoordinates(smallCanvas2Context);

    // drawing 'Grid Lines' on the 'chart' (drawTrackPanel)
    for (gridSpaceX = 0; gridSpaceX <= 6; gridSpaceX++) {
      for (gridSpaceY = 0; gridSpaceY <= 6; gridSpaceY++) {
        drawGridLines(smallCanvas2Context);

        // drawing 'Grid Lines' labels (string)
        drawGridLinesLabels(smallCanvas2Context);
      }
    }
    for (wptNumber = 0; wptNumber < myTable.rows.length; wptNumber++) {
      //draw SHZ
      drawSHZ(smallCanvas2Context);
      // draw WPT and add label with wptNumber to each WPT
      drawWPTAndLabels(smallCanvas2Context);
    }

    function drawGridLines(argument) {
      argument.beginPath();
      argument.lineTo(100 * gridSpaceX, 100 * gridSpaceY);
      argument.lineTo(100 * (6 - gridSpaceX), 100 * gridSpaceY);
      argument.lineTo(100 * gridSpaceX, 100 * gridSpaceY);
      argument.lineTo(100 * gridSpaceX, 100 * (6 - gridSpaceY));
      argument.lineWidth = 0.2;
      argument.stroke();
    }

    function getMinMaxEastingsNorthings() {
      minEasting = getMinEasting();
      maxEasting = getMaxEasting();
      minNorthing = getMinNorthing();
      maxNorthing = getMaxNorthing();
    }

    function roundToNearest500(arg1, arg2) //create [0,0] grid point on nearest 500 coordinates  (x-shift, y-shift)
    {
      eastingFrame = Math.floor((centerEasting - arg1 * scale) / 500) * 500;
      northingFrame = Math.ceil((centerNorthing + arg2 * scale) / 500) * 500;
    }

    // to set up a drawing frame correctly (top-left corner as X=minEasting, Y=maxNorthing)
    function getMinEasting() {
      minEasting = 1000000;
      for (row = 0; row < myTable.rows.length; row++) {
        if (myTable.rows[row].cells[3].textContent < minEasting) {
          minEasting = myTable.rows[row].cells[3].textContent;
        }
      }
      return minEasting;
    }

    function getMaxEasting() {
      maxEasting = 0;
      for (row = 0; row < myTable.rows.length; row++) {
        if (myTable.rows[row].cells[3].textContent > maxEasting) {
          maxEasting = myTable.rows[row].cells[3].textContent;
        }
      }
      return maxEasting;
    }

    function getMaxNorthing() {
      maxNorthing = 0;
      for (row = 0; row < myTable.rows.length; row++) {
        if (myTable.rows[row].cells[5].textContent > maxNorthing) {
          maxNorthing = myTable.rows[row].cells[5].textContent;
        }
      }
      return maxNorthing;
    }

    function getMinNorthing() {
      minNorthing = 100000000;
      for (row = 0; row < myTable.rows.length; row++) {
        if (myTable.rows[row].cells[5].textContent < minNorthing) {
          minNorthing = myTable.rows[row].cells[5].textContent;
        }
      }
      return minNorthing;
    }

    function getCenterPoint(xEasting, iEasting, xNorthing, iNorthing) // maxEasting, minEasting, maxNorthing, minNorthing
    {
      centerEasting = (Number(xEasting) + Number(iEasting)) / 2;
      centerNorthing = (Number(xNorthing) + Number(iNorthing)) / 2;

    }

    function drawCoordinates(argument) 	// drawing coordinates (string) on the gridFrame [0,0] (nameOfTheCanvas)
    {
      argument.font = "12px Arial";
      argument.fillText(("E " + (eastingFrame)), 5, 16);
      argument.fillText(("N " + (northingFrame)), 5, 30);
    }

    function clearCanvas(contextA, canvasA) // nameOfTheCanvas
    {
      contextA.clearRect(0, 0, canvasA.width, canvasA.height);
    }

    function drawGridLinesLabels(argument) // drawing 'Grid Lines' labels (string) (nameOfTheCanvas)
    {
      if (gridSpaceX > 0 && gridSpaceY == 0) {
        argument.fillText(("E " + (eastingFrame + scale * 100 * gridSpaceX)), 100 * gridSpaceX - 55, 580);
      }
      if (gridSpaceX == 0 && gridSpaceY > 0) {
        argument.fillText(("N " + (northingFrame - scale * 100 * gridSpaceY)), 530, 100 * gridSpaceY - 3);
      }
    }

    function drawSHZ(argument)//draw 500m SHZ around WH position(nameOfTheCanvas)
    {
      if (myTable.rows[wptNumber].cells[1].textContent == "WH") {
        argument.strokeStyle = "black";
        argument.beginPath();
        argument.arc(((myTable.rows[wptNumber].cells[3].textContent - eastingFrame) / scale),
          ((northingFrame - myTable.rows[wptNumber].cells[5].textContent) / scale), 500 / scale, 0, 2 * Math.PI);
        argument.lineWidth = "1";
        argument.stroke();
      }
      argument.strokeStyle = "red";
      wptX = ((myTable.rows[wptNumber].cells[3].textContent) - eastingFrame) / scale;
      wptY = (northingFrame - (myTable.rows[wptNumber].cells[5].textContent)) / scale;
      if (wptNumber > 0) {
        argument.beginPath();
        argument.moveTo(prevWptX, prevWptY);
        argument.lineTo(wptX, wptY);
        argument.stroke();
        argument.strokeStyle = "black";
      }
    }

    function drawWPTAndLabels(argument) // draw WPT and add label with wptNumber to each WPT (nameOfTheCanvas)
    {
      if ((wptNumber + 1) % 2 == 0) {
        if (myTable.rows[wptNumber].cells[1].textContent == "WH") {
          argument.fillText(wptNumber + 1 + " (WH)", wptX + 3, wptY);
          argument.beginPath();
          argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
        }
        else if (myTable.rows[wptNumber].cells[1].textContent == "SHZ") {
          argument.fillText(wptNumber + 1 + " (SHZ)", wptX + 3, wptY);
          argument.beginPath();
          argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
          argument.stroke();
        }
        else {
          argument.fillText(wptNumber + 1, wptX + 3, wptY);
          argument.beginPath();
          argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
          argument.stroke();
        }

      }
      else {
        if (myTable.rows[wptNumber].cells[1].textContent == "WH") {
          argument.fillText(wptNumber + 1 + " (WH)", wptX - 10, wptY);
          argument.beginPath();
          argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
          argument.stroke();
        }
        else if (myTable.rows[wptNumber].cells[1].textContent == "SHZ") {
          argument.fillText(wptNumber + 1 + " (SHZ)", wptX - 10, wptY);
          argument.beginPath();
          argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
          argument.stroke();
        }
        else {
          argument.fillText(wptNumber + 1, wptX - 10, wptY);
          argument.beginPath();
          argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
          argument.stroke();
        }
      }
      prevWptX = wptX;
      prevWptY = wptY;
    }
  }
}



