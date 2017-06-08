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

function ArtManager(canvas, width = 500, height = 500) {
    canvas.width = width;
    canvas.height = height;

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.width = width;
    this.height = height;
    this.palette = "cool";
    this.algorithm = "standard";
    this.pixelSize = 1;

    this.stats = {};
}

/* Setters */
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

ArtManager.prototype.generate = function() {

    // Initialize stats
    this.stats["pixelCount"] = 0;
    this.stats["elapsedTime"] = 0;
    this.stats["uniqueColors"] = 0;

    // Stat tracking variables
    let startTime = performance.now();
    let uniqueColors = 0;

    // Populate buffer with colors
    /*let buffer = this._algorithms[this.algorithm]();*/
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


    // Load buffer data onto canvas
    let imgData = this.context.createImageData(this.width, this.height);
    imgData.data.set(buffer);
    this.context.putImageData(imgData, 0, 0);

    // Calculate stats
    let endTime = performance.now();
    let allColors = {}
    for (let i = 0; i < buffer.length; i += 4) {
        let colorID = `${buffer[i]}|${buffer[i + 1]}|${buffer[i + 2]}`;
        
        /*if (allColors[colorID]) {
            allColors[colorID]++;
        }
        else {
            allColors[colorID] = 1;
            uniqueColors++;
        }*/

        /*allColors[colorID] = 1 + (allColors[colorID] || 0);*/
        allColors[colorID] = 1 + (allColors[colorID] || 0);
    }

    // Fill stats object
    this.stats.pixelCount = (this.width * this.height) / (this.pixelSize * this.pixelSize);
    this.stats.elapsedTime = Math.floor(endTime - startTime);
    this.stats.uniqueColors = uniqueColors;

}

ArtManager.prototype._palettes = {
    warm: function() {
        return [getRandomInt(150, 255),
                getRandomInt(0, 100),
                getRandomInt(0, 100)];
    },
    cool: function() {
        return [getRandomInt(0, 80),
                getRandomInt(0, 80),
                getRandomInt(150, 220)];
    },
    natural: function() {
        return [getRandomInt(25, 100),
                getRandomInt(80, 180),
                getRandomInt(25, 100)];
    }
}

/*ArtManager.prototype._algorithms = {
    standard: function() {

        console.log("this.palette", this.palette);

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
    horizontal: function() {

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
    vertical: function() {

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
    }
}*/


var perfTests = []; // TESTING

var app = new ArtManager(document.getElementById("canvas"), 1000, 1000);

var button = document.getElementById("draw");
var width = document.getElementById("width");
var height = document.getElementById("height");
var pixel = document.getElementById("pixel");
var palette = document.getElementById("palette");

button.onclick = function() {
    var t1 = performance.now(); // TESTING
    app.generate();
    var t2 = performance.now(); // TESTING
    document.getElementById("time").innerText = `${Math.round(t2 - t1)}ms`; // TESTING
    perfTests.push(t2 - t1); // TESTING
}

width.onchange = (e) => app.setWidth(e.target.value);
height.onchange = (e) => app.setHeight(e.target.value);
pixel.onchange = (e) => app.setPixelSize(e.target.value);
palette.onchange = (e) => app.setPalette(e.target.value);
