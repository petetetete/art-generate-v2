var perfTests = []; // TESTING

// Initialize app
const app = new ArtManager(document.getElementById("js-canvas"), document.getElementById("js-favicon"));

// Get elements
const drawButton = document.getElementById("js-draw");
const pixel = document.getElementById("js-pixel");
const palettes = document.getElementById("js-palettes");
const algorithms = document.getElementById("js-algorithm");
const advancedStatsEnabled = document.getElementById("js-advancedStatsEnabled");

const timeStat = document.getElementById("js-time");
const pixelCountStat = document.getElementById("js-pixel-count");
const timesGeneratedStat = document.getElementById("js-times-generated");
const averageTimeStat = document.getElementById("js-average-time");

const allPalettes = app.getPalettes();

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

    console.log(drawButton.classList);
    // Add loading spinners
    drawButton.classList.add("body__submit--active");

    var stats = app.generate();


    // Stats testing
    console.log(stats.basic);
    stats.advanced.then((advanced) => {
        console.log(advanced);

        // Remove loading spinners
        drawButton.classList.remove("body__submit--active");
    });

    // Populate basic stats
    timeStat.innerText = `${stats.basic.generationTime}ms`;
    pixelCountStat.innerText = `${stats.basic.pixelCount} pixels`;
    timesGeneratedStat.innerText = `${stats.basic.timesGenerated} generations`;
    averageTimeStat.innerText = `${stats.basic.averageGenerationTime}ms`;

}

drawButton.onclick = generateArt;
pixel.onchange = (e) => app.setPixelSize(e.target.value);
palettes.onchange = (e) => app.setPalette(allPalettes.find(x => x == e.target.value));
algorithms.onchange = (e) => app.setAlgorithm(e.target.value);
advancedStatsEnabled.onchange = (e) => app.setAdvancedStatsEnabled(e.target.value == "true");

// Initial generation
generateArt();