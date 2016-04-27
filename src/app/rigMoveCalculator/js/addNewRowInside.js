function addNewRowInside() {
    var myTable = document.getElementById("table");
    var rowCount = myTable.rows.length;
    for (var row = 0; row < rowCount; row++) {
        if (myTable.rows[row].cells[9].firstChild.checked == 1) {
            myTable.insertRow(row + 1);
            //update rowCount (one row was removed)
            rowCount = myTable.rows.length;

            for (var i = (row + 2); i < rowCount; i++) {
                var WPTno = myTable.rows[i].cells[0].textContent;
                myTable.rows[i].cells[0].textContent = WPTno - (-1);
            }

            myTable.rows[(row + 1)].insertCell(0);
            myTable.rows[(row + 1)].cells[0].textContent = (row + 2);

            myTable.rows[(row + 1)].insertCell(1);
            myTable.rows[(row + 1)].cells[1].className = "wptName";
            myTable.rows[(row + 1)].cells[1].textContent = document.getElementById("nameWPT").value;

            myTable.rows[(row + 1)].insertCell(2);
            myTable.rows[(row + 1)].cells[2].textContent = document.getElementById("newEasting").value;

            myTable.rows[(row + 1)].insertCell(3);
            myTable.rows[(row + 1)].cells[3].textContent = document.getElementById("newNorthing").value;

            myTable.rows[(row + 1)].insertCell(4);
            myTable.rows[(row + 1)].insertCell(5);
            myTable.rows[(row + 1)].insertCell(6);
            myTable.rows[(row + 1)].insertCell(7);
            myTable.rows[(row + 1)].insertCell(8);
            myTable.rows[(row + 1)].insertCell(9).innerHTML = "<td class=\"selected\"><input type=\"checkbox\"<\td>"
            myTable.rows[(row + 1)].cells[9].className = "selected";
        }
    }
    colorCodeTable();
}


document.getElementById("bInsertWPT").addEventListener('click', addNewRowInside, false);