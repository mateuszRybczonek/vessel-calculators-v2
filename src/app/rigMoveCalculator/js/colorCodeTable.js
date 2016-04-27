function colorCodeTable() {
    var myTable = document.getElementById("table");
    var rowCount = myTable.rows.length;

    var rowsArray = myTable.getElementsByTagName("tr");
    for (var row = 0; row < rowCount; row++) {
        if (row % 2 == 0) {
            rowsArray[row].className = "";
        }
        else {
            rowsArray[row].className = "even";
        }
    }
}