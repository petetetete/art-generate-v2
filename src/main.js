var perfTests = []; // TESTING

// Initialize app
var app = new ArtManager(document.getElementById("canvas"), 1000, 1000);

// Get elements
var button = document.getElementById("draw");
var width = document.getElementById("width");
var height = document.getElementById("height");
var pixel = document.getElementById("pixel");
var palettes = document.getElementById("palettes");
var algorithms = document.getElementById("algorithm");

// Initialize values
app.getPalettes().forEach((palette) => {
    palettes.options.add(new Option(palette, palette, false));
});

app.getAlgorithms().forEach((algorithm) => {
    algorithms.options.add(new Option(algorithm, algorithm, false));
});

width.value = app.getWidth();
height.value = app.getHeight();
pixel.value = app.getPixelSize();
palettes.value = app.getPalette();
algorithms.value = app.getAlgorithm();

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
palettes.onchange = (e) => app.setPalette(e.target.value);
algorithms.onchange = (e) => app.setAlgorithm(e.target.value);

// Initial generation
app.generate();
