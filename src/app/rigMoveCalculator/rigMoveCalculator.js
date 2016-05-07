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

  (function speedSlider() {
    $("#speed-slider").slider({
      range: "max",
      min: 1,
      max: 50,
      value: 0.25,
      step: 0.5,
      slide: function (event, ui) {
        $("#speed").val(ui.value / 10);
        calculate();
      }
    });
  })();

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
    $scope.$watch('WPTS', function () {
      calculate();
    });
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
    $scope.WPTS.map(function (WPT, index) {
      WPT.index = index + 1;
    });
    $scope.$watch('WPTS', function () {
      calculate();
    });
  }

  function moveRow(start, end) {
    var stash = $scope.WPTS[end];
    $scope.WPTS[end] = $scope.WPTS[start];
    $scope.WPTS[start] = stash;
    $scope.WPTS[start].index = start + 1;
    $scope.WPTS[end].index = end + 1;
    calculate();
  }

  function moveUp(index) {
    moveRow(index, index - 1);
  }

  function moveDown(index) {
    moveRow(index, index + 1);
  }

  function calculate() {
    var iteration;
    var myTable = $('.tableWPT>tbody')[0];
    var rowCount = $scope.WPTS.length;
    var timeRemaining, hours, minutes, totalDistance;
    var speed = $('.projected-speed-input').val();

    legDistanceCalculation();
    distanceDoneCalculation();
    legTimeCalculation();
    remainingTimeCalculation();
    timeRemainingFunc(myTable.rows[rowCount - 1].cells[8].textContent, myTable.rows[0].cells[11]);
    drawing();

    function legDistanceCalculation() {
      var eastingDifference, northingDifference, distanceLeg, currentLeg;
      for (iteration = 1; iteration < $scope.WPTS.length; iteration++) {
        currentLeg = myTable.rows[iteration].cells[7];
        eastingDifference = ($scope.WPTS[iteration].easting - $scope.WPTS[iteration - 1].easting);
        northingDifference = ($scope.WPTS[iteration].northing - $scope.WPTS[iteration - 1].northing);
        distanceLeg = Math.sqrt(eastingDifference * eastingDifference + northingDifference * northingDifference);

        ($scope.WPTS[iteration - 1].easting == null || $scope.WPTS[iteration - 1].northing == null ) ?
          currentLeg.textContent = '' :
          currentLeg.textContent = distanceLeg.toFixed(0);
      }
    }

    function distanceDoneCalculation() {
      var distanceDone, currentLeg, previousLeg, previousDistanceDone, currentDistanceDone;
      for (iteration = 1; iteration < rowCount; iteration++) {
        currentLeg = myTable.rows[iteration].cells[7];
        previousLeg = myTable.rows[iteration - 1].cells[7];
        previousDistanceDone = myTable.rows[iteration - 1].cells[8];
        currentDistanceDone = myTable.rows[iteration].cells[8];
        if (previousLeg.textContent == null ||
          previousLeg.textContent == "") {
          distanceDone = parseFloat(0 + currentLeg.textContent);
        }
        else {
          distanceDone = parseFloat(previousDistanceDone.textContent) + parseFloat(currentLeg.textContent);
        }
        currentDistanceDone.textContent = distanceDone;
      }
    }

    function legTimeCalculation() {
      for (iteration = 1; iteration < rowCount; iteration++) {
        {
          timeRemainingFunc(myTable.rows[iteration].cells[7].textContent,// current leg
            myTable.rows[iteration - 1].cells[10]);// currentLegTime
        }
      }
    }

    function remainingTimeCalculation() {
      totalDistance = myTable.rows[rowCount - 1].cells[8].textContent;
      myTable.rows[0].cells[9].textContent = totalDistance;
      var currentDistanceDone, distanceRemaining, remainingTime;
      for (iteration = 1; iteration < rowCount; iteration++) {
        remainingTime = myTable.rows[iteration].cells[11];
        currentDistanceDone = myTable.rows[iteration].cells[8];
        distanceRemaining = totalDistance - currentDistanceDone.textContent;
        myTable.rows[iteration].cells[9].textContent = distanceRemaining;

        timeRemainingFunc(distanceRemaining, remainingTime);
      }
    }

    function timeRemainingFunc(distance, target) {
      timeRemaining = distance / 1852 / speed;
      hours = Math.floor(timeRemaining);
      minutes = (timeRemaining - hours) * 60;
      target.textContent = hours + " h " + minutes.toFixed(0) + " min";
    }
  }

  function drawing() {
    var canvasArray = $('.canvas');
    var context = canvasArray[0].getContext("2d");
    var smallCanvas1Context = canvasArray[1].getContext("2d");
    var smallCanvas2Context = canvasArray[2].getContext("2d");
    var wptNumber, gridSpaceX, gridSpaceY, row, scale;
    var minEasting = 0, maxEasting = 0, minNorthing = 0, maxNorthing = 0;
    var eastingFrame = 0, northingFrame = 0;
    var centerEasting = 0, centerNorthing = 0;
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
    for (wptNumber = 0; wptNumber < $scope.WPTS.length; wptNumber++) {
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
    for (wptNumber = 0; wptNumber < $scope.WPTS.length; wptNumber++) {
      //draw SHZ
      drawSHZ(smallCanvas1Context);
      // draw WPT and add label with wptNumber to each WPT
      drawWPTAndLabels(smallCanvas1Context);
    }

    //DRAW ON THIRD CANVAS (enlargement of end psn)
    clearCanvas(smallCanvas2Context, canvasArray[2]);
    var tableLength = $scope.WPTS.length;
    scale = 8;
    centerEasting = $scope.WPTS[Number(tableLength) - 1].easting;
    centerNorthing = $scope.WPTS[Number(tableLength) - 1].northing;

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
    for (wptNumber = 0; wptNumber < $scope.WPTS.length; wptNumber++) {
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
      for (row = 0; row < $scope.WPTS.length; row++) {
        if ($scope.WPTS[row].easting < minEasting) {
          minEasting = $scope.WPTS[row].easting;
        }
      }
      return minEasting;
    }

    function getMaxEasting() {
      maxEasting = 0;
      for (row = 0; row < $scope.WPTS.length; row++) {
        if ($scope.WPTS[row].easting > maxEasting) {
          maxEasting = $scope.WPTS[row].easting;
        }
      }
      return maxEasting;
    }

    function getMaxNorthing() {
      maxNorthing = 0;
      for (row = 0; row < $scope.WPTS.length; row++) {
        if ($scope.WPTS[row].northing > maxNorthing) {
          maxNorthing = $scope.WPTS[row].northing;
        }
      }
      return maxNorthing;
    }

    function getMinNorthing() {
      minNorthing = 100000000;
      for (row = 0; row < $scope.WPTS.length; row++) {
        if ($scope.WPTS[row].northing < minNorthing) {
          minNorthing = $scope.WPTS[row].northing;
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
      if ($scope.WPTS[wptNumber].name == "WH") {
        argument.strokeStyle = "black";
        argument.beginPath();
        argument.arc((($scope.WPTS[wptNumber].easting - eastingFrame) / scale),
          ((northingFrame - $scope.WPTS[wptNumber].northing) / scale), 500 / scale, 0, 2 * Math.PI);
        argument.lineWidth = "1";
        argument.stroke();
      }
      argument.strokeStyle = "red";
      wptX = (($scope.WPTS[wptNumber].easting) - eastingFrame) / scale;
      wptY = (northingFrame - ($scope.WPTS[wptNumber].northing)) / scale;
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
        if ($scope.WPTS[wptNumber].name == "WH") {
          argument.fillText(wptNumber + 1 + " (WH)", wptX + 3, wptY);
          argument.beginPath();
          argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
        }
        else if ($scope.WPTS[wptNumber].name == "SHZ") {
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
        if ($scope.WPTS[wptNumber].name == "WH") {
          argument.fillText(wptNumber + 1 + " (WH)", wptX - 10, wptY);
          argument.beginPath();
          argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
          argument.stroke();
        }
        else if ($scope.WPTS[wptNumber].name == "SHZ") {
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



