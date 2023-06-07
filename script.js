
function draw() {
  const select = document.getElementById("methods")

  const image = new Image()
  image.CrossOrigin = "anonymous";
  image.src = "./imgSamples/Michelangelo's_David_-_63_grijswaarden.png"
  var imageData, data;
  const canvas = document.getElementById("canvas")
  const ctx = canvas.getContext("2d")

  image.addEventListener("load", () => {
    canvas.height = `${image.height}`;
    canvas.width = `${image.width}`;
    drawImage()

  })
  canvas.addEventListener("click", dither);

  function dither() {
    drawImage()
    data = imageData.data
    limX = imageData.width, limY = imageData.height;
    for (let y = 0; y < limY; y++) {
      for (let x = 0; x < limX; x++) {
        let i = (y * limX + x) * 4
        // I have the RGBA values. 
        // To monochrome
        let average = i == 0 ? Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3) : data[i]
        // compare to th0reshold
        let value = average > 127 ? 255 : 0
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        // calculate error
        let error = average - value;

        switch (select.value) {
          case "floyd":
            floydSteinberg(i, data, error)
            break;
          case "atkinson":
            atkinson(i, data, error)
            break;
          default:
            console.log("bad one chief")
            break;
        }
      }
    }

    ctx.putImageData(new ImageData(data, imageData.width, imageData.height), 0, 0)

    function floydSteinberg(i, nData, error) {
      // we essentially need to look at the pixel "underneath" this one, which means adding another limX to i
      let rightPixel = i + 4 < nData.length ? i + 4 : false;
      // now other operations are just adding more numbers to this. Fun. I'm sure we can do better
      let downPixel = i + limX * 4 < nData.length ? i + limX * 4 : false;
      let downLeftPixel = i + limX * 4 - 4
      let downRightPixel = i + limX * 4 + 4 < nData.length ? i + limX * 4 + 4 : false;
      // this is still... fucky. It clearly just wraps to the other side when we reach the right edge, 
      // which isn't an issue, but it risks overflow if we are in the bottom-most pixel row. 



      // if (i > 1000 & i < 4000)console.log(error)
      if (rightPixel) errorSpread(rightPixel, error, 7, 16)
      if (downPixel) errorSpread(downPixel, error, 5, 16)
      if (downRightPixel) errorSpread(downRightPixel, error, 1, 16)
      errorSpread(downLeftPixel, error, 3, 16)


    }
    function atkinson(i, nData, error) {
      let right1, right2, botleft, bot, botright, bot2;
      right1 = i + 4 < nData.length ? i + 4 : false;
      right2 = i + 8 < nData.length ? i + 8 : false;
      botleft = i + limX * 4 - 4
      bot = i + limX * 4
      botright = i + limX * 4 + 4 < nData.length ? i + limX * 4 + 4 : false
      bot2 = i + limX * 4 * 2 < nData.length ? i + limX * 4 * 2 : false

      if (right1) errorSpread(right1, error, 1, 8)
      if (right2) errorSpread(right2, error, 1, 8)
      if (botleft) errorSpread(botleft, error, 1, 8)
      if (bot) errorSpread(bot, error, 1, 8)
      if (botright) errorSpread(botright, error, 1, 8)
      if (bot2) errorSpread(bot2, error, 1, 8)
    }
    function errorSpread(pixel, error, errorQuoeficient, quantaSize) {
      let average = Math.floor((data[pixel] + data[pixel + 1] + data[pixel + 2]) / 3)

      data[pixel] = Math.floor((average + (error * errorQuoeficient / quantaSize)))
      data[pixel + 1] = Math.floor((average + (error * errorQuoeficient / quantaSize)))
      data[pixel + 2] = Math.floor((average + (error * errorQuoeficient / quantaSize)))
    }

    function drawImage() {
      ctx.drawImage(image, 0, 0)
      image.style.display = "none"
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }
  }
}