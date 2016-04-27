function addNewRow() {
    var myTable = document.getElementById("table"); //select table as var
    var tableContentHTML = myTable.innerHTML;

    //add html to table code
    var rowCount = myTable.rows.length;
    if (rowCount % 2 != 0) {
        myTable.innerHTML = tableContentHTML + "<tr class=\"even\"><td><label type=\"text\" " +
            "name=\"wptNo.\"></label></td><td><label type=\"text\" name=\"wptName\" value=\"" +
            document.getElementById("nameWPT").value + "\">" + document.getElementById("nameWPT").value +
            "</label></td><td><label type=\"text\" name=\"coordE\" value=\"" +
            document.getElementById("newEasting").value + "\">" + document.getElementById("newEasting").value +
            "</td><td><label type=\"text\" name=\"coordN\" value=\"" + document.getElementById("newNorthing").value +
            "\">" + document.getElementById("newNorthing").value +
            "</td><td><label type=\"text\" name=\"distLeg\"></label></td><td><label id= type=\"text\" " +
            "name=\"distDone\"></label></td><td><label type=\"text\" name=\"distRemain\"></label></td><td><label " +
            "type=\"text\" name=\"timeLeg\"></label></td><td><label type=\"text\" " +
            "name=\"timeRemain\"></label></td><td class=\"selected\"><input type=\"checkbox\"<\td></tr>";
    }
    else {
        myTable.innerHTML = tableContentHTML + "<tr><td><label type=\"text\" name=\"wptNo.\"></label></td><td><label " +
            "type=\"text\" name=\"wptName\" value=\"" + document.getElementById("nameWPT").value + "\">"
            + document.getElementById("nameWPT").value + "</label></td><td><label type=\"text\" " +
            "name=\"coordE\" value=\"" + document.getElementById("newEasting").value + "\">"
            + document.getElementById("newEasting").value + "</td><td><label type=\"text\" " +
            "name=\"coordN\" value=\"" + document.getElementById("newNorthing").value + "\">"
            + document.getElementById("newNorthing").value + "</td><td><label type=\"text\" " +
            "name=\"distLeg\"></label></td><td><label id= type=\"text\" name=\"distDone\"></label></td><td><label " +
            "type=\"text\" name=\"distRemain\"></label></td><td><label type=\"text\" " +
            "name=\"timeLeg\"></label></td><td><label type=\"text\" " +
            "name=\"timeRemain\"></label></td><td class=\"selected\"><input type=\"checkbox\"<\td></tr>";
    }

    //create WPTno.
    rowCount = myTable.rows.length;
    document.getElementById("table").rows[rowCount - 1].cells[0].innerHTML = rowCount;
}

var bNewRow = document.getElementById("bAddNewRow");
bNewRow.addEventListener('click', addNewRow, false);

