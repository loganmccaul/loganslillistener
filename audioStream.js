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
analyser.smoothingTimeConstant = .9;

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


// var PIXELSIZE = 200; // Bars across

function color(data) {
  /* Shades of Teal */
  // var start = 0x30CCC3;
  // var end = 0x0C3331;

  /* Red Yellows and Blues */
  // var start = 0x3EC260;
  // var end = 0xFFA71F;

  /* Dynamic Color */
  var start = parseInt(document.getElementById('startColor').value.replace('#', ''), 16);
  var end = parseInt(document.getElementById('endColor').value.replace('#', ''), 16);

  var r = (end & 0xFF0000) * (1 - data) + (start & 0xFF0000) * data;
  var g = (end & 0x00FF00) * (1 - data) + (start & 0x00FF00) * data;
  var b = (end & 0x0000FF) * (1 - data) + (start & 0x0000FF) * data;

  return `#${((r & 0xFF0000) + (g & 0x00FF00) + (b & 0x0000FF)).toString(16)}`;
}

var notes = []; // Array for bars

var clearRect = false;
var paused = false;

function draw() {
  drawVisual = requestAnimationFrame(draw);

  if (!paused) {
    var PIXELSIZE = parseInt(WIDTH/squareSize.value); // Square sizes

    /* Background if notes saved in array */
    // avgCtx.fillStyle = 'black';
    // avgCtx.fillRect(0, 0, WIDTH, HEIGHT);

    analyser.getByteFrequencyData(dataArray);

    if (clearRect) {
      avgCtx.fillStyle = 'white';
      avgCtx.clearRect(0, 0, WIDTH, HEIGHT);
      clearRect = false;
    }

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
  }
};

/* Selectors */
var squareSize = document.getElementById('squareSize');
var squareSizeText = document.getElementById('squareSizeText');
var swapColor = document.getElementById('swapColor');
var startColor = document.getElementById('startColor');
var endColor = document.getElementById('endColor');
var controls = document.querySelector('.controls');
var reset = document.getElementById('reset');
var pause = document.getElementById('pause');
var pauseOverlay = document.querySelector('.pause__overlay');

/* Resets canvas on square size change */
squareSize.addEventListener('input', () => {
  ax = 0;
  ay = 0;
  clearRect = true;
  squareSizeText.value = squareSize.value;
  setLocalStorage('squareSize', squareSize.value);
});

squareSizeText.addEventListener('input', () => {
  ax = 0;
  ay = 0;
  clearRect = true;
  squareSize.value = squareSizeText.value;
  setLocalStorage('squareSize', squareSizeText.value);
});

/* Shows Controls */
var timeout;
document.body.addEventListener('mousemove', () => {
  controls.classList.add('controls--open');
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    controls.classList.remove('controls--open')
  }, 1500);
});

/* Menu open on load */
setTimeout(() => {
  controls.classList.add('controls--hidden');
}, 3000);

/* Color change */
startColor.addEventListener('change', () => {
  setLocalStorage('startColor', startColor.value);
});

endColor.addEventListener('change', ()=> {
  setLocalStorage('endColor', endColor.value);
});

/* Swap Colors Button */
swapColor.addEventListener('click', () => {
  var tempColor = startColor.value;
  startColor.value = endColor.value;
  endColor.value = tempColor;
  setLocalStorage('startColor', startColor.value);
  setLocalStorage('endColor', endColor.value);
});

/* Reset Changes */
reset.addEventListener('click', () => {
  ax = 0;
  ay = 0;
  clearRect = true;
  startColor.value = '#30CCC3';
  endColor.value = '#0C3331';
  squareSizeText.value = 10;
  squareSize.value = 10;
  resetLocalStorage();
});

/* Pause and Play */
pause.addEventListener('click', () => {
  if (paused) {
    paused = false;
    pause.textContent = 'Pause';
    pauseOverlay.classList.add('pause__overlay--hidden');
  } else {
    paused = true;
    pause.textContent = 'Play';
    pauseOverlay.classList.remove('pause__overlay--hidden');
  }
});

/* Store form data in localStorage to save between sessions */
var storedStartColor = window.localStorage.getItem('startColor');
var storedEndColor = window.localStorage.getItem('endColor');
var storedSquareSize = window.localStorage.getItem('squareSize');

if (storedStartColor) {
  startColor.value = storedStartColor;
} else {
  window.localStorage.setItem('startColor', '#30CCC3');
}

if (storedEndColor) {
  endColor.value = storedEndColor;
} else {
  window.localStorage.setItem('endColor', '#0C3331');
}

if (storedSquareSize) {
  squareSizeText.value = storedSquareSize;
  squareSize.value = storedSquareSize;
} else {
  window.localStorage.setItem('squareSize', '10');
}

function resetLocalStorage() {
  window.localStorage.setItem('startColor', '#30CCC3');
  window.localStorage.setItem('endColor', '#0C3331');
  window.localStorage.setItem('squareSize', '10');
}

function setLocalStorage(item, value) {
  window.localStorage.setItem(item, value);
}

draw();
