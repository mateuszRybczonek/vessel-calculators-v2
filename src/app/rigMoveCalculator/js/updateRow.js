function updateRow() {
    var myTable = document.getElementById("table");
    var rowCount = myTable.rows.length;
    var WPT = new Object();
    WPT.name = document.getElementById("nameWPT").value;
    WPT.easting = document.getElementById("newEasting").value;
    WPT.northing = document.getElementById("newNorthing").value;

    for (var row = 0; row < rowCount; row++) {
        if (myTable.rows[row].cells[9].firstChild.checked == 1) {
            myTable.rows[row].cells[1].textContent = WPT.name;
            myTable.rows[row].cells[2].textContent = WPT.easting;
            myTable.rows[row].cells[3].textContent = WPT.northing;
            myTable.rows[row].cells[4].textContent = "";
            myTable.rows[row].cells[5].textContent = "";
            myTable.rows[row].cells[6].textContent = "";
            myTable.rows[row].cells[7].textContent = "";
            myTable.rows[row].cells[8].textContent = "";

        }
    }
}
document.getElementById("bUpdateRow").addEventListener('click', updateRow, false);