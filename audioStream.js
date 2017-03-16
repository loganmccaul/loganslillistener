var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
var source;

navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream) {
  source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

}).catch(function(err) {
  console.error(err);
});

analyser.fftSize = 32;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
analyser.smoothingTimeConstant = .5;

// Get a canvas defined with ID "oscilloscope"
var canvasAverage = document.getElementById("average");
var avgCtx = canvasAverage.getContext("2d");

/* Canvas for normal display */
// var canvasIndividual = document.getElementById("individual");
// var indCtx = canvasIndividual.getContext("2d");

var ax = 0, ay = 0, ix = 1, iy = 0;
var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
// ax = WIDTH; Bars Across

canvasAverage.setAttribute('width', WIDTH);
canvasAverage.setAttribute('height', HEIGHT);


var PIXELSIZE = WIDTH/100; // Square sizes
PIXELSIZE = 10;
// var PIXELSIZE = 200; // Bars across

function color(data) {
  /* Shades of Teal */
  var start = 0x30CCC3;
  var end = 0x0C3331;

  /* Red Yellows and Blues */
  // var start = 0x3EC260;
  // var end = 0xFFA71F;

  var r = (start & 0xFF0000) * data + (end & 0xFF0000) * data;
  var g = (start & 0x00FF00) * data + (end & 0x00FF00) * data;
  var b = (start & 0x0000FF) * data + (end & 0x0000FF) * data;

  return `#${((r & 0xFF0000) + (g & 0x00FF00) + (b & 0x0000FF)).toString(16)}`;
}

var notes = []; // Array for bars

function draw() {

  drawVisual = requestAnimationFrame(draw);

  /* Background if notes saved in array */
  // avgCtx.fillStyle = 'black';
  // avgCtx.fillRect(0, 0, WIDTH, HEIGHT);

  analyser.getByteFrequencyData(dataArray);

  /* Gets total data value for 32 fft */
	var data = dataArray.reduce((a, b) => a + b) * .0003;
  if (data > 1) data = 1; // Max
  else if (data < 0) data = 0; // Min

 /* Squares: If off the page reset position */
	if (ax > WIDTH) {
		ax = 0;
		ay += PIXELSIZE;
	}
	if (ay > HEIGHT) {
		ay = 0;
	}


/* Saves not in array for bars */
 // notes.unshift({
 //    ax,
 //    ay,
 //    width: PIXELSIZE,
 //    height: HEIGHT,
 //    data
 //  });

  /* Removes nodes off the screen from the array of nodes */
  // if (notes.length >(WIDTH / PIXELSIZE + (PIXELSIZE / 10))) notes.pop();

	avgCtx.fillStyle = color(data);
	avgCtx.fillRect(ax, ay, PIXELSIZE, PIXELSIZE);
  ax += PIXELSIZE;

  /* Loops through notes array and adds color for bars */
  // for(var i = 0; i < notes.length; i++) {
  //     avgCtx.fillStyle = color(notes[i].data);
  //     avgCtx.globalAlpha = (notes.length - i) / notes.length;
  //     avgCtx.fillRect(notes[i].ax - (i * notes[i].width), notes[i].ay, notes[i].width, notes[i].height);
  //     avgCtx.globalAlpha = 1;
  // }

  /* Normal Audio Frequency display uses different canvas */
  // indCtx.fillStyle = 'white';
  // indCtx.fillRect(0, 0, WIDTH, HEIGHT);
  //
  // for (var i = 0; i < bufferLength; i++) {
  //   dataArray[i]
  //
  //   indCtx.fillStyle = 'black';
  //   indCtx.fillRect((ix * i * 5), 256 - dataArray[i] / 2, 5, dataArray[i] / 2);
  // }
};

draw();
