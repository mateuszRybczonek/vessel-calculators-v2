var myCanvas = document.getElementById("canvas");
var context = myCanvas.getContext("2d");

var myCanvasEnlarge1 = document.getElementById("canvasEnlarge1");
var contextEnlarge1 = myCanvasEnlarge1.getContext("2d");

var myCanvasEnlarge2 = document.getElementById("canvasEnlarge2");
var contextEnlarge2 = myCanvasEnlarge2.getContext("2d");

function drawing() {
    clearCanvas(context, myCanvas);
    var wptNumber, gridSpaceX, gridSpaceY, row, scale;
    var minEasting, maxEasting, minNorthing, maxNorthing;
    var eastingFrame, northingFrame;
    var centerEasting, centerNorthing;
    var myTable = document.getElementById("table");
    var wptX, wptY, prevWptX, prevWptY;

    //DRAW ON MAIN CANVAS (all route)
    scale = 32;
    getMinMaxEastingsNorthings();
    getCenterPoint(maxEasting, minEasting, maxNorthing, minNorthing);
    roundToNearest500(220, 230);
    drawCoordinates(context);
    document.getElementById("eastingFrameCanvas").value = eastingFrame; //create eastingFrame for "getCoordinates.js"
    document.getElementById("northingFrameCanvas").value = northingFrame; //create northingFrame for "getCoordinates.js"

    for (gridSpaceX = 0; gridSpaceX <= 6; gridSpaceX++) {
        for (gridSpaceY = 0; gridSpaceY <= 6; gridSpaceY++) {
            drawGridLines(context); // drawing 'Grid Lines' on the 'chart'
            drawGridLinesLabels(context); // drawing 'Grid Lines' labels (string)
        }
    }
    for (wptNumber = 0; wptNumber < myTable.rows.length; wptNumber++) {
        drawSHZ(context);
        drawWPTAndLabels(context);
    }

    //DRAW ON SECOND CANVAS (enlargement of start psn)
    clearCanvas(contextEnlarge1, myCanvasEnlarge1);
    scale = 8;
    centerEasting = myTable.rows[0].cells[2].textContent;
    centerNorthing = myTable.rows[0].cells[3].textContent;

    eastingFrame = Math.floor(centerEasting - 200 * scale);
    northingFrame = Math.floor(centerNorthing - (-150 * scale));

    // drawing coordinates (string) on the gridFrame [0,0]
    drawCoordinates(contextEnlarge1);

    // drawing 'Grid Lines' on the 'chart' (drawTrackPanel)
    for (gridSpaceX = 0; gridSpaceX <= 6; gridSpaceX++) {
        for (gridSpaceY = 0; gridSpaceY <= 6; gridSpaceY++) {
            drawGridLines(contextEnlarge1);

            // drawing 'Grid Lines' labels (string)
            drawGridLinesLabels(contextEnlarge1);
        }
    }
    for (wptNumber = 0; wptNumber < myTable.rows.length; wptNumber++) {
        //draw SHZ
        drawSHZ(contextEnlarge1);
        // draw WPT and add label with wptNumber to each WPT
        drawWPTAndLabels(contextEnlarge1);
    }

    //DRAW ON THIRD CANVAS (enlargement of end psn)
    clearCanvas(contextEnlarge2, myCanvasEnlarge2);
    var tableLength = myTable.rows.length;
    scale = 8;
    centerEasting = myTable.rows[Number(tableLength) - 1].cells[2].textContent;
    centerNorthing = myTable.rows[Number(tableLength) - 1].cells[3].textContent;

    eastingFrame = Math.floor(centerEasting - 200 * scale);
    northingFrame = Math.floor(centerNorthing - (-150 * scale));

    // drawing coordinates (string) on the gridFrame [0,0]
    drawCoordinates(contextEnlarge2);

    // drawing 'Grid Lines' on the 'chart' (drawTrackPanel)
    for (gridSpaceX = 0; gridSpaceX <= 6; gridSpaceX++) {
        for (gridSpaceY = 0; gridSpaceY <= 6; gridSpaceY++) {
            drawGridLines(contextEnlarge2);

            // drawing 'Grid Lines' labels (string)
            drawGridLinesLabels(contextEnlarge2);
        }
    }
    for (wptNumber = 0; wptNumber < myTable.rows.length; wptNumber++) {
        //draw SHZ
        drawSHZ(contextEnlarge2);
        // draw WPT and add label with wptNumber to each WPT
        drawWPTAndLabels(contextEnlarge2);
    }

    function drawGridLines(argument) {
        argument.beginPath();
        argument.lineTo(100 * gridSpaceX, 100 * gridSpaceY);
        argument.lineTo(100 * (6 - gridSpaceX), 100 * gridSpaceY);
        argument.lineTo(100 * gridSpaceX, 100 * gridSpaceY);
        argument.lineTo(100 * gridSpaceX, 100 * (6 - gridSpaceY));
        argument.lineWidth = 0.2;
        argument.stroke();
    }

    function getMinMaxEastingsNorthings() {
        minEasting = getMinEasting();
        maxEasting = getMaxEasting();
        minNorthing = getMinNorthing();
        maxNorthing = getMaxNorthing();
    }

    function roundToNearest500(arg1, arg2) //create [0,0] grid point on nearest 500 coordinates  (x-shift, y-shift)
    {
        eastingFrame = Math.floor((centerEasting - arg1 * scale) / 500) * 500;
        northingFrame = Math.ceil((centerNorthing + arg2 * scale) / 500) * 500;
    }

    // to set up a drawing frame correctly (top-left corner as X=minEasting, Y=maxNorthing)
    function getMinEasting() {
        minEasting = 1000000;
        for (row = 0; row < myTable.rows.length; row++) {
            if (myTable.rows[row].cells[2].textContent < minEasting) {
                minEasting = myTable.rows[row].cells[2].textContent;
            }
        }
        return minEasting;
    }

    function getMaxEasting() {
        maxEasting = 0;
        for (row = 0; row < myTable.rows.length; row++) {
            if (myTable.rows[row].cells[2].textContent > maxEasting) {
                maxEasting = myTable.rows[row].cells[2].textContent;
            }
        }
        return maxEasting;
    }

    function getMaxNorthing() {
        maxNorthing = 0;
        for (row = 0; row < myTable.rows.length; row++) {
            if (myTable.rows[row].cells[3].textContent > maxNorthing) {
                maxNorthing = myTable.rows[row].cells[3].textContent;
            }
        }
        return maxNorthing;
    }

    function getMinNorthing() {
        minNorthing = 100000000;
        for (row = 0; row < myTable.rows.length; row++) {
            if (myTable.rows[row].cells[3].textContent < minNorthing) {
                minNorthing = myTable.rows[row].cells[3].textContent;
            }
        }
        return minNorthing;
    }

    function getCenterPoint(xEasting, iEasting, xNorthing, iNorthing) // maxEasting, minEasting, maxNorthing, minNorthing
    {
        centerEasting = (Number(xEasting) + Number(iEasting)) / 2;
        centerNorthing = (Number(xNorthing) + Number(iNorthing)) / 2;

    }

    function drawCoordinates(argument) 	// drawing coordinates (string) on the gridFrame [0,0] (nameOfTheCanvas)
    {
        argument.font = "12px Arial";
        argument.fillText(("E " + (eastingFrame)), 5, 16);
        argument.fillText(("N " + (northingFrame)), 5, 30);
    }

    function clearCanvas(contextA, canvasA) // nameOfTheCanvas
    {
        contextA.clearRect(0, 0, canvasA.width, canvasA.height);
    }

    function drawGridLinesLabels(argument) // drawing 'Grid Lines' labels (string) (nameOfTheCanvas)
    {
        if (gridSpaceX > 0 && gridSpaceY == 0) {
            argument.fillText(("E " + (eastingFrame + scale * 100 * gridSpaceX)), 100 * gridSpaceX - 55, 580);
        }
        if (gridSpaceX == 0 && gridSpaceY > 0) {
            argument.fillText(("N " + (northingFrame - scale * 100 * gridSpaceY)), 530, 100 * gridSpaceY - 3);
        }
    }

    function drawSHZ(argument)//draw 500m SHZ around WH position(nameOfTheCanvas)
    {
        if (myTable.rows[wptNumber].cells[1].textContent == "WH") {
            argument.strokeStyle = "black";
            argument.beginPath();
            argument.arc(((myTable.rows[wptNumber].cells[2].textContent - eastingFrame) / scale), ((northingFrame - myTable.rows[wptNumber].cells[3].textContent) / scale), 500 / scale, 0, 2 * Math.PI);
            argument.lineWidth = "1";
            argument.stroke();
        }
        argument.strokeStyle = "red";
        wptX = ((myTable.rows[wptNumber].cells[2].textContent) - eastingFrame) / scale;
        wptY = (northingFrame - (myTable.rows[wptNumber].cells[3].textContent)) / scale;
        if (wptNumber > 0) {
            argument.beginPath();
            argument.moveTo(prevWptX, prevWptY);
            argument.lineTo(wptX, wptY);
            argument.stroke();
            argument.strokeStyle = "black";
        }
    }

    function drawWPTAndLabels(argument) // draw WPT and add label with wptNumber to each WPT (nameOfTheCanvas)
    {
        if ((wptNumber + 1) % 2 == 0) {
            if (myTable.rows[wptNumber].cells[1].textContent == "WH") {
                argument.fillText(wptNumber + 1 + " (WH)", wptX + 3, wptY);
                argument.beginPath();
                argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
            }
            else if (myTable.rows[wptNumber].cells[1].textContent == "SHZ") {
                argument.fillText(wptNumber + 1 + " (SHZ)", wptX + 3, wptY);
                argument.beginPath();
                argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
                argument.stroke();
            }
            else {
                argument.fillText(wptNumber + 1, wptX + 3, wptY);
                argument.beginPath();
                argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
                argument.stroke();
            }

        }
        else {
            if (myTable.rows[wptNumber].cells[1].textContent == "WH") {
                argument.fillText(wptNumber + 1 + " (WH)", wptX - 10, wptY);
                argument.beginPath();
                argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
                argument.stroke();
            }
            else if (myTable.rows[wptNumber].cells[1].textContent == "SHZ") {
                argument.fillText(wptNumber + 1 + " (SHZ)", wptX - 10, wptY);
                argument.beginPath();
                argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
                argument.stroke();
            }
            else {
                argument.fillText(wptNumber + 1, wptX - 10, wptY);
                argument.beginPath();
                argument.arc(wptX, wptY, 1, 0, 2 * Math.PI);
                argument.stroke();
            }
        }
        prevWptX = wptX;
        prevWptY = wptY;
    }
}