const algorithms = {

    "Standard": function() {

        const buffer = new Uint8Array(this.width * this.height * 4);

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

        const buffer = new Uint8Array(this.width * this.height * 4);

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

        const buffer = new Uint8Array(this.width * this.height * 4);

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

        const buffer = new Uint8Array(this.width * this.height * 4);

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            let lineColor = this._getColor();

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color = (Math.random() < this.LINE_PROB) ? lineColor : this._getColor();

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

        const buffer = new Uint8Array(this.width * this.height * 4);

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            let lineColor = this._getColor();

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < this.LINE_PROB) ? lineColor : this._getColor();

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

        const buffer = new Uint8Array(this.width * this.height * 4);
        const mainColor = this._getColor();

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < this.SPARSE_PROB) ? mainColor : this._getColor();

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

        const buffer = new Uint8Array(this.width * this.height * 4);
        
        let lastColor = this._getColor();

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let color = (Math.random() < this.SMEAR_PROB + this.SMEAR_PROB_ADJUST / this.pixelSize) ? lastColor : lastColor = this._getColor();

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

        const buffer = new Uint8Array(this.width * this.height * 4);
        
        let lastColor = this._getColor();

        for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

            for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

                let color = (Math.random() < this.SMEAR_PROB + this.SMEAR_PROB_ADJUST / this.pixelSize) ? lastColor : lastColor = this._getColor();

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

        const buffer = new Uint8Array(this.width * this.height * 4);

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
                if (random < (this.CASCADE_PROB + this.CASCADE_PROB_ADJUST / this.pixelSize) / 2) {
                    color = aboveColor || leftColor || this._getColor();
                }
                else if (random < (this.CASCADE_PROB + this.CASCADE_PROB_ADJUST / this.pixelSize)) {
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

        const buffer = new Uint8Array(this.width * this.height * 4);
        const mainColor = this._getColor();  // Main background color

        let currLineColor;
        let horizontalPattern = [];

        let xLineGap = 0;
        let xThickness = 0;

        let yLineGap = 0;
        let yThickness = 0;


        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            // Only generate a new color if the line gap and mathematical gods allow it
            if (yThickness == 0 && yLineGap == 0 && Math.random() < this.PLAID_PROB) {
                currLineColor = this._getColor();
                yThickness = Math.round(Math.random() * (this.PLAID_MAX_THICK - this.PLAID_MIN_THICK)) + this.PLAID_MIN_THICK;
                yLineGap = this.PLAID_MIN_GAP;
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
                        if (xLineGap == 0 && Math.random() < this.PLAID_PROB) {
                            let tempColor = this._getColor();
                            color = [Math.floor(mainColor[0] * (1 - this.PLAID_OPACITY) + tempColor[0] * this.PLAID_OPACITY),
                                     Math.floor(mainColor[1] * (1 - this.PLAID_OPACITY) + tempColor[1] * this.PLAID_OPACITY),
                                     Math.floor(mainColor[2] * (1 - this.PLAID_OPACITY) + tempColor[2] * this.PLAID_OPACITY)]
                            xThickness = Math.round(Math.random() * (this.PLAID_MAX_THICK - this.PLAID_MIN_THICK)) + this.PLAID_MIN_THICK;
                            xLineGap = this.PLAID_MIN_GAP;
                        }
                        else {
                            color = mainColor;
                        }
                    }

                    horizontalPattern.push(color);
                }

                // If we are on all subsequent lines
                else {

                    // If there is y thickness to render and our line isn't the main color
                    if (yThickness > 0 &&
                        currLineColor[0] != mainColor[0] &&
                        currLineColor[1] != mainColor[1] &&
                        currLineColor[2] != mainColor[2]) {

                        let currPatternColor = horizontalPattern[x / this.pixelSize];

                        color = [Math.floor(currPatternColor[0] * (1 - this.PLAID_OPACITY) + currLineColor[0] * this.PLAID_OPACITY),
                                 Math.floor(currPatternColor[1] * (1 - this.PLAID_OPACITY) + currLineColor[1] * this.PLAID_OPACITY),
                                 Math.floor(currPatternColor[2] * (1 - this.PLAID_OPACITY) + currLineColor[2] * this.PLAID_OPACITY)]
                    }

                    // Otherwise simply render the main horizontal pattern
                    else {
                        color = horizontalPattern[x / this.pixelSize];
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
    },

    "Rings": function() {

        const buffer = new Uint8Array(this.width * this.height * 4);
        const rings = new Array(Math.floor(this.width / this.pixelSize));

        for (let y = 0, h = this.height; y < h; y += this.pixelSize) {

            for (let x = 0, w = this.width; x < w; x += this.pixelSize) {

                let realX = (x - this.width / 2) / this.pixelSize;
                let realY = (y - this.height / 2) / this.pixelSize;
                let ring = Math.floor(Math.sqrt(realX*realX + realY*realY));

                let color = rings[ring];
                if (!color) {
                    rings[ring] = color = this._getColor();
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
    }
}

export default algorithms;
