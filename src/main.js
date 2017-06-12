var perfTests = []; // TESTING

var app = new ArtManager(document.getElementById("canvas"), 1000, 1000);

var button = document.getElementById("draw");
var width = document.getElementById("width");
var height = document.getElementById("height");
var pixel = document.getElementById("pixel");
var palette = document.getElementById("palette");
var algorithm = document.getElementById("algorithm");

button.onclick = function() {
    var t1 = performance.now(); // TESTING
    app.generate();
    var t2 = performance.now(); // TESTING
    document.getElementById("time").innerText = `${Math.round(t2 - t1)}ms`; // TESTING
    perfTests.push(t2 - t1); // TESTING
}

width.onchange = (e) => app.setWidth(e.target.value);
height.onchange = (e) => app.setHeight(e.target.value);
pixel.onchange = (e) => app.setPixelSize(e.target.value);
palette.onchange = (e) => app.setPalette(e.target.value);
algorithm.onchange = (e) => app.setAlgorithm(e.target.value);
