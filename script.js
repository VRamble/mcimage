var imgWidth;
var imgHeight;
var pixels;
let blockData = [];
let blockNames = [];

function readTextFile() {
  fetch('blocks/blocknames.txt')
    .then(response => response.text())
    .then(data => {
      let lines = data.split('\n');
      let promises = lines.map(line => {
        let blockName = line.trim();
        let pngLoc = 'blocks/' + blockName;
        return getImageAverageColor(pngLoc)
          .then(colorValues => {
            let blockInfo = [blockName, ...colorValues];
            blockData.push(blockInfo);
          })
          .catch(error => {
            console.error('Error processing image:', error);
          });
      });

      Promise.all(promises)
        .then(() => {
          downloadTextFile(blockData);
        })
        .catch(error => {
          console.error('Error processing images:', error);
        });
    })
    .catch(error => {
      console.error('Error reading file:', error);
    });
}

function getImageAverageColor(filename) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = filename;

    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let rTotal = 0;
      let gTotal = 0;
      let bTotal = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        rTotal += r;
        gTotal += g;
        bTotal += b;
      }

      const numPixels = data.length / 4;
      const rAvg = Math.round(rTotal / numPixels);
      const gAvg = Math.round(gTotal / numPixels);
      const bAvg = Math.round(bTotal / numPixels);

      resolve([rAvg, gAvg, bAvg]);
    };

    img.onerror = function () {
      reject(new Error('Failed to load image: ' + filename));
    };
  });
}

function downloadTextFile(blockData) {
  let exportData = '';

  blockData.forEach(blockInfo => {
    line = '[\'' + blockInfo.join(',') + '],\n';
    line = line.replace(',', '\',');
    exportData += line;
  });

  const blob = new Blob([exportData], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'blocks.txt';
  link.click();
  URL.revokeObjectURL(url);
}

function readImageFile(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        imgWidth = img.width;
        imgHeight = img.height;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        pixels = [];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          pixels.push([r, g, b, a]);
        }

        // Display the image in the browser
        const imageContainer = document.getElementById("image-container");
        imageContainer.innerHTML = "";
        imageContainer.appendChild(img);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function processImage() {
  // Check if pixels is defined
  if (!pixels) {
    console.error("Pixels data is missing.");
    return;
  }

  // Create a new Web Worker
  const worker = new Worker("worker.js");

  worker.onmessage = function (e) {
    const { imageData } = e.data;

    // Display the processed image
    displayProcessedImage(imageData);

    // Clean up the worker
    worker.terminate();
  };

  // Send the pixels and avgColors data to the worker for processing
  worker.postMessage({ pixels, avgColors });
}

// worker.js
self.onmessage = function (e) {
  const { pixels, avgColors } = e.data;

  const imageData = processPixels(pixels, avgColors);

  self.postMessage({ imageData });
};

function processPixels(pixels, avgColors) {
  const imageData = [];

  for (let i = 0; i < pixels.length; i++) {
    const pixel = pixels[i];
    const bestDiff = findBestColorMatch(pixel, avgColors);
    imageData.push(bestDiff);
  }

  return imageData;
}

function findBestColorMatch(pixel, avgColors) {
  let bestDiff = Infinity;
  let bestIndex = 0;

  for (let i = 0; i < avgColors.length; i++) {
    const color = avgColors[i];
    const diff = Math.sqrt((color[1] - pixel[0]) ** 2 + (color[2] - pixel[1]) ** 2 + (color[3] - pixel[2]) ** 2);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  }

  return bestIndex;
}


function displayProcessedImage(imageData) {
  const container = document.getElementById("container");
  container.innerHTML = ""; // Clear the container before populating

  for (let c = 0; c < imgHeight * imgWidth; c++) {
    let cell = document.createElement("div");
    cell.className = "grid-item-" + c;
    container.appendChild(cell);
    pixel = imageData[c];

    let image = document.createElement("img");

    bestDiff = Math.sqrt((avgColors[0][1] - pixel[0]) ** 2 + (avgColors[0][2] - pixel[1]) ** 2 + (avgColors[0][3] - pixel[2]) ** 2);
    bestIndex = 0;
    for (let i = 0; i < 481; i++) {
      tempDiff = Math.sqrt((avgColors[i][1] - pixel[0]) ** 2 + (avgColors[i][2] - pixel[1]) ** 2 + (avgColors[i][3] - pixel[2]) ** 2);
      if (tempDiff < bestDiff) {
        bestDiff = tempDiff;
        bestIndex = i;
      }
    }

    image.src = 'blocks/' + avgColors[bestIndex][0];
    cell.appendChild(image);
  }
}

function populateGrid() {
  const container = document.getElementById("container");
  makeRows(imgHeight, imgWidth);
}

function makeRows(rows, cols) {
  const container = document.getElementById("container");
  container.style.setProperty("--grid-rows", rows);
  container.style.setProperty("--grid-cols", cols);

  container.innerHTML = ""; // Clear the container before populating

  for (let c = 0; c < rows * cols; c++) {
    let cell = document.createElement("div");
    cell.className = "grid-item-" + c;
    container.appendChild(cell);
    pixel = pixels[c];

    let image = document.createElement("img");

    bestDiff = Math.sqrt((avgColors[0][1] - pixel[0]) ** 2 + (avgColors[0][2] - pixel[1]) ** 2 + (avgColors[0][3] - pixel[2]) ** 2);
    bestIndex = 0;
    for (let i = 0; i < 481; i++) {
      tempDiff = Math.sqrt((avgColors[i][1] - pixel[0]) ** 2 + (avgColors[i][2] - pixel[1]) ** 2 + (avgColors[i][3] - pixel[2]) ** 2);
      if (tempDiff < bestDiff) {
        bestDiff = tempDiff;
        bestIndex = i;
      }
    }

    image.src = 'blocks/' + avgColors[bestIndex][0];
    cell.appendChild(image);
  }
}

function boundCheck(num) {
  if (num > 255)
    return 255;
  else if (num < 0)
    return 0;
  else
    return num;
}
