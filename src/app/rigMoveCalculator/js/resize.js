$(document).ready(function () {
    updateContainer();
});
$(window).resize(function () {
    updateContainer();
});

function updateContainer() {
    var $windowWidth = $(window).width();
    if ($windowWidth < 1110) {
        $('#canvasEnlarge1').css({'marginLeft': '3%', 'width': '350px'});
        $('#canvasEnlarge2').css({'marginLeft': '3%', 'width': '350px'});
    }

    if ($windowWidth > 1110) {
        $('#canvasEnlarge1').css({'marginLeft': '10%', 'width': '400px'});
        $('#canvasEnlarge2').css({'marginLeft': '10%', 'width': '400px'});
    }
};