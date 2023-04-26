document.querySelector("#fileInput").addEventListener("change",testImage);

var imgData;
var imgWidth;
var imgHeight;

function testImage(){
    console.log('this function triggered!');
    var image = document.getElementById('output');
	image.src = URL.createObjectURL(event.target.files[0]);
    image.onload=function(){
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        imgWidth=image.width;
        imgHeight=image.height;
        imgData = ctx.getImageData(0, 0, imgHeight, imgWidth).data;
        console.log(imgData);
        document.getElementById("height").innerHTML=imgHeight;
        document.getElementById("width").innerHTML=imgWidth;
        //var idata = ctx.createImageData(imgWidth, imgHeight);
        //for(var i = 0; i < idata.data.length; i++) idata.data[i] = imgData[i];
        //ctx.putImageData(idata,0,0);
    };
};