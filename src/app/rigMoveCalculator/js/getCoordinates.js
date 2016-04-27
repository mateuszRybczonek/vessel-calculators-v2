var myTable = document.getElementById("table");

function getCoordinates(event) {
    var x = new Number();
    var y = new Number();
    var row, eastingFrameCanvas, northingFrameCanvas;
    var canvas = document.getElementById("canvas");
    var rect = canvas.getBoundingClientRect();
    var scale = 32;

    if (event.x != undefined && event.y != undefined) {
        x = event.x;
        y = event.y;
    }
    else // Firefox method to get the position
    {
        x = (event.clientX - rect.left).toFixed(0); //in pixels
        y = (event.clientY - rect.top).toFixed(0);
    }
    eastingFrameCanvas = document.getElementById("eastingFrameCanvas").value;
    northingFrameCanvas = document.getElementById("northingFrameCanvas").value;
    x = Number(x * scale) + Number(eastingFrameCanvas); //according to scale and eastingFrame
    y = Number(y * scale) + Number(northingFrameCanvas); //according to scale and northingFrame
    alert("Easting: " + x + "  Northing: " + y);
}

canvas.addEventListener("mousedown", getCoordinates, false);		
