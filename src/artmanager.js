/*var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var button = document.getElementById("draw");

var options = {
    width: 500,
    height: 500,
    palette: "warm"
}

if (window.Worker) {
    var myWorker = new Worker("src/worker.js");

    button.onclick = function() {
        myWorker.postMessage(options);
    }

    myWorker.onmessage = function(e) {
        var imgData = ctx.createImageData(500, 500);
        imgData.data.set(e.data);
        ctx.putImageData(imgData, 0, 0);
    };
}

async function something() {

    var buffer = new Uint8ClampedArray(options.width * options.height * 4);

    for(var y = 0; y < options.height; y++) {
        for(var x = 0; x < options.width; x++) {

            var pos = (y * options.width + x) * 4;

            buffer[pos] = 255;
            buffer[pos + 1] = 0;
            buffer[pos + 2] = 0;
            buffer[pos + 3] = 255;
        }
    }

    return [3, 4, 5];
}*/


// Constants!
const INIT_PALETTE = "Random";
const INIT_ALGORITHM = "Standard";
const INIT_PIXELSIZE = 1;

const MATRIX_PROB = 0.15;
const SPARSE_PROB = 0.7;
const SMEAR_PROB = 0.9;
const LINE_PROB = 0.6;


function ArtManager(canvas, width = 500, height = 500) {
    canvas.width = width;
    canvas.height = height;

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.width = width;
    this.height = height;
    this.palette = INIT_PALETTE;
    this.algorithm = INIT_ALGORITHM;
    this.pixelSize = INIT_PIXELSIZE;

    this.stats = {};
    this.advancedStats = false;
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
    let calcWidth = parseInt(width);

    this.canvas.width = calcWidth;
    this.width = calcWidth;
}

ArtManager.prototype.setHeight = function(height) {
    let calcHeight = parseInt(height);

    this.canvas.height = calcHeight;
    this.height = calcHeight;
}

ArtManager.prototype.setPixelSize = function(size) {
    this.pixelSize = parseInt(size);
}

ArtManager.prototype.setPalette = function(color) {
    this.palette = color;
}

ArtManager.prototype.setAlgorithm = function(algorithm) {
    this.algorithm = algorithm;
}

ArtManager.prototype.generate = function() {

    // Initialize basic stats
    this.stats["basicGenTime"] = 0;
    this.stats["pixelCount"] = 0;

    // Initialize advanced stats
    this.stats["advancedStatTime"] = 0;
    this.stats["uniqueColors"] = 0;

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

    this.stats.basicGenTime = Math.floor(endTime - startTime);
    this.stats.pixelCount = (this.width * this.height) / (this.pixelSize * this.pixelSize);

    // Seperate advanced stats from the synchronous execution
    if (this.advancedStats) {
        setTimeout(() => {

            // Calculate and populate advanced stats
            let startTime = performance.now();
            let allColors = {}

            for (let i = 0; i < buffer.length; i += 4) {
                let colorID = `${buffer[i]}|${buffer[i + 1]}|${buffer[i + 2]}`;
                allColors[colorID] = 1 + (allColors[colorID] || 0);
            }

            let uniqueColors = Object.keys(allColors).length;
            let endTime = performance.now();

            this.stats.advancedStatTime = Math.floor(endTime - startTime);
            this.stats.uniqueColors = uniqueColors;

        }, 0);
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

        for (let y = 0; y < this.height; y += this.pixelSize) {

            for (let x = 0; x < this.width; x += this.pixelSize) {

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

        for (let y = 0; y < this.height; y += this.pixelSize) {

            let color = this._palettes[this.palette]();

            for (let x = 0; x < this.width; x += this.pixelSize) {

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

        for (let x = 0; x < this.width; x += this.pixelSize) {

            let color = this._palettes[this.palette]();

            for (let y = 0; y < this.height; y += this.pixelSize) {

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

        for (let y = 0; y < this.height; y += this.pixelSize) {

            let lineColor = this._palettes[this.palette]();

            for (let x = 0; x < this.width; x += this.pixelSize) {

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

        for (let x = 0; x < this.width; x += this.pixelSize) {

            let lineColor = this._palettes[this.palette]();

            for (let y = 0; y < this.height; y += this.pixelSize) {

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

        for (let x = 0; x < this.width; x += this.pixelSize) {

            for (let y = 0; y < this.height; y += this.pixelSize) {

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

        for (let x = 0; x < this.width; x += this.pixelSize) {

            for (let y = 0; y < this.height; y += this.pixelSize) {

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

        for (let y = 0; y < this.height; y += this.pixelSize) {

            for (let x = 0; x < this.width; x += this.pixelSize) {

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
