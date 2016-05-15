function lblArrayPlanningController ($scope){
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
}
