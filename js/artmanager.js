// Constants!
const FAVICON_SIZE = 256;
const INIT_PIXELSIZE = 4;
const INIT_PALETTE = "Random";
const INIT_ALGORITHM = "Standard";
const TOP_COLOR_COUNT_MAX = 5;

// Color palette constants
const MATRIX_PROB = 0.18;
const MURICA_VARIANCE = 15;
const GOOGLE_VARIANCE = 20;

const RED_PRIME = 62287637;
const GREEN_PRIME = 74306387;
const BLUE_PRIME = 19392253;

// Algorithm constants
const SPARSE_PROB = 0.7;
const SMEAR_PROB = 0.9;
const SMEAR_PROB_ADJUST = 0.08;
const LINE_PROB = 0.6;
const TEAR_PROB = 0.96;
const PLAID_PROB = 0.85;
const PLAID_MIN_THICK = 2;
const PLAID_MAX_THICK = 5;
const PLAID_MIN_GAP = 6;


function ArtManager(canvas, favicon = null) {

    // Initialize object variables
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.favicon = favicon;
    this.generatedImage = null;

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    this.palette = INIT_PALETTE;
    this.algorithm = INIT_ALGORITHM;
    this.pixelSize = INIT_PIXELSIZE;

    this.basicStats = {};
    this.advancedStats = {};

    this.advancedStatsEnabled = true;

    this._timesGenerated = 0;
    this._generationTimes = [];
    this._getColor = this._palettes[INIT_PALETTE].bind(this);


    // Populate the palette of the day only once
    let date = new Date();
    let dailyNumber = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    let dailyNumber2 = date.getDate() * 1000000 + date.getFullYear() * 100 + (date.getMonth() + 1);

    let red1 = RED_PRIME * dailyNumber % 256,
        red2 = RED_PRIME * dailyNumber2 % 256,
        green1 = GREEN_PRIME * dailyNumber % 256,
        green2 = GREEN_PRIME * dailyNumber2 % 256,
        blue1 = BLUE_PRIME * dailyNumber % 256,
        blue2 = BLUE_PRIME * dailyNumber2 % 256;

    this._palettes["Of the Day!"] = function() {
        return [this._getRandomInt(red1, red2),
                this._getRandomInt(green1, green2),
                this._getRandomInt(blue1, blue2)];
    }
}

/* Getters */
ArtManager.prototype.getWidth = function() { return this.width }
ArtManager.prototype.getHeight = function() { return this.height }
ArtManager.prototype.getPixelSize = function() { return this.pixelSize }
ArtManager.prototype.getPalette = function() { return this.palette }
ArtManager.prototype.getAlgorithm = function() { return this.algorithm }
ArtManager.prototype.getAdvancedStatsEnabled = function() { return this.advancedStatsEnabled }

ArtManager.prototype.getPalettes = function() {
    return Object.keys(this._palettes);
}

ArtManager.prototype.getAlgorithms = function() {
    return Object.keys(this._algorithms);
}

/* Setters */
ArtManager.prototype.setWidth = function(width) {
    let calcWidth = Math.max(1, parseInt(width));

    this.canvas.width = calcWidth;
    this.width = calcWidth;
}

ArtManager.prototype.setHeight = function(height) {
    let calcHeight = Math.max(1, parseInt(height));

    this.canvas.height = calcHeight;
    this.height = calcHeight;
}

ArtManager.prototype.setPixelSize = function(size) {
    this.pixelSize = Math.max(1, parseInt(size));
}

ArtManager.prototype.setPalette = function(color) {
    this.palette = color;
    this._getColor = this._palettes[color].bind(this);
}

ArtManager.prototype.setAlgorithm = function(algorithm) {
    this.algorithm = algorithm;
}

ArtManager.prototype.setAdvancedStatsEnabled = function(advancedStatsEnabled) {
    this.advancedStatsEnabled = advancedStatsEnabled;
}


