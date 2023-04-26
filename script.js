//document.querySelector("#fileInput").addEventListener("change",paintImage);

function initContext(canvasID, contextType)
{
   var canvas = document.getElementById(canvasID);
   var context = canvas.getContext(contextType);
   return context;
}

function loadImage(imageSource, context)
{
    var imageObj = new Image();
    imageObj.onload = function()
    {
        context.drawImage(imageObj, 0, 0);
        var imageData = context.getImageData(0,0,10,10);
        readImage(imageData);
    };
    imageObj.src = imageSource;
    return imageObj;
}

function readImage(imageData)
{
    console.log();
    console.log(imageData.data[0]);
}

var context = initContext('canvas','2d');
var imageObj = loadImage('red.jpg',context)