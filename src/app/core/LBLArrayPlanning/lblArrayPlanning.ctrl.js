function lblArrayPlanningController($scope) {
  $scope.arrayTableHeaders = ['#',
    'Serial no.',
    'Northing [m]',
    'Easting [m]',
    'Range from WH [m]',
    'Bearing from WH [deg]',
    'Float no.',
    ''];
  $scope.arrays = [];
  $scope.array1 = [];
  $scope.array2 = [];
  $scope.selectedIndex = -1;
  $scope.showForms = false;
  $scope.lblArraysData = {};
  $scope.selectedRow = -1;
  $scope.scale = 1000;
  $scope.startAngle = 0;

  var distanceWHTP, row;
  var svgHorizontalView = $('.array-horizontal-view')[0];
  var svgVerticalView = $('.array-vertical-view')[0];

  $scope.addNewBeacon = addNewBeacon;
  $scope.clearTable = clearTable;
  $scope.saveChanges = saveChanges;
  $scope.removeRow = removeRow;
  $scope.moveRow = moveRow;
  $scope.moveDown = moveDown;
  $scope.moveUp = moveUp;
  $scope.exportToJSON = exportToJSON;
  $scope.importFromJSON = importFromJSON;
  $scope.showSelectedBeacon = showSelectedBeacon;

  (function scaleSlider() {
    $("#scale-slider").slider({
      range: "max",
      min: 0,
      max: 800,
      value: 1000 - $scope.scale,
      step: 1,
      slide: function (event, ui) {
        $scope.scale = 1000 - ui.value;
        $scope.$apply();
        clearSVG(svgHorizontalView);
        clearSVG(svgVerticalView);
        draw();
      }
    });
  })();

  (function startAngleSlider() {
    $("#start-angle-slider").slider({
      range: "max",
      min: 0,
      max: 90,
      value: $scope.startAngle,
      step: 1,
      slide: function (event, ui) {
        $scope.startAngle = ui.value;
        $scope.$apply();
        calculate();
        clearSVG(svgHorizontalView);
        clearSVG(svgVerticalView);
        draw();
      }
    });
  })();

  function Beacon(serialNo, floatNo) {
    this.serialNo = serialNo;
    this.floatNo = floatNo;
  }

  function addNewBeacon(arrayNo) {
    var newBeacon = new Beacon("", "");
    $scope.arrayNo = arrayNo;
    $scope.arrayNo.push(newBeacon);
  }

  function exportToJSON() {
    $scope.lblArraysData.fieldName = $('.field-name input')[0].value;
    $scope.lblArraysData.wellName = $('.well-name input')[0].value;
    $scope.lblArraysData.whNorthing = $('.wh-northing input')[0].value;
    $scope.lblArraysData.whEasting = $('.wh-easting input')[0].value;
    $scope.lblArraysData.date = $('.date input')[0].value;
    $scope.lblArraysData.utm = $('.utm-Zone input')[0].value;
    $scope.lblArraysData.waterDepth = $('.water-depth input')[0].value;
    $scope.lblArraysData.transponderHeight = $('.transponder-height input')[0].value;
    $scope.lblArraysData.transducerDepth = $('.transducer-depth input')[0].value;
    $scope.lblArraysData.startAngle = $('.start-angle input')[0].value;
    $scope.lblArraysData.verticalAngle = $('.vertical-angle input')[0].value;
    $scope.lblArraysData.array1 = $scope.array1;
    $scope.lblArraysData.array2 = $scope.array2;
    $scope.lblArraysData.angleThreshold = $('.angle-threshold input')[0].value;

    var exportData = JSON.stringify($scope.lblArraysData);
    //create default file name
    var fileName = $scope.lblArraysData.wellName + "-LBL-Config";
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
      $scope.beaconsJSON = JSON.parse(lines);
      $('.field-name-input')[0].value = $scope.beaconsJSON.fieldName;
      $('.well-name-input')[0].value = $scope.beaconsJSON.wellName;
      $('.date-input')[0].value = $scope.beaconsJSON.date;
      $('.utm-input')[0].value = $scope.beaconsJSON.utm;
      $('.wh-northing-input')[0].value = $scope.beaconsJSON.whNorthing;
      $('.wh-easting-input')[0].value = $scope.beaconsJSON.whEasting;
      $('.water-depth-input')[0].value = $scope.beaconsJSON.waterDepth;
      $('.transponder-height-input')[0].value = $scope.beaconsJSON.transponderHeight;
      $('.transducer-depth-input')[0].value = $scope.beaconsJSON.transducerDepth;
      $scope.startAngle = $scope.beaconsJSON.startAngle;
      $('.vertical-angle-input')[0].value = $scope.beaconsJSON.verticalAngle;
      $('.angle-threshold-input')[0].value = $scope.beaconsJSON.angleThreshold;
      $scope.array1 = $scope.beaconsJSON.array1;
      $scope.array2 = $scope.beaconsJSON.array2;
      $scope.arrays.push($scope.array1);
      $scope.arrays.push($scope.array2);
      $scope.$apply();
      disableInputs();
      calculate();
    }
  }

  function clearTable(arrayNo) {
    $scope.arrayNo = arrayNo;
    $scope.arrayNo = [];
  }

  function saveChanges(index, serialNo, floatNo, arrayNo) {
    $scope.arrayNo = arrayNo;
    $scope.arrayNo[index] = {'index': index + 1, 'serialNo': serialNo, 'floatNo': floatNo};
    calculate();
  }

  function removeRow(selectedIndex, arrayNo) {
    $scope.arrayNo = arrayNo;
    $scope.arrayNo.splice(selectedIndex, 1);
    $scope.arrayNo.map(function (WPT, index) {
      WPT.index = index + 1;
    });
    $scope.$watch('array1', function () {
      calculate();
    });
  }

  function moveRow(start, end, arrayNo) {
    $scope.arrayNo = arrayNo;
    var stash = $scope.arrayNo[end];
    $scope.arrayNo[end] = $scope.arrayNo[start];
    $scope.arrayNo[start] = stash;
    $scope.arrayNo[start].index = start + 1;
    $scope.arrayNo[end].index = end + 1;
    calculate();
  }

  function moveUp(index, arrayNo) {
    moveRow(index, index - 1, arrayNo);
  }

  function moveDown(index, arrayNo) {
    moveRow(index, index + 1, arrayNo);
  }

  function showSelectedBeacon(beacon) {
    $scope.selectedRow = beacon;
  }

  function disableInputs() {
    $("#relative-depth")[0].disabled = true;
    $("#dist-WH-TR")[0].disabled = true;
    $('#beacon-radius')[0].disabled = true;
  }

  function calculate() {
    var verticalAngle = $('.vertical-angle-input')[0].value;

    var relativeDepth = $(".water-depth-input")[0].value
      - $(".transponder-height-input")[0].value
      - $('.transducer-depth-input')[0].value;
    $("#relative-depth")[0].value = relativeDepth;

    distanceWHTP = Math.round(relativeDepth * Math.sin(verticalAngle / (180 / Math.PI)));
    $('.dist-WH-TR-input')[0].value = distanceWHTP;

    var angleThreshold = $('.angle-threshold-input')[0].value;

    $('.beacon-radius-input')[0].value = (Math.round(relativeDepth * Math.sin((Number(verticalAngle) + Number(angleThreshold)) / (180 / Math.PI)))
      - Math.round(relativeDepth * Math.sin((Number(verticalAngle) - Number(angleThreshold)) / (180 / Math.PI)))) / 2;

    for (row = 0; row < $scope.array1.length; row++) {
      calculateNorthingsAndEastings($('.tableArray1')[0], 0);
    }
    for (row = 0; row < $scope.array2.length; row++) {
      calculateNorthingsAndEastings($('.tableArray2')[0], 180 / $scope.array2.length);
    }
    drawingSVG();
  }

  function calculateNorthingsAndEastings(table, angleShift) {
    var WHNorthing = $('.wh-northing-input')[0].value;
    var WHEasting = $('.wh-easting-input')[0].value;
    table.rows[row + 2].cells[5].textContent = distanceWHTP;
    var bearing = Math.round(angleShift + Number($scope.startAngle) + 360 / (table.rows.length - 2) * row);
    table.rows[row + 2].cells[6].textContent = bearing;
    //calculate beacon's northing
    var deltaNorthing = Math.round(Math.sqrt(distanceWHTP * Math.cos((bearing)/ (180 / Math.PI))
      * (distanceWHTP * Math.cos(bearing / (180 / Math.PI)))));
    if (bearing < 90) {
      var beaconNorthing = Math.round(Number(WHNorthing) + Number(deltaNorthing));
    }
    else {
      if (bearing < 270) {
        beaconNorthing = Math.round(Number(WHNorthing) - Number(deltaNorthing));
      }
      else {
        beaconNorthing = Math.round(Number(WHNorthing) + Number(deltaNorthing));
      }
    }
    table.rows[row + 2].cells[3].textContent = beaconNorthing;
    //calculate beacon's easting
    var deltaEasting = -Math.round(distanceWHTP * Math.sin(bearing / (180 / Math.PI)));
    table.rows[row + 2].cells[4].textContent = Math.round(Number(WHEasting) + Number(deltaEasting));
    drawingSVG();
  }

  function clearSVG(svg) {
    while (svg.lastChild) {
      svg.removeChild(svg.lastChild);
    }
  }

  function draw() {
    drawBeacons($('.tableArray1')[0], "red");
    drawBeacons($('.tableArray2')[0], "blue");
  }

  function drawBeacons(table, color) {
    var WHEasting = $('.wh-easting-input')[0].value;
    var WHNorthing = $('.wh-northing-input')[0].value;
    var numberOfBeacons = table.rows.length;
    for (var beaconNumber = 2; beaconNumber < numberOfBeacons; beaconNumber++) {
      var relativeEasting = Number(WHEasting) - table.rows[beaconNumber].cells[4].textContent;
      var relativeNorthing = Number(WHNorthing) - table.rows[beaconNumber].cells[3].textContent;
      drawCircle((relativeEasting / $scope.scale * 400) + 200,
        (relativeNorthing / $scope.scale * 400) + 200, 3, svgHorizontalView, color);
    }
  }

  function drawBeaco(canvasContext, array) {

    //draw beacons
    canvasContext.beginPath();
    canvasContext.arc((relativeEasting / scale) + 200, (relativeNorthing / scale) + 200, 3, 0, 2 * Math.PI);
    canvasContext.closePath();
    canvasContext.setLineDash([]);
    canvasContext.strokeStyle = '#000';
    if (array == array1) {
      color = 'red';
    }
    else {
      color = 'blue';
    }
    canvasContext.fillStyle = color;
    canvasContext.stroke();
    canvasContext.fill();

    //draw signal paths
    canvasContext.beginPath();
    canvasContext.moveTo(200, 200);
    canvasContext.lineTo((relativeEasting / scale) + 200, (relativeNorthing / scale) + 200, 4, 0, 2 * Math.PI);
    canvasContext.strokeStyle = color;
    canvasContext.setLineDash([3, 2]);
    canvasContext.stroke();

    //draw beacon's labels
    if (row < rowCount) {
      canvasContext.font = "10px Arial";
      canvasContext.fillText((array.rows[row].cells[1].textContent), (relativeEasting / scale) + 205, (relativeNorthing / scale) + 195);
    }

    //draw beacons radius
    canvasContext.beginPath();
    canvasContext.arc((relativeEasting / scale) + 200, (relativeNorthing / scale) + 200, beaconsRadius / scale, 0, 2 * Math.PI);
    canvasContext.closePath();
    canvasContext.setLineDash([]);
    canvasContext.strokeStyle = "rgba(0, 0, 0, 0.5)";
    if (array == array1) {
      color = 'red';
    }
    else {
      color = 'blue';
    }
    canvasContext.fillStyle = "rgba(0, 0, 0, 0.1)";

    canvasContext.stroke();
    canvasContext.fill();

    //draw vessel's shape
    canvasContext.beginPath();
    canvasContext.arc(200, 200, 4, 0, 2 * Math.PI);
    canvasContext.moveTo(190, 180);
    canvasContext.quadraticCurveTo(200, 160, 210, 180);
    canvasContext.lineTo(210, 230);
    canvasContext.lineTo(190, 230);
    canvasContext.lineTo(190, 180);
    canvasContext.closePath();
    canvasContext.setLineDash([]);
    canvasContext.strokeStyle = "black";
    canvasContext.stroke();

    //draw 500m and 1000m circles
    canvasContext.beginPath();
    canvasContext.moveTo(200 + 500 / scale, 200);
    canvasContext.setLineDash([1, 3]);
    canvasContext.arc(200, 200, 500 / scale, 0, 2 * Math.PI);
    canvasContext.moveTo(200 + 1000 / scale, 200);
    canvasContext.arc(200, 200, 1000 / scale, 0, 2 * Math.PI);
    canvasContext.closePath();
    canvasContext.stroke();
    canvasContext.font = "10px Arial";
    canvasContext.fillStyle = '#000';
    canvasContext.fillText("500 m", 185, 200 - 530 / scale);
    canvasContext.fillText("1000 m", 185, 200 - 1030 / scale);

    //draw distWHTransponder circle
    canvasContext.beginPath();
    canvasContext.moveTo(200 + distWHTransponder / scale, 200);
    canvasContext.setLineDash([1, 3]);
    canvasContext.arc(200, 200, distWHTransponder / scale, 0, 2 * Math.PI);
    canvasContext.closePath();
    canvasContext.stroke();
    canvasContext.fillStyle = '#000';
    canvasContext.fillText(distWHTransponder + " m", 240, 200 - distWHTransponder / scale);


    canvasContext.fillText("- Beacon's radius (" + document.getElementById("angleThreshold").value + " deg threshold) = " + beaconsRadius + " m", 50, 385);

    canvasContext.beginPath();
    canvasContext.arc(20, 380, beaconsRadius / scale, 0, 2 * Math.PI);
    canvasContext.closePath();
    canvasContext.setLineDash([]);
    canvasContext.strokeStyle = "rgba(0, 0, 0, 0.5)";
    canvasContext.stroke();
    canvasContext.fillStyle = "rgba(0, 0, 0, 0.1)";
    canvasContext.fill();

    canvasContext.fillStyle = '#000';
    canvasContext.strokeStyle = "#000";
  }

  function drawingSVG() {
    clearSVG(svgHorizontalView);
    clearSVG(svgVerticalView);
    draw();
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

  function drawLabel(positionX, positionY, value) {
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

  function drawCircle(positionX, positionY, radius, svg, color) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
    circle.setAttributeNS(null, "cx", positionX);
    circle.setAttributeNS(null, "cy", positionY);
    circle.setAttributeNS(null, "r", radius);
    circle.setAttributeNS(null, "stroke", color);
    circle.setAttributeNS(null, "fill", "none");
    circle.setAttributeNS(null, "stroke-width", "1");
    svg.appendChild(circle);
  }
}
