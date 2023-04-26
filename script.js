document.querySelector("#fileInput").addEventListener("change",testImage);

var imgData;
var imgWidth;
var imgHeight;

function testImage(){
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    console.log('this function triggered!');
    var image = document.getElementById('output');
	image.src = URL.createObjectURL(event.target.files[0]);
    image.onload=function(){
        ctx.drawImage(image, 0, 0);
        ctx.canvas.width=image.width;
        ctx.canvas.height=image.height;
        imgWidth=image.width;
        imgHeight=image.height;
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        console.log(imgData);
        document.getElementById("height").innerHTML=imgHeight;
        document.getElementById("width").innerHTML=imgWidth;
    };
};