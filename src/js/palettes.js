// Color palette constants
const MATRIX_PROB = 0.35;
const MURICA_VARIANCE = 15;
const GOOGLE_VARIANCE = 20;

const palettes = {

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
    "Camouflage": function() {
        let options = [
            [96,68,57],
            [158,154,117],
            [28,34,46],
            [65,83,59],
            [85,72,64]
        ];

        return options[Math.floor(Math.random() * options.length)];
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

export default palettes;
