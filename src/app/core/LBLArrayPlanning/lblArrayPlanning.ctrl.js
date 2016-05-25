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
  $scope.verticalAngle = 10;
  $scope.angleThreshold = 1;

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
      max: 2800,
      value: 3000 - $scope.scale,
      step: 1,
      slide: function (event, ui) {
        $scope.scale = 3000 - ui.value;
        $scope.$apply();
        drawingSVG();
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
        drawingSVG();
      }
    });
  })();

  (function verticalAngleSlider() {
    $("#vertical-angle-slider").slider({
      range: "max",
      min: 1,
      max: 30,
      value: $scope.verticalAngle,
      step: 1,
      slide: function (event, ui) {
        $scope.verticalAngle = ui.value;
        $scope.$apply();
        calculate();
        drawingSVG();
      }
    });
  })();

  (function angleThresholdSlider() {
    $("#angle-threshold-slider").slider({
      range: "max",
      min: 1,
      max: 5,
      value: $scope.angleThreshold,
      step: 1,
      slide: function (event, ui) {
        $scope.angleThreshold = ui.value;
        $scope.$apply();
        calculate();
        drawingSVG();
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
    $scope.lblArraysData.startAngle = $scope.startAngle;
    $scope.lblArraysData.verticalAngle = $scope.verticalAngle;
    $scope.lblArraysData.array1 = $scope.array1;
    $scope.lblArraysData.array2 = $scope.array2;
    $scope.lblArraysData.angleThreshold = $scope.angleThreshold;

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
      $scope.verticalAngle = $scope.beaconsJSON.verticalAngle;
      $scope.angleThreshold = $scope.beaconsJSON.angleThreshold;
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
    calculate();
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

  function showSelectedBeacon(serialNo) {
    $scope.selectedRow = serialNo;
  }

  function disableInputs() {
    $("#relative-depth")[0].disabled = true;
    $("#dist-WH-TR")[0].disabled = true;
    $('#beacon-radius')[0].disabled = true;
  }

  function calculate() {
    var relativeDepth = $(".water-depth-input")[0].value
      - $(".transponder-height-input")[0].value
      - $('.transducer-depth-input')[0].value;
    $("#relative-depth")[0].value = relativeDepth;

    distanceWHTP = Math.round(relativeDepth * Math.sin($scope.verticalAngle / (180 / Math.PI)));
    $('.dist-WH-TR-input')[0].value = distanceWHTP;

    $('.beacon-radius-input')[0].value = (Math.round(relativeDepth * Math.sin((Number($scope.verticalAngle)
          + Number($scope.angleThreshold)) / (180 / Math.PI)))
      - Math.round(relativeDepth * Math.sin((Number($scope.verticalAngle) - Number($scope.angleThreshold)) / (180 / Math.PI)))) / 2;

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
    var deltaNorthing = Math.round(Math.sqrt(distanceWHTP * Math.cos((bearing) / (180 / Math.PI))
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

  function drawingSVG() {
    drawHorizontalPlane();
    drawVerticalPlane();
  }

  function drawHorizontalPlane() {
    clearSVG(svgHorizontalView);
    distanceWHTP = $('.dist-WH-TR-input')[0].value;
    drawBeaconsHorizontal($('.tableArray1')[0], "red");
    drawBeaconsHorizontal($('.tableArray2')[0], "blue");
    drawRadiusHorizontal();
    drawVesselShapeHorizontal(svgHorizontalView);
    drawLabelsHorizontal();
  }

  function drawVerticalPlane() {
    clearSVG(svgVerticalView);
    drawVerticalWaterAndBottom(svgVerticalView);
    drawVesselShapeVertical(svgVerticalView);
    drawFrameVertical(svgVerticalView);
    drawLabelsVertical(svgVerticalView);
  }

  function drawVesselShapeVertical(svg) {
    var vesselShape = document.createElementNS('http://www.w3.org/2000/svg', "path");
    vesselShape.setAttributeNS(null, "d", (
    "M170 95 " +
    "L180 105" +
    "L225, 105" +
    "Q230,105 230,95" +
    "L170 95 Z"));
    vesselShape.setAttributeNS(null, "stroke", "black");
    vesselShape.setAttributeNS(null, "stroke-width", 1);
    vesselShape.setAttributeNS(null, "opacity", 0.4);
    svg.appendChild(vesselShape);
  }

  function drawFrameVertical(svg) {
    drawLine(svg, 200, 105, 200, 360, "#000", 2, 1);
    drawRectangle(svg, 197, 360, 6, 9, "black", 0.8, "yellow", 1);
    drawRectangle(svg, 198, 105, 4, 6, "black", 0.8, "yellow", 1);
    var tanAngle = Math.tan($scope.verticalAngle / (180 / Math.PI));
    drawLine(svg, 30, 111, 30, 365, "#000", 1, 0.8);
    drawLine(svg, 25, 111, 200, 111, "#000", 1, 0.8, 3, 10);
    drawLine(svg, 200 - tanAngle * 254, 365, 25, 365, "#000", 1, 0.8, 3, 10);
    drawLine(svg, 200 - tanAngle * 254, 365, 200, 111, "#000", 1, 0.8);
    drawLine(svg, 200 + tanAngle * 254, 365, 200, 111, "#000", 1, 0.8);
    drawRectangle(svgVerticalView, 199 + tanAngle * 254, 365, 2, 5, "red", 1, "red", 1);
    drawRectangle(svgVerticalView, 199 - tanAngle * 254, 365, 2, 5, "red", 1, "red", 1);
    drawLine(svgVerticalView, 200, 388, 200 - tanAngle * 254, 388, "#000", 1, 0.8);
    drawLine(svgVerticalView, 200, 385, 200, 391, "#000", 1, 0.8);
    drawLine(svgVerticalView, 200 - tanAngle * 254, 385, 200 - tanAngle * 254, 391, "#000", 1, 0.8);
    var anglePath = document.createElementNS('http://www.w3.org/2000/svg', "path");
    anglePath.setAttributeNS(null, "d", (
    "M200 232 " +
    "Q" + (200 + tanAngle * 254 / 4) + ",238 " + (198 + tanAngle * 254 / 2) + ",230"));
    anglePath.setAttributeNS(null, "stroke", "black");
    anglePath.setAttributeNS(null, "stroke-width", 1);
    anglePath.setAttributeNS(null, "opacity", 0.4);
    anglePath.setAttributeNS(null, "fill", "transparent");
    svg.appendChild(anglePath);
  }

  function drawLabelsVertical(svg){

  }

  //canvasContext.fillText(angle+'°',200+tanAngle*254/4,250);
  //
  //canvasContext.fillText( "Relative water depth = "+document.getElementById("relativeDepth").value+" m", 235, -380 );
  //
  //canvasContext.fillText("WH",190,382);
  //canvasContext.fillStyle='blue';
  //canvasContext.fillText("Water plane",10,110);
  //canvasContext.fillStyle='#A26530';
  //canvasContext.fillText("Bottom",10,382);

  function drawVerticalWaterAndBottom(svg) {
    drawLine(svg, -20, 100, 1000, 100, 'blue', 2, 1);
    var water = document.createElementNS('http://www.w3.org/2000/svg', "path");
    water.setAttributeNS(null, "d", (
    "M-20 100 " +
    "L1000 100 " +
    "L1000 370 " +
    "L-20 370 Z"));
    water.setAttributeNS(null, "opacity", 0.1);
    water.setAttributeNS(null, "fill", "#92DEF7");
    svg.appendChild(water);
    drawLine(svg, -20, 370, 1000, 370, 'brown', 2, 1);
    var bottom = document.createElementNS('http://www.w3.org/2000/svg', "path");
    bottom.setAttributeNS(null, "d", (
    "M-20 370 " +
    "L1000 370 " +
    "L1000 405 " +
    "L-20 405 Z"));
    bottom.setAttributeNS(null, "opacity", 1);
    bottom.setAttributeNS(null, "fill", "#E6CAAA");
    svg.appendChild(bottom);
  }

  function clearSVG(svg) {
    while (svg.lastChild) {
      svg.removeChild(svg.lastChild);
    }
  }

  function drawBeaconsHorizontal(table, color) {
    var WHEasting = $('.wh-easting-input')[0].value;
    var WHNorthing = $('.wh-northing-input')[0].value;
    var numberOfBeacons = table.rows.length;
    for (var beaconNumber = 2; beaconNumber < numberOfBeacons; beaconNumber++) {
      var relativeEasting = Number(WHEasting) - table.rows[beaconNumber].cells[4].textContent;
      var relativeNorthing = Number(WHNorthing) - table.rows[beaconNumber].cells[3].textContent;
      drawCircle(svgHorizontalView, (relativeEasting / $scope.scale * 400) + 200,
        (relativeNorthing / $scope.scale * 400) + 200, 3, color);
      drawLine(svgHorizontalView, 200, 200,
        (relativeEasting / $scope.scale * 400) + 200, (relativeNorthing / $scope.scale * 400) + 200, color, 1, 1);
      drawLabel(svgHorizontalView, relativeEasting / $scope.scale * 400 + 205, relativeNorthing / $scope.scale * 400 + 195,
        table.rows[beaconNumber].cells[1].textContent, color);
      drawCircle(svgHorizontalView, (relativeEasting / $scope.scale * 400) + 200,
        (relativeNorthing / $scope.scale * 400) + 200, $('.beacon-radius-input')[0].value / $scope.scale * 400, color, "3,3", 0.5);
    }
  }

  function drawLabelsHorizontal() {
    drawLabel(svgHorizontalView, 190, 190 - 500 / $scope.scale * 400, "500 m");
    drawLabel(svgHorizontalView, 190, 190 - 1000 / $scope.scale * 400, "1000 m");
    drawLabel(svgHorizontalView, 190, 220 + distanceWHTP / $scope.scale * 400, distanceWHTP + " m");
    drawLabel(svgHorizontalView, 50, 375, "Beacon's radius @ " + $scope.angleThreshold + "deg threshold = "
      + $('.beacon-radius-input')[0].value + " m", "red");
  }

  function drawVesselShapeHorizontal(svg) {
    var vesselShape = document.createElementNS('http://www.w3.org/2000/svg', "path");
    vesselShape.setAttributeNS(null, "d", (
    "M190 180 " +
    "Q200,160 210,180" +
    "L210 230 " +
    "L190 230 " +
    "L190 180 Z"));
    vesselShape.setAttributeNS(null, "stroke", "black");
    vesselShape.setAttributeNS(null, "stroke-width", 1);
    vesselShape.setAttributeNS(null, "opacity", 0.4);
    svg.appendChild(vesselShape);
  }

  function drawRadiusHorizontal() {
    drawCircle(svgHorizontalView, 200, 200, 500 / $scope.scale * 400, "black", "5,5", 0.3);
    drawCircle(svgHorizontalView, 200, 200, 1000 / $scope.scale * 400, "black", "5,5", 0.3);
    drawCircle(svgHorizontalView, 200, 200, distanceWHTP / $scope.scale * 400, "black", "3,7", 0.7);
    drawCircle(svgHorizontalView, 20, 370, $('.beacon-radius-input')[0].value / $scope.scale * 400, "red", "3,3", 0.5);
  }

  function drawLine(svg, startX, startY, endX, endY, color, strokeWidth, opacity, dash) {
    var gridLine = document.createElementNS('http://www.w3.org/2000/svg', "path");
    gridLine.setAttributeNS(null, "d", ("M" + startX + ", " + startY +
    " L" + endX + ", " + endY));
    gridLine.setAttributeNS(null, "stroke", color);
    gridLine.setAttributeNS(null, "stroke-width", strokeWidth);
    gridLine.setAttributeNS(null, "opacity", opacity);
    gridLine.setAttributeNS(null, "stroke-dasharray", dash);
    svg.appendChild(gridLine);
  }

  function drawRectangle(svg, x, y, width, height, color, strokeWidth, fill, opacity) {
    var rectangle = document.createElementNS('http://www.w3.org/2000/svg', "rect");
    rectangle.setAttributeNS(null, "x", x);
    rectangle.setAttributeNS(null, "y", y);
    rectangle.setAttributeNS(null, "width", width);
    rectangle.setAttributeNS(null, "height", height);
    rectangle.setAttributeNS(null, "stroke", color);
    rectangle.setAttributeNS(null, "stroke-width", strokeWidth);
    rectangle.setAttributeNS(null, "fill", fill);
    rectangle.setAttributeNS(null, "opacity", opacity);
    svg.appendChild(rectangle);
  }

  function drawLabel(svg, positionX, positionY, value, color) {
    var gridLineLabel = document.createElementNS('http://www.w3.org/2000/svg', "text");
    gridLineLabel.setAttributeNS(null, "x", positionX);
    gridLineLabel.setAttributeNS(null, "y", positionY);
    gridLineLabel.setAttributeNS(null, "font", "Arial");
    gridLineLabel.setAttributeNS(null, "stroke", color);
    gridLineLabel.setAttributeNS(null, "font-size", "12px");
    gridLineLabel.setAttributeNS(null, "font-weight", "normal");
    gridLineLabel.setAttributeNS(null, "opacity", "0.7");
    var textNode = document.createTextNode(value);
    gridLineLabel.appendChild(textNode);
    svg.appendChild(gridLineLabel);
  }

  function drawCircle(svg, positionX, positionY, radius, color, dash, opacity) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
    circle.setAttributeNS(null, "cx", positionX);
    circle.setAttributeNS(null, "cy", positionY);
    circle.setAttributeNS(null, "r", radius);
    circle.setAttributeNS(null, "stroke", color);
    circle.setAttributeNS(null, "fill", "none");
    circle.setAttributeNS(null, "stroke-width", "1");
    circle.setAttributeNS(null, "stroke-dasharray", dash);
    circle.setAttributeNS(null, "opacity", opacity);
    svg.appendChild(circle);
  }
}
