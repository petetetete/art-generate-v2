// Constants!
const FAVICON_SIZE = 256;
const INIT_PALETTE = "Random";
const INIT_ALGORITHM = "Standard";
const INIT_PIXELSIZE = 5;

const MATRIX_PROB = 0.15;
const SPARSE_PROB = 0.7;
const SMEAR_PROB = 0.9;
const LINE_PROB = 0.6;


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
    this.basicStats["pixelCount"] = (this.width * this.height) / (this.pixelSize * this.pixelSize);

    // Update favicon asynchronously
    setTimeout(this._updateFavicon.bind(this), 0);

    // Calculate stat return values
    let basic = this.basicStats;
    let advanced = new Promise((resolve) => {

        // Calculate and populate advanced stats
        if (this.advancedStatsEnabled) {
            setTimeout(() => {

                    let startTime = performance.now();
                    let allColors = {}

                    for (let i = 0; i < buffer.length; i += 4) {
                        let colorID = `${buffer[i]}|${buffer[i + 1]}|${buffer[i + 2]}`;
                        allColors[colorID] = 1 + (allColors[colorID] || 0);
                    }

                    let uniqueColors = Object.keys(allColors).length;
                    let endTime = performance.now();

                    this.advancedStats["advancedStatTime"] = Math.floor(endTime - startTime);
                    this.advancedStats["uniqueColors"] = uniqueColors;

                    resolve(this.advancedStats);

            }, 0);
        }
        else resolve(null);

    });

    return { basic, advanced };
}

ArtManager.prototype._updateFavicon = function() {

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = FAVICON_SIZE;
    tempCanvas.height = FAVICON_SIZE;
    const tempContext = tempCanvas.getContext("2d");

    let thumbImg = document.createElement('img');
    thumbImg.src = this.canvas.toDataURL();
    thumbImg.onload = () => {
        tempContext.beginPath();
        tempContext.arc(FAVICON_SIZE/2, FAVICON_SIZE/2, FAVICON_SIZE/2, 0, Math.PI * 2, true);
        tempContext.closePath();
        tempContext.clip();
        tempContext.drawImage(thumbImg, 0, 0, FAVICON_SIZE, FAVICON_SIZE);
        document.getElementById("favicon").href = tempCanvas.toDataURL();
    }

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
    }
}

ArtManager.prototype._algorithms = {
    "Standard": function() {

        let buffer = new Uint8Array(this.width * this.height * 4);

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color = this._palettes[this.palette]();

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

            let color = this._palettes[this.palette]();

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

            let color = this._palettes[this.palette]();

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

            let lineColor = this._palettes[this.palette]();

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color = (Math.random() < LINE_PROB) ? lineColor : this._palettes[this.palette]();

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

            let lineColor = this._palettes[this.palette]();

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < LINE_PROB) ? lineColor : this._palettes[this.palette]();

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
        let mainColor = this._palettes[this.palette]();

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < SPARSE_PROB) ? mainColor : this._palettes[this.palette]();

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
        let lastColor = this._palettes[this.palette]();

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < SMEAR_PROB) ? lastColor : lastColor = this._palettes[this.palette]();

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
        let lastColor = this._palettes[this.palette]();

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color = (Math.random() < SMEAR_PROB) ? lastColor : lastColor = this._palettes[this.palette]();

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
