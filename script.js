var imgWidth;
var imgHeight;
var pixels;
let blockData=[];
let blockNames=[];

function readTextFile() {
	// Create an empty array to store block names and color values
	let blockData = [];
  
	// Use the Fetch API to get the contents of the text file
	fetch('blocks/blocknames.txt')
	  .then(response => response.text())
	  .then(data => {
		// Split the text into an array of lines
		let lines = data.split('\n');
  
		// Loop through each line and process the block data
		let promises = lines.map(line => {
		  let blockName = line.trim(); // Remove any leading/trailing whitespace
		  let pngLoc = 'blocks/' + blockName;
		  return getImageAverageColor(pngLoc)
			.then(colorValues => {
			  // Store block name and color values into the array
			  let blockInfo = [blockName, ...colorValues];
			  blockData.push(blockInfo);
			})
			.catch(error => {
			  console.error('Error processing image:', error);
			});
		});
  
		// Wait for all promises to resolve
		Promise.all(promises)
		  .then(() => {
			// Generate and download the text file
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
  
	  img.onload = function() {
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
  
	  img.onerror = function() {
		reject(new Error('Failed to load image: ' + filename));
	  };
	});
  }
  
  function downloadTextFile(blockData) {
	let exportData = '';
  
	blockData.forEach(blockInfo => {
	  const line = blockInfo.join(',') + '\n';
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

function getImagePixelData(filename) {
	const img = new Image();
	img.src = filename;
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const results = [];
	
	img.onload = function() {
		canvas.width = img.width;
		canvas.height = img.height;
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
	
		const pixelData=[filename,rAvg,gAvg,bAvg,0,0,1];
		results.push(pixelData);
	};
	
	return results;
}
	

function readImageFile(input) {
	if (input.files && input.files[0]) {
		const reader = new FileReader();

		reader.onload = function (e) {
			const img = new Image();
			img.onload = function () {
				const canvas = document.createElement("canvas");
				canvas.width = img.width;
				imgWidth=img.width;
				imgHeight=img.height;
				canvas.height = img.height;

				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);

				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const data = imageData.data;

				pixels=[];

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

function displayContrast(cNum) {
	console.log(cNum);
	const canvas = document.createElement('canvas');
	canvas.width = imgWidth;
	canvas.height = imgHeight;
	const context = canvas.getContext('2d');

	const imageData = context.createImageData(imgWidth, imgHeight);
	const data = imageData.data;

	goodNum=Number(cNum);
	var F = (259 * (goodNum + 255)) / (255 * (259 - goodNum));
	console.log("F:", F);
	
	for (let i = 0; i < pixels.length; i++) {
		const pixel = pixels[i];
		data[i * 4] = boundCheck((F * (pixel[0]-128)+128)); // red
		data[i * 4 + 1] = boundCheck((F * (pixel[1]-128)+128)); // green
		data[i * 4 + 2] = boundCheck((F * (pixel[2]-128)+128)); // blue
		data[i * 4 + 3] = pixel[3]; // alpha
	}
	//console.log('here322');

	context.putImageData(imageData, 0, 0);

	const img = new Image();
	img.src = canvas.toDataURL();
	const imageContainer = document.getElementById("constrast-image-container");
	imageContainer.innerHTML = "";
	imageContainer.appendChild(img);
};

function displayColor(rNum,gNum,bNum) {
	//console.log(cNum);
	const canvas = document.createElement('canvas');
	canvas.width = 50;
	canvas.height = 50;
	const context = canvas.getContext('2d');

	const imageData = context.createImageData(50, 50);
	const data = imageData.data;
	
	for (let i = 0; i < 10000; i++) {
		//const pixel = pixels[i];
		data[i * 4] = rNum; // red
		data[i * 4 + 1] = gNum; // green
		data[i * 4 + 2] = bNum; // blue
		data[i * 4 + 3] = 255; // alpha
	}
	//console.log('here322');

	context.putImageData(imageData, 0, 0);

	const img = new Image();
	img.src = canvas.toDataURL();
	const imageContainer = document.getElementById("color-image-container");
	imageContainer.innerHTML = "";
	imageContainer.appendChild(img);
};

function boundCheck(num){
	if(num>255)
		return 255;
	else if(num<0)
		return 0;
	else
		return num;
}