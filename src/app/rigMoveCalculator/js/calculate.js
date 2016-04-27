function calculate() {

    var iteration;
    var myTable = document.getElementById("table"); //select table as var
    var rowCount = myTable.rows.length;
    var eastingDifference, northingDifference, dDistanceLeg, dDistanceDone, dDD1, dDD2, dTimeLeg, speed, hours, minutes, dDistanceRemaining, dDistanceRemaining1stRow, dTimeRemaining, dTimeRemaining1stRow, speed1stRow, hours1stRow, minutes1stRow;

    function legDistanceCalculation() {
        for (iteration = 1; iteration < rowCount; iteration++) {
            eastingDifference = (myTable.rows[iteration].cells[2].textContent - myTable.rows[iteration - 1].cells[2].textContent);
            northingDifference = (myTable.rows[iteration].cells[3].textContent - myTable.rows[iteration - 1].cells[3].textContent);
            dDistanceLeg = Math.sqrt(eastingDifference * eastingDifference + northingDifference * northingDifference);
            myTable.rows[iteration].cells[4].textContent = dDistanceLeg.toFixed(0);
        }
    }


    function distanceDoneCalculation() {
        for (iteration = 1; iteration < rowCount; iteration++) {
            //if previous distanceDone empty
            if (myTable.rows[iteration - 1].cells[5].textContent == null) {
                dDistanceDone = parseFloat(0 + myTable.rows[iteration].cells[4].textContent);
            }
            else if (myTable.rows[iteration - 1].cells[5].textContent == "") {
                dDistanceDone = parseFloat(0 + myTable.rows[iteration].cells[4].textContent);
            }
            else {
                dDD1 = myTable.rows[iteration - 1].cells[5].textContent; //previous leg
                dDD2 = myTable.rows[iteration].cells[4].textContent; // current leg
                dDistanceDone = parseFloat(dDD1) + parseFloat(dDD2);
            }

            myTable.rows[iteration].cells[5].textContent = dDistanceDone;
        }
    }

    function legTimeCalculation() {
        for (iteration = 1; iteration < rowCount; iteration++) {
            {
                speed = document.getElementById("projectedSpeed").value;
                dTimeLeg = (myTable.rows[iteration].cells[4].textContent) / 1852 / speed;
                hours = Math.round(dTimeLeg);
                minutes = ((dTimeLeg - hours) * 60);
                if (minutes < 0) minutes = 60 + minutes;
                myTable.rows[iteration].cells[7].textContent = hours + " h " + minutes.toFixed(0) + " min";
            }
        }
    }

    function remainingTimeCalculation() {
        for (iteration = 1; iteration < rowCount; iteration++) // Remaining Time Calculation
        {
            dDistanceRemaining = myTable.rows[rowCount - 1].cells[5].textContent - myTable.rows[iteration].cells[5].textContent;
            myTable.rows[iteration].cells[6].textContent = dDistanceRemaining;
            document.getElementById("trackName").value = dDistanceRemaining;

            speed = document.getElementById("projectedSpeed").value;
            dTimeRemaining = dDistanceRemaining / 1852 / speed;
            hours = Math.round(dTimeRemaining);
            minutes = ((dTimeRemaining - hours) * 60);
            if (minutes < 0) minutes = 60 + minutes;
            myTable.rows[iteration].cells[8].textContent = hours + " h " + minutes.toFixed(0) + " min";
        }
    }

    function distanceRemainingAndTimeRemaining1stRow() {
        dDistanceRemaining1stRow = myTable.rows[rowCount - 1].cells[5].textContent;
        myTable.rows[0].cells[6].textContent = dDistanceRemaining1stRow;
        speed1stRow = document.getElementById("projectedSpeed").value;

        dTimeRemaining1stRow = dDistanceRemaining1stRow / 1852 / speed1stRow;
        hours1stRow = Math.round(dTimeRemaining1stRow);
        minutes1stRow = (dTimeRemaining1stRow - hours1stRow) * 60;
        if (minutes1stRow < 0) minutes1stRow = 60 + minutes1stRow;
        myTable.rows[0].cells[8].textContent = hours1stRow + " h " + minutes1stRow.toFixed(0) + " min";
    }


    legDistanceCalculation();
    distanceDoneCalculation();
    legTimeCalculation();
    remainingTimeCalculation();
    distanceRemainingAndTimeRemaining1stRow();
    drawing();
}

var bCalculate = document.getElementById("bCalculate");
bCalculate.addEventListener('click', calculate, false);



