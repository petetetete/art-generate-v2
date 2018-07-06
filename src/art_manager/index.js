import palettes from "./palettes.js";
import algorithms from "./algorithms.js";


class ArtManager {

    constructor(canvas, favicon = null) {

        // General constants
        this.FAVICON_SIZE = 256;
        this.RANDOM_PIXEL_MIN = 1;
        this.RANDOM_PIXEL_MAX = 6;
        this.TOP_COLOR_COUNT_MAX = 5;
        this.RED_PRIME = 62287637;
        this.GREEN_PRIME = 74306387;
        this.BLUE_PRIME = 19392253;

        // Color palette constants
        this.MATRIX_PROB = 0.35;
        this.MURICA_VARIANCE = 15;
        this.GOOGLE_VARIANCE = 20;

        // Algorithm constants
        this.SPARSE_PROB = 0.85;
        this.SMEAR_PROB = 0.9;
        this.SMEAR_PROB_ADJUST = 0.08;
        this.LINE_PROB = 0.6;
        this.CASCADE_PROB = 0.975;
        this.CASCADE_PROB_ADJUST = 0.02;
        this.PLAID_PROB = 0.07;
        this.PLAID_MIN_THICK = 3;
        this.PLAID_MAX_THICK = 5;
        this.PLAID_MIN_GAP = 5;
        this.PLAID_OPACITY = .7;

        // Import palette and algorithm objects
        this._palettes = palettes;
        this._algorithms = algorithms;

        // Populate the palette of the day only once
        let date = new Date();
        let dailyNumber = date.getFullYear() * 10000 +
            (date.getMonth() + 1) * 100 + date.getDate();
        let dailyNumber2 = date.getDate() * 1000000 +
            date.getFullYear() * 100 + (date.getMonth() + 1);

        let red1 = this.RED_PRIME * dailyNumber % 256,
            red2 = this.RED_PRIME * dailyNumber2 % 256,
            green1 = this.GREEN_PRIME * dailyNumber % 256,
            green2 = this.GREEN_PRIME * dailyNumber2 % 256,
            blue1 = this.BLUE_PRIME * dailyNumber % 256,
            blue2 = this.BLUE_PRIME * dailyNumber2 % 256;

        this._palettes["Of the Day!"] = function() {
            return [this._getRandomInt(red1, red2),
                    this._getRandomInt(green1, green2),
                    this._getRandomInt(blue1, blue2)];
        }

        // Initialize object variables
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.favicon = favicon;
        this.generatedImage = null;
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        // Randomize initial settings
        this.randomizeSettings();
        this._getColor = this._palettes[this.palette].bind(this);

        // Initialize stat tracking variables
        this.basicStats = {};
        this.advancedStats = {};
        this.advancedStatsEnabled = true;
        this._timesGenerated = 0;
        this._generationTimes = [];
    }

    /* Getters */

    getWidth() { return this.width }
    getHeight() { return this.height }
    getPixelSize() { return this.pixelSize }
    getPalette() { return this.palette }
    getAlgorithm() { return this.algorithm }
    getAdvancedStatsEnabled() { return this.advancedStatsEnabled }
    getPalettes() { return Object.keys(this._palettes); }
    getAlgorithms() { return Object.keys(this._algorithms); }

    /* Setters */

    setWidth(width) {
        this.width = this.canvas.width = Math.max(1, parseInt(width));
    }
    setHeight(height) {
        this.height = this.canvas.height = Math.max(1, parseInt(height));
    }
    setPixelSize(size) {
        this.pixelSize = Math.max(1, parseInt(size));
    }
    setPalette(color) {
        this.palette = color;
        this._getColor = this._palettes[color].bind(this);
    }
    setAlgorithm(algorithm) {
        this.algorithm = algorithm;
    }
    setAdvancedStatsEnabled(advancedStatsEnabled) {
        this.advancedStatsEnabled = advancedStatsEnabled;
    }

    /* Core methods */

