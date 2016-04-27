function fImportCSV() {
    var fileInput = document.getElementById('fileInput'); //file pathname
    var file = fileInput.files[0]; //array of loaded files
    var reader = new FileReader();
    reader.onload = function (file) {
        // content of *.csv as plain text
        var content = file.target.result;
        // split csv in "\r\n" - new line mark Windows ("\n" - Linux, "\r" - Apple)
        var rows = file.target.result.split(/[\r\n|\n|\r]+/);

        var myTable = document.getElementById("table");
        // clear table
        myTable.innerHTML = "";
        var rowCount;
        // create rows using innerHTML (better to use DOM next time!!!)
        for (rowCount = 0; rowCount < rows.length - 3; rowCount++) {
            if (rowCount % 2 == 0) {
                myTable.innerHTML = myTable.innerHTML + "<tr class=\"even\"><td class=\"noCol\"><label type=\"text\" name=\"wptNo.\"></label></td><td class=\"wptName\"><label type=\"text\" name=\"wptName\" value=\"\"></label></td><td><label type=\"text\" name=\"coordE\" value=\"\"></td><td><label type=\"text\" name=\"coordN\" value=\"\"></td><td><label type=\"text\" name=\"distLeg\"></label></td><td><label id= type=\"text\" name=\"distDone\"></label></td><td><label type=\"text\" name=\"distRemain\"></label></td><td><label type=\"text\" name=\"timeLeg\"></label></td><td><label type=\"text\" name=\"timeRemain\"></label></td><td class=\"selected\"><input type=\"checkbox\"<\td></tr>";
            }
            else {
                myTable.innerHTML = myTable.innerHTML + "<tr><td class=\"noCol\"><label type=\"text\" name=\"wptNo.\"></label></td><td class=\"wptName\"><label type=\"text\" name=\"wptName\" value=\"\"></label></td><td><label type=\"text\" name=\"coordE\" value=\"\"></td><td><label type=\"text\" name=\"coordN\" value=\"\"></td><td><label type=\"text\" name=\"distLeg\"></label></td><td><label id= type=\"text\" name=\"distDone\"></label></td><td><label type=\"text\" name=\"distRemain\"></label></td><td><label type=\"text\" name=\"timeLeg\"></label></td><td><label type=\"text\" name=\"timeRemain\"></label></td><td class=\"selected\"><input type=\"checkbox\"<\td></tr>";
            }
            // create array of "words" to be put into the cells
            var array = rows[rowCount].split(';');
            // put "words" into cells
            for (var column = 0; column < array.length; column++) {
                table.rows[rowCount].cells[column].textContent = array[column];
            }
        }
        //trackName
        document.getElementById("iTrackName").value = rows[rows.length - 3];
        //speed
        document.getElementById("projectedSpeed").value = rows[rows.length - 2];
    };
    reader.readAsText(file);
}

document.getElementById('bLoadFromCSV').addEventListener('click', fImportCSV, false);

