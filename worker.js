self.onmessage = function (e) {
  const { pixels, avgColors } = e.data;

  // Process the pixels data
  const processedData = processPixels(pixels, avgColors);

  // Send the processed data back to the main script
  self.postMessage({ imageData: processedData });
};

function processPixels(pixels, avgColors) {
  const imageData = [];

  for (let i = 0; i < pixels.length; i++) {
    const pixel = pixels[i];
    const bestDiff = findBestColorMatch(pixel);
    imageData.push(bestDiff);
  }

  return imageData;
}

function findBestColorMatch(pixel) {
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