    randomizeSettings() {
        this.setPalette(this._getRandomKeyFromObject(this._palettes));
        this.setAlgorithm(this._getRandomKeyFromObject(this._algorithms));
        this.setAlgorithm(this._getRandomKeyFromObject(this._algorithms));
        this.setPixelSize(this._getRandomInt(this.RANDOM_PIXEL_MIN,
            this.RANDOM_PIXEL_MAX));
    }

    generate() {

        // Update widths
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        // Initialize basic stats
        this.basicStats = {};
        this.advancedStats = {};

        // Stat tracking variables
        let pixelCount = (this.width * this.height) /
            (this.pixelSize * this.pixelSize);
        let startTime = performance.now();

        // Populate buffer with colors
        let buffer = this._algorithms[this.algorithm].bind(this)();

        // Load buffer data onto canvas
        let imgData = this.context.createImageData(this.width, this.height);
        imgData.data.set(buffer);
        this.context.putImageData(imgData, 0, 0);
        
        // Calculate and populate basic stats
        let endTime = performance.now();
        let generationTime = Math.floor(endTime - startTime);

        // Update tracking member variables
        this._generationTimes.push(generationTime);
        this._timesGenerated += 1;

        this.basicStats["timesGenerated"] = this._timesGenerated;
        this.basicStats["generationTime"] = generationTime;
        // TODO: Consider calculating this without a reduce to improve perf
        this.basicStats["averageGenerationTime"]
            = Math.floor(this._generationTimes.reduce((a, b) => a + b) /
                this._generationTimes.length);
        this.basicStats["pixelCount"] = Math.round(pixelCount * 100) / 100;

        // Update favicon asynchronously
        if (this.favicon)
            setTimeout(this._updateFavicon.bind(this), 0);

        // Calculate stat return values
        let basic = this.basicStats;
        let advanced = new Promise((resolve) => {

            // Calculate and populate advanced stats
            if (this.advancedStatsEnabled) {
                setTimeout(() => {
                    this.advancedStats = this._generateAdvancedStats(buffer);
                    resolve(this.advancedStats);
                }, 0);
            }
            else resolve(null);

        });

        return { basic, advanced };
    }

    _generateAdvancedStats(buffer) {

        let startTime = performance.now();

        const stats = {};

        // General tracking variables
        const allColors = new Object();
        let uniqueColors = 0;
        let lastColor = [null, null, null];
        let densityTotals = [0, 0, 0];

        // Tracking variables for consecutive colors
        let consecutive = {
            color: [null, null, null],
            count: 0
        }
        let consecutiveStreak = 1;

        // Tracking variables for extremes
        let darkest = {
            color: [255, 255, 255],
            hex: null,
            value: 765
        }
        let lightest = {
            color: [0, 0, 0],
            value: 0
        }

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {
            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                // Variables associated with the current pixel
                let pos = (y * this.width + x) * 4;
                let red = buffer[pos];
                let green = buffer[pos + 1];
                let blue = buffer[pos + 2];

                // Check if the color is a consecutive color
                if (red == lastColor[0] && green == lastColor[1] &&
                    blue == lastColor[2]) {
                    consecutiveStreak += 1;
                }
                else if (consecutiveStreak > consecutive.count) {
                    consecutive.color[0] = red;
                    consecutive.color[1] = green;
                    consecutive.color[2] = blue;
                    consecutive.count = consecutiveStreak;
                    consecutiveStreak = 0;
                }

                // Log all colors to the colors object
                let colorID = this._rgbToNumber([red, green, blue]);
                if (allColors[colorID] == null) {
                    allColors[colorID] = 1;
                    uniqueColors += 1;
                }
                else {
                    allColors[colorID] += 1;
                }

                // Keep track of the extreme colors
                let colorValue = red + green + blue;
                if (colorValue < darkest.value) {
                    darkest.value = colorValue;
                    darkest.color[0] = red;
                    darkest.color[1] = green;
                    darkest.color[2] = blue;
                }
                if (colorValue > lightest.value) {
                    lightest.value = colorValue;
                    lightest.color[0] = red;
                    lightest.color[1] = green;
                    lightest.color[2] = blue;
                }

                // Add to density totals
                densityTotals[0] += red;
                densityTotals[1] += green;
                densityTotals[2] += blue;

                // Save current color
                lastColor[0] = red, lastColor[1] = green, lastColor[2] = blue;
            }
        }

