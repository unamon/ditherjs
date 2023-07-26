class ditherWorker {
    //TODO: ditherworker should receive an image and return a ditherized image? Or just the data? what does the canvas need to draw?
    //
    image;
    methodSelection;
    canvas;
    ctx;
    imageData;
    data;

    constructor(){  }
    // constructor(canvas, image, methodSelection) {
    //     console.log("created class")
    //     this.image = image;
    //     this.canvas = canvas;
    //     this.methodSelection = methodSelection;
    //     this.ctx = this.canvas.getContext("2d");

    //     this.image.CrossOrigin = "anonymous";
    //     this.image.display = "none";

    //     image.addEventListener("load", () => {
    //         this.canvas.height = `${image.height}`;
    //         this.canvas.width = `${image.width}`;
    //         this.drawImage();
    //     });
    // }

    set setCanvas(canvas) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d")
    }

    set setImage(image) {
        this.image = image;
        this.image.CrossOrigin = "anonymous";
        this.image.display = "none";
        if (this.canvas != null) { 
            image.addEventListener("load", () => {
                this.canvas.height = `${image.height}`;
                this.canvas.width = `${image.width}`;
                this.drawImage();
            });
        }
    }

    set setMethodSelection(method) {
        this.methodSelection = method
    }

    selectImageSrc(src) {
        console.log("selected image")
        this.image.src = src;
    }

    dither() {
        console.log("dithering")
        //currently only monochrome
        this.drawImage(); //We need to draw the image each time before we dither, so there's fresh image data to dither
        this.data = this.imageData.data;
        const limX = this.imageData.width;
        const limY = this.imageData.height;

        for (let y = 0; y < limY; y++) {
            //line by line loop
            for (let x = 0; x < limX; x++) {
                let i = (y * limX + x) * 4;
                // To monochrome
                let average =
                    i == 0
                        ? Math.floor(
                            (this.data[i] + this.data[i + 1] + this.data[i + 2]) / 3
                        )
                        : this.data[i];
                // compare to th0reshold
                let value = average > 127 ? 255 : 0;
                this.data[i] = value;
                this.data[i + 1] = value;
                this.data[i + 2] = value;
                // calculate error
                let error = average - value;

                switch (this.methodSelection.value) {
                    case "floyd":
                        this.floydSteinberg(i, this.data, error, limX);
                        break;
                    case "atkinson":
                        this.atkinson(i, this.data, error, limX);
                        break;
                    default:
                        throw new Error("Invalid dithering method selected");
                }
            }
        }

        this.image.data = this.data

        console.log(this.image.data)
    }

    floydSteinberg(i, nData, error, limX) {
        // we essentially need to look at the pixel "underneath" this one, which means adding another limX to i
        let rightPixel = i + 4 < nData.length ? i + 4 : false;
        // now other operations are just adding more numbers to this. Fun. I'm sure we can do better
        let downPixel = i + limX * 4 < nData.length ? i + limX * 4 : false;
        let downLeftPixel = i + limX * 4 - 4;
        let downRightPixel =
            i + limX * 4 + 4 < nData.length ? i + limX * 4 + 4 : false;
        // this is still... fucky. It clearly just wraps to the other side when we reach the right edge,
        // which isn't an issue, but it risks overflow if we are in the bottom-most pixel row.

        if (rightPixel) this.errorSpread(rightPixel, error, 7, 16);
        if (downPixel) this.errorSpread(downPixel, error, 5, 16);
        if (downRightPixel) this.errorSpread(downRightPixel, error, 1, 16);
        this.errorSpread(downLeftPixel, error, 3, 16);
    }

    JJN(i, nData, error, limX) {
        let r1, r2, l2b1, l1b1, b1, r1b1, r2b1, l2b2, l1b2, b2, r1b2, r2b2;
        r1 = i + 4 < nData.length ? i + 4 : false;
        r2 = i + 8 < nData.length ? i + 8 : false;
        l2b1 = i + limX * 4 - 8;
        l1b1 = i + limX * 4 - 4;
        b1 = i + limX * 4;
        r1b1 = i + limX * 4 + 4 < nData.length ? i + limX * 4 + 4 : false;
        r2b1 = i + limX * 4 + 8 < nData.length ? i + limX * 4 + 8 : false;
        l2b2 = i + limX * 4 * 2 - 8;
        l1b2 = i + limX * 4 * 2 - 4;
        b2 = i + limX * 4 * 2;
        r1b2 = i + limX * 4 + 2 + 4 < nData.length ? i + limX * 4 * 2 + 4 : false;
        r2b2 = i + limX * 4 + 2 + 8 < nData.length ? i + limX * 4 * 2 + 8 : false;

        if (r1) this.errorSpread(r1, error, 7, 48);
        if (r1) this.errorSpread(r1, error, 7, 48);
        if (r1) this.errorSpread(r1, error, 7, 48);
        if (r1) this.errorSpread(r1, error, 7, 48);
        if (r1) this.errorSpread(r1, error, 7, 48);
        if (r1) this.errorSpread(r1, error, 7, 48);
        if (r1) this.errorSpread(r1, error, 7, 48);
        if (r1) this.errorSpread(r1, error, 7, 48);
    }

    atkinson(i, nData, error, limX) {
        let right1, right2, botleft, bot, botright, bot2;
        right1 = i + 4 < nData.length ? i + 4 : false;
        right2 = i + 8 < nData.length ? i + 8 : false;
        botleft = i + limX * 4 - 4;
        bot = i + limX * 4;
        botright = i + limX * 4 + 4 < nData.length ? i + limX * 4 + 4 : false;
        bot2 = i + limX * 4 * 2 < nData.length ? i + limX * 4 * 2 : false;

        if (right1) this.errorSpread(right1, error, 1, 8);
        if (right2) this.errorSpread(right2, error, 1, 8);
        if (botleft) this.errorSpread(botleft, error, 1, 8);
        if (bot) this.errorSpread(bot, error, 1, 8);
        if (botright) this.errorSpread(botright, error, 1, 8);
        if (bot2) this.errorSpread(bot2, error, 1, 8);
    }

    errorSpread(pixel, error, errorQuoeficient, quantaSize) {
        let average = Math.floor(
            (this.data[pixel] + this.data[pixel + 1] + this.data[pixel + 2]) / 3
        );

        this.data[pixel] = Math.floor(
            average + (error * errorQuoeficient) / quantaSize
        );
        this.data[pixel + 1] = Math.floor(
            average + (error * errorQuoeficient) / quantaSize
        );
        this.data[pixel + 2] = Math.floor(
            average + (error * errorQuoeficient) / quantaSize
        );
    }

    drawImage() {
        //draws the image on the canvas
        this.ctx.drawImage(this.image, 0, 0);
        this.imageData = this.ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }
}

const dith = new ditherWorker()
const image = new Image();

function start() {
    const canvas = document.getElementById("canvas")
    const selectMethods = document.getElementById('methods')

    dith.setCanvas = canvas
    dith.setImage = image
    dith.setMethodSelection = selectMethods

    dith.selectImageSrc("./imgSamples/prismaticcomet_icon2.png")
}

function ditherProcessStart() {
    console.log("button pressed")
    image.data = dith.dither();
}

