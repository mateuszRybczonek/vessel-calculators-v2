function rigMoveCalculator() {
  return {
    restrict: "E",
    templateUrl: "rigMoveCalculator/rigMoveCalculator.html",
    replace: true,
    transclude: false,
    controller: rigMoveController,
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
        $("#speed").val((ui.value / 10).toFixed(2));
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
      $("#speed-slider").slider({value: $scope.WPTJSON.projectedSpeed * 10});
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

    if (rowCount !== 0) {

      legDistanceCalculation();
      distanceDoneCalculation();
      legTimeCalculation();
      remainingTimeCalculation();
      timeRemainingFunc(myTable.rows[rowCount - 1].cells[8].textContent, myTable.rows[0].cells[11]);
      drawing();
      drawingSVG();

    }

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

  function drawingSVG() {
    var svg = $('svg')[0];

    while (svg.lastChild) {
      svg.removeChild(svg.lastChild);
    }
    var wptNumber, gridSpaceX, row, scale;
    var minEasting = 0, maxEasting = 0, minNorthing = 0, maxNorthing = 0;
    var eastingFrame = 0, northingFrame = 0;
    var centerEasting = 0, centerNorthing = 0;
    var wptX, wptY, prevWptX, prevWptY;

    scale = 32;
    getMinMaxEastingsNorthings();
    getCenterPoint(maxEasting, minEasting, maxNorthing, minNorthing);
    roundToNearest500(220, 230);

    for (gridSpaceX = 0; gridSpaceX <= svg.clientWidth / 100 + 1; gridSpaceX++) {
      // horizontal grid lines
      drawLine(0, 100 * gridSpaceX, 100 * (Math.round(svg.clientWidth / 100 + 1)), 100 * gridSpaceX, "black", 0.3, 1);
      // vertical grid lines
      drawLine(100 * gridSpaceX, 0, 100 * gridSpaceX, 100 * (Math.round(svg.clientWidth / 100 + 1)), "black", 0.3, 1);
      drawLabel(100 * gridSpaceX - 55, 585, "E " + (eastingFrame + scale * 100 * gridSpaceX)); //easting labels
      drawLabel(10, 100 * gridSpaceX - 3, "N " + (northingFrame - scale * 100 * gridSpaceX)); //northing labels
    }

    for (wptNumber = 0; wptNumber < $scope.WPTS.length; wptNumber++) {
      drawSHZandTrack();
      drawWPTAndLabels();
    }

    function getMinMaxEastingsNorthings() {
      minEasting = getMinEasting();
      maxEasting = getMaxEasting();
      minNorthing = getMinNorthing();
      maxNorthing = getMaxNorthing();
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

    function roundToNearest500(arg1, arg2) //create [0,0] grid point on nearest 500 coordinates  (x-shift, y-shift)
    {
      eastingFrame = Math.floor((centerEasting - arg1 * scale) / 500) * 500;
      northingFrame = Math.ceil((centerNorthing + arg2 * scale) / 500) * 500;
    }

    function drawLine(startX, startY, endX, endY, color, strokeWidth, opacity) {
      var gridLine = document.createElementNS('http://www.w3.org/2000/svg', "path");
      gridLine.setAttributeNS(null, "d", ("M" + startX + ", " + startY +
      " L" + endX + ", " + endY));
      gridLine.setAttributeNS(null, "stroke", color);
      gridLine.setAttributeNS(null, "stroke-width", strokeWidth);
      gridLine.setAttributeNS(null, "opacity", opacity);
      svg.appendChild(gridLine);
    }

    function drawLabel(positionX, positionY, value) // drawing 'Grid Lines' labels
    {
      var gridLineLabel = document.createElementNS('http://www.w3.org/2000/svg', "text");
      gridLineLabel.setAttributeNS(null, "x", positionX);
      gridLineLabel.setAttributeNS(null, "y", positionY);
      gridLineLabel.setAttributeNS(null, "font", "Arial");
      gridLineLabel.setAttributeNS(null, "stroke", "black");
      gridLineLabel.setAttributeNS(null, "font-size", "12px");
      gridLineLabel.setAttributeNS(null, "font-weight", "normal");
      gridLineLabel.setAttributeNS(null, "opacity", "0.7");
      var textNode = document.createTextNode(value);
      gridLineLabel.appendChild(textNode);
      svg.appendChild(gridLineLabel);
    }

    function drawCirlce(positionX, positionY, radius) {
      var circle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
      circle.setAttributeNS(null, "cx", positionX);
      circle.setAttributeNS(null, "cy", positionY);
      circle.setAttributeNS(null, "r", radius);
      circle.setAttributeNS(null, "stroke", "black");
      circle.setAttributeNS(null, "fill", "none");
      circle.setAttributeNS(null, "stroke-width", "1");
      svg.appendChild(circle);
    }

    function drawSHZandTrack() {
      wptX = (($scope.WPTS[wptNumber].easting) - eastingFrame) / scale;
      wptY = (northingFrame - ($scope.WPTS[wptNumber].northing)) / scale;
      if ($scope.WPTS[wptNumber].name == "WH") {
        drawCirlce(wptX, wptY, 500 / scale);
        prevWptX = wptX;
        prevWptY = wptY;
      }
      if (wptNumber > 0) {
        drawLine(prevWptX, prevWptY, wptX, wptY, "red", 0.8, 1);
        prevWptX = wptX;
        prevWptY = wptY;
      }
    }

    function drawWPTAndLabels() // draw WPT and add label with wptNumber to each WPT
    {
      var labelPositionX;
      var wptName = $scope.WPTS[wptNumber].name;
      ((wptNumber + 1) % 2 == 0) ? labelPositionX = wptX - 13 : labelPositionX = wptX + 3;
      if (wptName == "WH" || $scope.WPTS[wptNumber].name == "SHZ") {
        drawLabel(labelPositionX, wptY - 2, wptNumber + 1 + "(" + wptName + ")");
        drawCirlce(wptX, wptY, 2)
      }
      else {
        drawLabel(labelPositionX, wptY - 2, wptNumber + 1);
        drawCirlce(wptX, wptY, 2)
      }
      prevWptX = wptX;
      prevWptY = wptY;
    }
  }
}



