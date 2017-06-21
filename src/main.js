var perfTests = []; // TESTING

// Initialize app
var app = new ArtManager(document.getElementById("js-canvas"));

// Get elements
var button = document.getElementById("draw");
/*var width = document.getElementById("width");
var height = document.getElementById("height");*/
var pixel = document.getElementById("pixel");
var palettes = document.getElementById("palettes");
var algorithms = document.getElementById("algorithm");

var allPalettes = app.getPalettes();

// Initialize values
allPalettes.forEach((palette) => {
    palettes.options.add(new Option(palette, palette, false));
});

app.getAlgorithms().forEach((algorithm) => {
    algorithms.options.add(new Option(algorithm, algorithm, false));
});

/*width.value = app.getWidth();
height.value = app.getHeight();*/
pixel.value = app.getPixelSize();
palettes.value = app.getPalette();
algorithms.value = app.getAlgorithm();

function generateArt() {
    var t1 = performance.now(); // TESTING
    var stats = app.generate();

    console.log(stats.basic);
    stats.advanced.then((advanced) => {
        console.log(advanced);
    });

    var t2 = performance.now(); // TESTING
    document.getElementById("time").innerText = `${Math.round(t2 - t1)}ms`; // TESTING
    perfTests.push(t2 - t1); // TESTING
}

button.onclick = generateArt;
/*width.onchange = (e) => app.setWidth(e.target.value);
height.onchange = (e) => app.setHeight(e.target.value);*/
pixel.onchange = (e) => app.setPixelSize(e.target.value);
palettes.onchange = (e) => {
    app.setPalette(allPalettes.find(x => x == e.target.value)); // I don't know why this fixes anything
    // app.setPalette(e.target.value);
}
algorithms.onchange = (e) => app.setAlgorithm(e.target.value);

// Initial generation
generateArt();
