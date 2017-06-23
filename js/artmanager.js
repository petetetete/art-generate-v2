// Constants!
const FAVICON_SIZE = 256;
const INIT_PALETTE = "Random";
const INIT_ALGORITHM = "Standard";
const INIT_PIXELSIZE = 10;

const MATRIX_PROB = 0.18;
const SPARSE_PROB = 0.7;
const SMEAR_PROB = 0.9;
const LINE_PROB = 0.6;

const RED_PRIME = 62287637;
const GREEN_PRIME = 74306387;
const BLUE_PRIME = 19392253;

const TOP_COLOR_COUNT_MAX = 3;


function ArtManager(canvas) {

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.generatedImage = null;

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    this.palette = INIT_PALETTE;
    this.algorithm = INIT_ALGORITHM;
    this.pixelSize = INIT_PIXELSIZE;

    this.basicStats = {};
    this.advancedStats = {};

    this.advancedStatsEnabled = true;
    this._getColor = this._palettes[INIT_PALETTE];


    // Populate the palette of the day only once
    let date = new Date();
    let dailyNumber = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    let rMin = RED_PRIME * dailyNumber % 128;
    let rMax = rMin + 128;

    let gMin = GREEN_PRIME * dailyNumber % 128;
    let gMax = gMin + 128;

    let bMin = BLUE_PRIME * dailyNumber % 128;
    let bMax = bMin + 128;

    this._palettes["Of the Day!"] = function() {
        return [getRandomInt(rMin, rMax),
                getRandomInt(gMin, gMax),
                getRandomInt(bMin, bMax)];
    }
}

// Getters
ArtManager.prototype.getWidth = function() { return this.width }
ArtManager.prototype.getHeight = function() { return this.height }
ArtManager.prototype.getPixelSize = function() { return this.pixelSize }
ArtManager.prototype.getPalette = function() { return this.palette }
ArtManager.prototype.getAlgorithm = function() { return this.algorithm }

ArtManager.prototype.getPalettes = function() {
    return Object.keys(this._palettes);
}

ArtManager.prototype.getAlgorithms = function() {
    return Object.keys(this._algorithms);
}

// Setters
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
    this._getColor = this._palettes[color];
}

ArtManager.prototype.setAlgorithm = function(algorithm) {
    this.algorithm = algorithm;
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

    this.basicStats["basicGenTime"] = Math.floor(endTime - startTime);
    this.basicStats["pixelCount"] = Math.round(pixelCount * 100) / 100;

    // Update favicon asynchronously
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

    const stats = {
        advancedStatTime: null,
        uniqueColors: null,
        darkestColor: null,
        lightestColor: null,
        topColorAppearances: null
    };

    const allColors = new Object();
    let uniqueColors = 0;

    let darkestColor = [255, 255, 255];
    let darkestValue = 765;

    let lightestColor = [0, 0, 0];
    let lightestValue = 0;

    let top3Colors = {
        first: {
            count: 0,
            color: null
        },
        second: {
            count: 0,
            color: null
        },
        third: {
            count: 0,
            color: null
        }
    };

    /*for (let i = 0; i < this.height; i += this.pixelSize) {
        for (let j = 0, stepSize = 4 * this.pixelSize; j < this.width; j += stepSize) {
            let currentIndex = i * this.width + j;

            console.log(currentIndex);

        }
        if (i > 20) break;
    }*/

    for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            let pos = (y * this.width + x) * 4;
            let red = buffer[pos];
            let green = buffer[pos + 1];
            let blue = buffer[pos + 2];

            // Log all colors to a colors object
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
            if (colorValue < darkestValue) {
                darkestValue = colorValue;
                darkestColor = [red, green, blue];
            }
            if (colorValue > lightestValue) {
                lightestValue = colorValue;
                lightestColor = [red, green, blue];
            }

        }
    }

    logTest = allColors;

    let topColors = [];
    let sortedColors = Object.keys(allColors).sort(function(a, b) {return -(allColors[a] - allColors[b])});
    console.log("%cTop Color", "font-size: 20px; color: " + this._numberToHex(sortedColors[0]));

    for (let i = 0, total = Math.min(TOP_COLOR_COUNT_MAX, sortedColors.length); i < total; i++) {
        topColors.push({
            color: this._numberToHex(sortedColors[i]),
            count: allColors[sortedColors[i]]
        });
    }

    let endTime = performance.now();

    stats.advancedStatTime = Math.floor(endTime - startTime);
    stats.uniqueColors = uniqueColors;
    stats.darkestColor = darkestColor;
    stats.lightestColor = lightestColor;
    stats.topColorAppearances = topColors;

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
        document.getElementById("favicon").href = tempCanvas.toDataURL();

    }
    thumbImg.src = this.canvas.toDataURL();

}

ArtManager.prototype._rgbToNumber = function(rgb) {
    return rgb[0] * 65536 +
           rgb[1] * 256 + 
           rgb[2];
}
ArtManager.prototype._numberToRGB = function(num) {
    return [num % 256,
            Math.floor(num / 256) % 256,
            Math.floor(num / 65536)];
}
ArtManager.prototype._numberToHex = function(num) {
    return "#" + ("000000" + parseInt(num).toString(16)).slice(-6);
}

ArtManager.prototype._palettes = {
    "Random": function() {
        return [getRandomInt(0, 255),
                getRandomInt(0, 255),
                getRandomInt(0, 255)];
    },
    "Warm": function() {
        return [getRandomInt(150, 255),
                getRandomInt(0, 100),
                getRandomInt(0, 100)];
    },
    "Cool": function() {
        return [getRandomInt(0, 80),
                getRandomInt(0, 80),
                getRandomInt(150, 220)];
    },
    "Natural": function() {
        return [getRandomInt(25, 100),
                getRandomInt(80, 180),
                getRandomInt(25, 100)];
    },
    "Matrix": function() {
        return [0, (Math.random() < MATRIX_PROB) ? getRandomInt(160, 220) : 0, 0];
    },
    "Black & White": function() {
        let shade = getRandomInt(0, 255);
        return [shade, shade, shade];
    },
    "Rainbow": function() {
        options = [
            [255,0,0],
            [255,127,0],
            [255,255,0],
            [0,255,0],
            [0,0,255],
            [75,0,130],
            [139,0,255]
        ];
        return options[Math.floor(Math.random() * options.length)];
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
    "Smear": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);
        let lastColor = this._getColor();

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < SMEAR_PROB) ? lastColor : lastColor = this._getColor();

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

                let color = (Math.random() < SMEAR_PROB) ? lastColor : lastColor = this._getColor();

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
    }
}