        // Populate consecutive stat object
        let consecutiveStat = {
            rgb: consecutive.color,
            hex: this._rgbToHex(consecutive.color),
            count: consecutive.count
        }

        // Populate extreme stat object
        let darkestStat = {
            rgb: darkest.color,
            hex: this._rgbToHex(darkest.color)
        };
        let lightestStat = {
            rgb: lightest.color,
            hex: this._rgbToHex(lightest.color)
        }

        // Get the most frequent colors
        let sortedColors = Object.keys(allColors)
            .sort((a, b) => allColors[b] - allColors[a]);
        let topColors = sortedColors.slice(0, this.TOP_COLOR_COUNT_MAX)
            .map(color => ({
                rgb: this._numberToRGB(color),
                hex: this._numberToHex(color),
                count: allColors[color]
            }));

        // Calculate the average color with the densities
        let averageColor = [Math.round(densityTotals[0] /
                                this.basicStats.pixelCount),
                            Math.round(densityTotals[1] /
                                this.basicStats.pixelCount),
                            Math.round(densityTotals[2] /
                                this.basicStats.pixelCount)];
        let average = {
            rgb: averageColor,
            hex: this._rgbToHex(averageColor)
        };

        let endTime = performance.now();

        // Fill advanced stats object
        stats["calculationTime"] = Math.floor(endTime - startTime);
        stats["uniqueColors"] = uniqueColors;
        stats["consecutiveColor"] = consecutiveStat; // Meh, dunno about this
        stats["darkestColor"] = darkestStat
        stats["lightestColor"] = lightestStat;
        stats["topColorAppearances"] = topColors;
        stats["averageColor"] = average;

        return stats;
    }

    _updateFavicon() {

        const tempCanvas = document.createElement("canvas");
        const tempContext = tempCanvas.getContext("2d");
        const thumbImg = document.createElement('img');

        tempCanvas.width = this.FAVICON_SIZE;
        tempCanvas.height = this.FAVICON_SIZE;

        thumbImg.onload = () => {

            // Clip a circle and draw canvas image
            tempContext.beginPath();
            tempContext.arc(this.FAVICON_SIZE / 2, this.FAVICON_SIZE / 2,
                this.FAVICON_SIZE/2, 0, Math.PI * 2, true);
            tempContext.closePath();
            tempContext.clip();
            tempContext.drawImage(thumbImg, 0, 0,
                this.FAVICON_SIZE, this.FAVICON_SIZE);
            this.favicon.href = tempCanvas.toDataURL();
        }

        thumbImg.src = this.canvas.toDataURL();
    }

    /* Simple operation helpers */
    _rgbToNumber(rgb) {
        return rgb[0] * 65536 +
               rgb[1] * 256 + 
               rgb[2];
    }
    _rgbToHex(rgb) {
        let r = rgb[0].toString(16);
        let g = rgb[1].toString(16);
        let b = rgb[2].toString(16);
        return "#" + (r.length == 1 ? "0" + r : r) +
                     (g.length == 1 ? "0" + g : g) + 
                     (b.length == 1 ? "0" + b : b);
    }
    _numberToRGB(num) {
        return [num % 256,
                Math.floor(num / 256) % 256,
                Math.floor(num / 65536)];
    }
    _numberToHex(num) {
        return `#${("000000" + parseInt(num).toString(16)).slice(-6)}`;
    }

    _getRandomInt(n1, n2) {
        return Math.floor(Math.random() *
            (Math.abs(n1 - n2) + 1)) + Math.min(n1, n2); 
    }

    _getRandomKeyFromObject(object) {
        let keys = Object.keys(object);
        return keys[Math.floor(Math.random() * keys.length)];
    }

}

export default ArtManager;
