function draw() {
  const image = new Image()
  image.CrossOrigin = "anonymous";
  image.src = ".imgSamples/04049-Stunning-Marble-Bust-of-Greek-God-Apollo-11.jpg"
  var imageData, data; 
  const canvas = document.getElementById("canvas")
  canvas.height = `${image.height}`;
  canvas.width = `${image.width}`;
  const ctx = canvas.getContext("2d")
  
  image.addEventListener("load", () => {  
    ctx.drawImage(image, 0, 0)
    image.style.display  = "none"
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    data = imageData.data
  })  

  
  function dither() { 
  for (let y = 0, limY = imageData.height; y < limY; y++) { 
    for (let x = 0, limX = imageData.width; x < limX; x++) { 
      let i = (y * limX + x) * 4 
      // I have the RGBA values. 
      // To monochrome
      let average = i == 0 ? Math.floor((data[i]+data[i+1]+data[i+2])/3) : data[i]
      // compare to th0reshold
      let value = average > 127 ? 255 : 0
      data[i]   = value
      data[i+1] = value
      data[i+2] = value
      // calculate error
      let error = average - value;  
      // spread errors. On the implementation I saw they create an array to keep track of the errors, 
      // and the pixels can refer to that array when writing their own values, and when writing the errors
      // to its neighbouring pixels. Otherwise we need to look at the other's pixels' values when spreading
      // the error from this one, which can end up quite lengthy. - it doesn't, I had just forgotten that 
      // global variables were a thing. Oops

      // we essentially need to look at the pixel "underneath" this one, which means adding another limX to i
      let rightPixel = i + 4 < data.length ? i + 4 : false; 
      // now other operations are just adding more numbers to this. Fun. I'm sure we can do better
      let downPixel = i + limX < data.length ? i + limX : false;
      let downLeftPixel = i + limX - 4  
      let downRightPixel = i + limX + 4 < data.length ? i + limX + 4  : false;
      // this is still... fucky. It clearly just wraps to the other side when we reach the right edge, 
      // which isn't an issue, but it risks overflow if we are in the bottom-most pixel row. 
      
      
      
      // if (i > 1000 & i < 4000)console.log(error)
      if (rightPixel)     errorSpread(rightPixel, error, 7)
      if (downPixel)      errorSpread(downPixel, error, 5)
      if (downRightPixel) errorSpread(downRightPixel, error, 1)
      errorSpread(downLeftPixel, error, 3)

      
      
    }
  }

  function errorSpread(pixel, error, errorQuoeficient) { 
    let average = Math.floor((data[pixel] + data[pixel + 1] + data[pixel + 2])/3)
    // console.log(average)
    data[pixel]     = Math.floor((average + (error * errorQuoeficient/16)))
    data[pixel + 1] = Math.floor((average + (error * errorQuoeficient/16)))
    data[pixel + 2] = Math.floor((average + (error * errorQuoeficient/16)))
  }

  imageData.data = data
  ctx.putImageData(imageData, 0, 0)
  }
canvas.addEventListener("click", dither);

}
  // const hoveredColor = document.getElementById("hovered-color")
  // const selectedColor = document.getElementById("selected-color")

  // function pick(event, destination) 
  // {
  //   const bounding = canvas.getBoundingClientRect()
  //   const x = event.clientX - bounding.left
  //   const y = event.clientY - bounding.top
  //   const pixel = ctx.getImageData(x, y, 1, 1)
  //   const data = pixel.data

  //   const rgba = `rgba(${255 - data[0]}, ${255 - data[1]}, ${255 - data[2]}, ${data[3] / 255})`;
  //   destination.style.background = rgba;
  //   destination.textContent = rgba

  //   return rgba
  // }

  // canvas.addEventListener("mousemove", (event) => pick(event, hoveredColor))
