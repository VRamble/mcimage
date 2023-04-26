document.querySelector("#fileInput").addEventListener("change",testImage);

function putImage() {
    // getImageData is used to copy the pixels
    var imageData = context.getImageData(55, 50, 200, 100);
    console.log(imageData.data);
    context.putImageData(imageData, 55, 170);
}

function testImage(){
    var image = document.getElementById('output');
	image.src = URL.createObjectURL(event.target.files[0]);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    console.log(imgData);
};