ArtManager.prototype.generate = function() {

    // Update widths
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    // Initialize basic stats
    this.basicStats = {};
    this.advancedStats = {};

    // Stat tracking variables
    let pixelCount = (this.width * this.height) / (this.pixelSize * this.pixelSize);
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
    // TODO: Consider calculating this without a reduce because reduce is slow
    this.basicStats["averageGenerationTime"]
        = Math.floor(this._generationTimes.reduce((a, b) => a + b) / this._generationTimes.length);
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
                this.advancedStats = this._generateAdvancedStats.bind(this)(buffer);
                resolve(this.advancedStats);
            }, 0);
        }
        else resolve(null);

    });

    return { basic, advanced };
}

ArtManager.prototype._generateAdvancedStats = function(buffer) {

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
            if (red == lastColor[0] && green == lastColor[1] && blue == lastColor[2]) {
                consecutiveStreak += 1;
            }
            else if (consecutiveStreak > consecutive.count) {
                consecutive.color[0] = red, consecutive.color[1] = green, consecutive.color[2] = blue;
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
                darkest.color[0] = red, darkest.color[1] = green, darkest.color[2] = blue;
            }
            if (colorValue > lightest.value) {
                lightest.value = colorValue;
                lightest.color[0] = red, lightest.color[1] = green, lightest.color[2] = blue;
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
    let sortedColors = Object.keys(allColors).sort(function(a, b) {return -(allColors[a] - allColors[b])});
    let topColors = sortedColors.slice(0, TOP_COLOR_COUNT_MAX).map((color) => {
        return {
            rgb: this._numberToRGB(color),
            hex: this._numberToHex(color),
            count: allColors[color]
        };
    });

    // Calculate the average color with the densities
    let averageColor = [Math.round(densityTotals[0] / this.basicStats.pixelCount),
                        Math.round(densityTotals[1] / this.basicStats.pixelCount),
                        Math.round(densityTotals[2] / this.basicStats.pixelCount)];
    let average = {
        rgb: averageColor,
        hex: this._rgbToHex(averageColor)
    };


    let endTime = performance.now();

    // Fill advanced stats object
    stats["calculationTime"] = Math.floor(endTime - startTime);
    stats["uniqueColors"] = uniqueColors;
    stats["consecutiveColor"] = consecutiveStat; // Meh, dunno if this is a good stat
    stats["darkestColor"] = darkestStat
    stats["lightestColor"] = lightestStat;
    stats["topColorAppearances"] = topColors;
    stats["averageColor"] = average;

    return stats;

}

ArtManager.prototype._updateFavicon = function() {

    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    const thumbImg = document.createElement('img');

    tempCanvas.width = FAVICON_SIZE;
    tempCanvas.height = FAVICON_SIZE;

    thumbImg.onload = () => {

        // Clip a circle and draw canvas image
        tempContext.beginPath();
        tempContext.arc(FAVICON_SIZE/2, FAVICON_SIZE/2, FAVICON_SIZE/2, 0, Math.PI * 2, true);
        tempContext.closePath();
        tempContext.clip();
        tempContext.drawImage(thumbImg, 0, 0, FAVICON_SIZE, FAVICON_SIZE);
        this.favicon.href = tempCanvas.toDataURL();

    }

    thumbImg.src = this.canvas.toDataURL();

}

/* Simple operation helpers */
ArtManager.prototype._rgbToNumber = function(rgb) {
    return rgb[0] * 65536 +
           rgb[1] * 256 + 
           rgb[2];
}
ArtManager.prototype._rgbToHex = function(rgb) {
    let r = rgb[0].toString(16);
    let g = rgb[1].toString(16);
    let b = rgb[2].toString(16);
    return "#" + (r.length == 1 ? "0" + r : r) +
                 (g.length == 1 ? "0" + g : g) + 
                 (b.length == 1 ? "0" + b : b);
}
ArtManager.prototype._numberToRGB = function(num) {
    return [num % 256,
            Math.floor(num / 256) % 256,
            Math.floor(num / 65536)];
}
ArtManager.prototype._numberToHex = function(num) {
    return `#${("000000" + parseInt(num).toString(16)).slice(-6)}`;
}

ArtManager.prototype._getRandomInt = function(n1, n2) {
    return Math.floor(Math.random() * (Math.abs(n1 - n2) + 1)) + Math.min(n1, n2); 
}

/* ArtManager object options */
ArtManager.prototype._palettes = {
    "Random": function() {
        return [this._getRandomInt(0, 255),
                this._getRandomInt(0, 255),
                this._getRandomInt(0, 255)];
    },
    "Warm": function() {
        return [this._getRandomInt(150, 255),
                this._getRandomInt(0, 100),
                this._getRandomInt(0, 100)];
    },
    "Cool": function() {
        return [this._getRandomInt(0, 125),
                this._getRandomInt(0, 125),
                this._getRandomInt(150, 255)];
    },
    "Nature": function() {
        return [this._getRandomInt(40, 120),
                this._getRandomInt(100, 200),
                this._getRandomInt(40, 120)];
    },
    "Matrix": function() {
        return [0, (Math.random() < MATRIX_PROB) ? this._getRandomInt(160, 220) : 0, 0];
    },
    "Black & White": function() {
        let shade = this._getRandomInt(0, 255);
        return [shade, shade, shade];
    },
    "Rainbow": function() {
        let options = [
            [248,12,18],
            [238,17,0],
            [255,51,27],
            [255,68,34],
            [255,102,68],
            [255,153,51],
            [254,174,45],
            [204,187,51],
            [208,195,16],
            [170,204,34],
            [105,208,37],
            [34,204,170],
            [18,204,170],
            [17,170,187],
            [68,68,221],
            [51,17,187],
            [59,12,189],
            [68,34,153]
        ];
        return options[Math.floor(Math.random() * options.length)];
    },
    "'Murica": function() {
        let options = [
            [191,10,48],
            [0,40,104],
            [255,255,255]
        ];

        let selected = options[Math.floor(Math.random() * options.length)];
        let rVariance = Math.floor(Math.random() * MURICA_VARIANCE * 2 - MURICA_VARIANCE);
        let gVariance = Math.floor(Math.random() * MURICA_VARIANCE * 2 - MURICA_VARIANCE);
        let bVariance = Math.floor(Math.random() * MURICA_VARIANCE * 2 - MURICA_VARIANCE);

        return [Math.max(0, Math.min(selected[0] + rVariance, 255)),
                Math.max(0, Math.min(selected[1] + gVariance, 255)),
                Math.max(0, Math.min(selected[2] + bVariance, 255))];
    },
    "Google": function() {
        let options = [
            [60,186,84],
            [244,194,13],
            [219,50,54],
            [72, 133, 237]
        ];

        let selected = options[Math.floor(Math.random() * options.length)];
        let rVariance = Math.floor(Math.random() * GOOGLE_VARIANCE * 2 - GOOGLE_VARIANCE);
        let gVariance = Math.floor(Math.random() * GOOGLE_VARIANCE * 2 - GOOGLE_VARIANCE);
        let bVariance = Math.floor(Math.random() * GOOGLE_VARIANCE * 2 - GOOGLE_VARIANCE);

        return [Math.max(0, Math.min(selected[0] + rVariance, 255)),
                Math.max(0, Math.min(selected[1] + gVariance, 255)),
                Math.max(0, Math.min(selected[2] + bVariance, 255))];
    },
    "Of the Day!": null // Will be populated by the constructor
}

ArtManager.prototype._algorithms = {
    "Standard": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color = this._getColor();

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }

        }

        return buffer;
    },
    "Horizontal": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            let color = this._getColor();

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }
        }

        return buffer;
    },
    "Vertical": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            let color = this._getColor();

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }
        }

        return buffer;
    },
    "Horizontal (variance)": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            let lineColor = this._getColor();

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color = (Math.random() < LINE_PROB) ? lineColor : this._getColor();

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }
        }

        return buffer;
    },
    "Vertical (variance)": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            let lineColor = this._getColor();

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < LINE_PROB) ? lineColor : this._getColor();

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }
        }

        return buffer;
    },
    "Sparse": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);
        let mainColor = this._getColor();

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < SPARSE_PROB) ? mainColor : this._getColor();

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }
        }

        return buffer;
    },
    "Winds": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);
        let lastColor = this._getColor();

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color = (Math.random() < SMEAR_PROB + SMEAR_PROB_ADJUST / this.pixelSize) ? lastColor : lastColor = this._getColor();

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }
        }

        return buffer;
    },
    "Smear": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);
        let lastColor = this._getColor();

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < SMEAR_PROB + SMEAR_PROB_ADJUST / this.pixelSize) ? lastColor : lastColor = this._getColor();

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }
        }

        return buffer;
    },
    "Cascade": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color;
                let random = Math.random();
                let aboveColor;
                let leftColor;

                // Find the colors above and to the left of the current point
                if (y > 0) {
                    let start = ((y - 1) * this.width + x) * 4;
                    aboveColor = [buffer[start], buffer[start + 1], buffer[start + 2]];
                }
                if (x > 0) {
                    let start = (y * this.width + (x - 1)) * 4;
                    leftColor = [buffer[start], buffer[start + 1], buffer[start + 2]];
                }

                // Randomly determine which color to select
                if (random < TEAR_PROB / 2) {
                    color = aboveColor || leftColor || this._getColor();
                }
                else if (random < TEAR_PROB) {
                    color = leftColor || aboveColor || this._getColor();
                }
                else {
                    color = this._getColor();
                }

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }
        }

        return buffer;
    },
    "Plaid": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);

        // The main background color of the plaid pattern
        let mainColor = this._getColor();
        let currLineColor;
        let horizontalPattern = [];

        let xLineGap = 0;
        let xThickness = 0;

        let yLineGap = 0;
        let yThickness = 0;


        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            // Only generate a new color if the line gap and mathematical gods allow it
            if (yThickness == 0 && yLineGap == 0 && Math.random() >= PLAID_PROB) {
                currLineColor = this._getColor();
                yThickness = Math.round(Math.random() * (PLAID_MAX_THICK - PLAID_MIN_THICK)) + PLAID_MIN_THICK;
                yLineGap = PLAID_MIN_GAP;
            }

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color;

                // If on the first horizontal line, generate the main pattern
                if (y == 0) {

                    // If there is still thickness on the current line
                    if (xThickness > 0) {

                        // Find color to the left of the current point
                        let start = (y * this.width + (x - 1)) * 4;
                        color = [buffer[start], buffer[start + 1], buffer[start + 2]];
                        xThickness -= 1;
                    }

                    // If we are no longer rendering the required thickness
                    else {

                        // If line gap is to be respected, decrement it
                        if (xLineGap > 0) xLineGap -= 1;

                        // Only generate a new color if the line gap and mathematical gods allow it
                        if (xLineGap == 0 && Math.random() >= PLAID_PROB) {
                            color = this._getColor();
                            xThickness = Math.round(Math.random() * (PLAID_MAX_THICK - PLAID_MIN_THICK)) + PLAID_MIN_THICK;
                            xLineGap = PLAID_MIN_GAP;
                        }
                        else {
                            color = mainColor;
                        }
                    }

                    horizontalPattern.push(color);
                }

                // If we are on all subsequent lines
                else {

                    // If there is y thickness to render
                    if (yThickness > 0) {

                        let currPatternColor = horizontalPattern[x/this.pixelSize];

                        // If we need to average the non-main line colors
                        if (currPatternColor != mainColor) {
                            color = [Math.floor((currPatternColor[0] + currLineColor[0]) / 2),
                                     Math.floor((currPatternColor[1] + currLineColor[1]) / 2),
                                     Math.floor((currPatternColor[2] + currLineColor[2]) / 2)]
                        }

                        // Simply use the current line color
                        else {
                            color = currLineColor;
                        }
                    }

                    // Otherwise simply render the main horizontal pattern
                    else {
                        color = horizontalPattern[x/this.pixelSize];
                    }
                }

                let yMax = Math.min(y + this.pixelSize, this.height);
                let xMax = Math.min(x + this.pixelSize, this.width);

                for (let py = y; py < yMax; py++) {
                    for (let px = x; px < xMax; px++) {

                        let pos = (py * this.width + px) * 4;

                        buffer[pos] = color[0];
                        buffer[pos + 1] = color[1];
                        buffer[pos + 2] = color[2];
                        buffer[pos + 3] = 255;
                    }
                }
            }

            // Decrement y tracking variables
            if (yThickness > 0) yThickness -= 1;
            else if (yLineGap > 0) yLineGap -= 1;
        }

        return buffer;
    }
}
