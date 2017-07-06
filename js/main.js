var perfTests = []; // TESTING

// Initialize app
var app = new ArtManager(document.getElementById("js-canvas"), document.getElementById("js-favicon"));

// Get elements
var button = document.getElementById("js-draw");
var pixel = document.getElementById("js-pixel");
var palettes = document.getElementById("js-palettes");
var algorithms = document.getElementById("js-algorithm");
var advancedStatsEnabled = document.getElementById("js-advancedStatsEnabled");

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
advancedStatsEnabled.value = app.getAdvancedStatsEnabled();

function generateArt() {
    var t1 = performance.now(); // TESTING
    var stats = app.generate();

    // Stats testing
    console.log(stats.basic);
    stats.advanced.then((advanced) => {
        console.log(advanced);
    });

    var t2 = performance.now(); // TESTING
    document.getElementById("js-time").innerText = `${Math.round(t2 - t1)}ms`; // TESTING
    perfTests.push(t2 - t1); // TESTING
}

button.onclick = generateArt;
pixel.onchange = (e) => app.setPixelSize(e.target.value);
palettes.onchange = (e) => app.setPalette(allPalettes.find(x => x == e.target.value));
algorithms.onchange = (e) => app.setAlgorithm(e.target.value);
advancedStatsEnabled.onchange = (e) => app.setAdvancedStatsEnabled(e.target.value == "true");

// Initial generation
generateArt();
