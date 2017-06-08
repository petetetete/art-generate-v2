onmessage = function(e) {
    var options = e.data;

    var colors = {
        warm: function() {
            return [getRandomInt(150, 255),
                    getRandomInt(0, 100),
                    getRandomInt(0, 100)];
        }
    }

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

    postMessage(buffer);
}
