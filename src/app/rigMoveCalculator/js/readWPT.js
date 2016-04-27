function readBeacon() {
    //select table as var
    var myTable = document.getElementById("table");

    checkRead();
}

function checkRead() {
    var rowCount = myTable.rows.length;
    for (var row = 0; row < rowCount; row++) {
        if (myTable.rows[row].cells[9].firstChild.checked == 1) {
            for (var iteration = 1; iteration < 4; iteration++) {
                newText = myTable.rows[row].cells[iteration].innerHTML;
                var item = document.getElementsByClassName("newWPTInput");
                item[iteration - 1].value = newText;
            }
        }
    }
}
var bReadBeacon = document.getElementById("bReadRow");
bReadBeacon.addEventListener('click', readBeacon, false);