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

  var distanceWHTP, row;

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
      $('.start-angle-input')[0].value = $scope.beaconsJSON.startAngle;
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

    //$scope.$watch('arrays', function () {
    //  calculate();
    //});
  }

  function clearTable(arrayNo) {
    $scope.arrayNo = arrayNo;
    $scope.arrayNo = [];
  }

  function saveChanges(index, serialNo, floatNo, arrayNo) {
    $scope.arrayNo = arrayNo;
    $scope.arrayNo[index] = {'index': index + 1, 'serialNo': serialNo, 'floatNo': floatNo};
  }

  function removeRow(selectedIndex, arrayNo) {
    $scope.arrayNo = arrayNo;
    $scope.arrayNo.splice(selectedIndex, 1);
    $scope.arrayNo.map(function (WPT, index) {
      WPT.index = index + 1;
    });
  }

  function moveRow(start, end, arrayNo) {
    $scope.arrayNo = arrayNo;
    var stash = $scope.arrayNo[end];
    $scope.arrayNo[end] = $scope.arrayNo[start];
    $scope.arrayNo[start] = stash;
    $scope.arrayNo[start].index = start + 1;
    $scope.arrayNo[end].index = end + 1;
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

    var beaconRadius = (Math.round(relativeDepth * Math.sin((Number(verticalAngle) + Number(angleThreshold)) / (180 / Math.PI)))
      - Math.round(relativeDepth * Math.sin((Number(verticalAngle) - Number(angleThreshold)) / (180 / Math.PI)))) / 2;
    $('.beacon-radius-input')[0].value = beaconRadius;

    for (row = 0; row < $scope.array1.length; row++) {
      calculateNorthingsAndEastings($('.tableArray1')[0], 0);
    }
    for (row = 0; row < $scope.array2.length; row++) {
      calculateNorthingsAndEastings($('.tableArray2')[0], 180 / $scope.array2.length);
    }
    //drawing();
  }

  function calculateNorthingsAndEastings(table, angleShift) {
    var WHNorthing = $('.wh-northing-input')[0].value;
    var WHEasting = $('.wh-easting-input')[0].value;
    table.rows[row+2].cells[5].textContent = distanceWHTP;
    var bearing = Math.round(angleShift + Number($('.start-angle-input')[0].value) + 360 / table.rows.length * row);
    table.rows[row+2].cells[6].textContent = bearing;
    //calculate beacon's northing
    var deltaNorthing = Math.round(Math.sqrt(distanceWHTP * Math.cos(bearing / (180 / Math.PI))
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
    table.rows[row+2].cells[3].textContent = beaconNorthing;
    //calculate beacon's easting
    var deltaEasting = Math.round(distanceWHTP * Math.sin(bearing / (180 / Math.PI)));
    var beaconEasting = Math.round(Number(WHEasting) + Number(deltaEasting));
    table.rows[row+2].cells[4].textContent = beaconEasting;
  }

}
