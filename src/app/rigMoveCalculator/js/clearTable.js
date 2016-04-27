function fClearTable() {
    var myTable = document.getElementById("table");
    myTable.innerHTML = "";
}

document.getElementById("bClearTable").addEventListener('click', fClearTable, false);