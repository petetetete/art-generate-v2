var perfTests = []; // TESTING

// Initialize app
var app = new ArtManager(document.getElementById("js-canvas"));

// Get elements
var button = document.getElementById("draw");
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

pixel.value = app.getPixelSize();
palettes.value = app.getPalette();
algorithms.value = app.getAlgorithm();

function generateArt() {
    var t1 = performance.now(); // TESTING
    var stats = app.generate();

    // Stats testing
    console.log(stats.basic);
    stats.advanced.then((advanced) => {
        console.log(advanced);
    });

    var t2 = performance.now(); // TESTING
    document.getElementById("time").innerText = `${Math.round(t2 - t1)}ms`; // TESTING
    perfTests.push(t2 - t1); // TESTING
}

button.onclick = generateArt;
pixel.onchange = (e) => app.setPixelSize(e.target.value);
palettes.onchange = (e) => {
    // app.setPalette(e.target.value);
    app.setPalette(allPalettes.find(x => x == e.target.value)); // I don't know why this fixes anything
}
algorithms.onchange = (e) => app.setAlgorithm(e.target.value);

// Initial generation
generateArt();
