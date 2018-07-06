import "./styles/main.css";
import ArtManager from "./art_manager";

var perfTests = []; // TESTING

// Initialize app
const app = new ArtManager(document.getElementById("js-canvas"), document.getElementById("js-favicon"));

// Get elements
const randomizeButton = document.getElementById("js-randomize");
const drawButton = document.getElementById("js-draw");
const pixel = document.getElementById("js-pixel");
const palettes = document.getElementById("js-palettes");
const algorithms = document.getElementById("js-algorithm");
const advancedStatsEnabled = document.getElementById("js-advancedStatsEnabled");

const timeStat = document.getElementById("js-time");
const pixelCountStat = document.getElementById("js-pixel-count");
const timesGeneratedStat = document.getElementById("js-times-generated");
const averageTimeStat = document.getElementById("js-average-time");

const topColors = document.getElementById("js-top-colors");

const allPalettes = app.getPalettes();


function generateArt() {

    // Add loading spinners
    document.body.classList.add("art-loading");

    var stats = app.generate();


    // Stats testing
    console.log(stats.basic);
    stats.advanced.then((advanced) => {

        if (advanced) {
            populateAdvancedStats(advanced);
        }

        // Remove loading spinners
        document.body.classList.remove("art-loading");
    });

    // Populate basic stats
    populateBasicStats(stats.basic);

}

function updateOptions() {
    pixel.value = app.getPixelSize();
    palettes.value = app.getPalette();
    algorithms.value = app.getAlgorithm();
    advancedStatsEnabled.value = app.getAdvancedStatsEnabled();
}

function populateBasicStats(stats) {
    timeStat.innerText = `${stats.generationTime}ms`;
    pixelCountStat.innerText = `${stats.pixelCount} pixels`;
    timesGeneratedStat.innerText = `${stats.timesGenerated} generations`;
    averageTimeStat.innerText = `${stats.averageGenerationTime}ms`;
}

function populateAdvancedStats(stats) {
    console.log(stats);
    const topAppearance = stats.topColorAppearances[0].count;

    topColors.innerHTML = stats.topColorAppearances.map((color) => `
        <div class="adv-stats__top-color">
            <div class="adv-stats__top-color-title" style="background-color:${color.hex};">
                <div class="adv-stats__top-color-name">${color.hex} - ${color.count} times</div>
            </div>
            <div class="adv-stats__top-color-bar" style="width:${color.count / topAppearance * 100}%;background-color:${color.hex};"></div>
        </div>
    `).join("");
}

randomizeButton.onclick = (_) => {
    app.randomizeSettings();
    updateOptions();
    generateArt();
}
drawButton.onclick = generateArt;
pixel.onchange = (e) => app.setPixelSize(e.target.value);
palettes.onchange = (e) => app.setPalette(allPalettes.find(x => x == e.target.value));
algorithms.onchange = (e) => app.setAlgorithm(e.target.value);
advancedStatsEnabled.onchange = (e) => app.setAdvancedStatsEnabled(e.target.value == "true");

// Initialize values
allPalettes.forEach((palette) => {
    palettes.options.add(new Option(palette, palette, false));
});

app.getAlgorithms().forEach((algorithm) => {
    algorithms.options.add(new Option(algorithm, algorithm, false));
});

// Initial generation
updateOptions();
generateArt();
