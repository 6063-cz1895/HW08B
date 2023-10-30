// Button class definition
class Button {
  constructor(_label, _x, _y, _onClick) {
    // create a button and set its label, position, and click event handler
    this.button = createButton(_label);
    this.button.position(_x, _y);
    this.button.style("width", windowWidth / 8 + "px");
    this.button.style("height", "30px");
    this.button.mouseClicked(_onClick);
  }

  // change the label of the button
  html(_label) {
    this.button.html(_label);
  }
}

// Circle class definition 
class Circle {
  constructor(diam, angle) {//activate "instance mode" for diameter and angle
    // set the initial position, diameter, angle, speed, and angular velocity of the circle
    this.x = windowWidth / 2;
    this.y = windowHeight / 2;
    this.diam = diam;
    this.angle = angle;
    this.speed = 20;
    this.angularVelocity = 0.04;
    // set a random brightness value for the circle
    this.brightness = random(100);
  }

  // update the position of the circle based on its speed and angle, so that circles will keep moving out the screen will spinning (I feel like I am stuck with this topic for this semester)
  move() {
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
    this.angle += this.angularVelocity;
  }

  // draw the circle on the canvas, this time the color mode I am using is HSL
  display() {
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.brightness);
    noStroke();
    ellipse(this.x, this.y, this.diam, this.diam);
  }
}

let stupidHeart; // variable to store the sound file
let waveDiameters; // array to store the diameters of the circles
let circles = []; // array to store the circles themselves

// buttons from tutorial
let playButton;
let stopButton;

// slider for changing the color of the circles, this is my custom DOM part
let colorSlider;

let buttonY; // y position of the buttons

// load the sound file here
function preload() {
  stupidHeart = loadSound("./stupidHeart.mp3");
}

// map the value of the sound into the diameter for the shoot out circles
function toWidth(_peakVal) {
  return map(abs(_peakVal), 0, 1, 0, 500);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  waveDiameters = stupidHeart.getPeaks().map(toWidth);//calculate the circle diameter

// create the play and stop buttons for start/pause and stop
  buttonY = windowHeight - 40;
  playButton = new Button("⏵", windowWidth / 8, buttonY, playClicked);
  stopButton = new Button("■", windowWidth / 4, buttonY, stopClicked);

  // create the color slider for changing circle color
  colorSlider = createSlider(0, 360, 330);
  colorSlider.position(windowWidth / 2 - 100, windowHeight - 30);
  colorSlider.style("width", "200px");
}

function draw() {
  // change the background color based on whether the sound is playing or not
  if (stupidHeart.isPlaying()) {
    background(255);
    playButton.html("▮▮");
  } else {
    background(200);
    playButton.html("⏵");
  }

  // create new circles based on the current time in the sound file
  if (stupidHeart.isPlaying()) {// Check if the sound is currently playing
    let tPos = stupidHeart.currentTime() / stupidHeart.duration();// Calculate the current position in the sound file as a fraction between 0 and 1
    let dIndexDelay = floor(tPos * waveDiameters.length);//Map the current position to an index in the waveDiameters array, delaying the index to sync with the music
    let dIndex = constrain(dIndexDelay, 0, waveDiameters.length - 1);//Constrain the index to be within the waveDiameters array
    let diam = waveDiameters[dIndex]; // Get the diameter for the current frame from the waveDiameters array
    let angle = random(TWO_PI);// Generate a random angle below 2π (360degrees)
    let circle = new Circle(diam, angle);// Create a new Circle object with the music-defined diameter and random angle
    circle.color = color('hsb(' + colorSlider.value() + ', 100%, 100%)');// Set the color of the circle
    circles.push(circle);// Add the new circle to the array of circles
  }

  // update all the circles
  // This is something I finally figured out after doing some research:
  // The reason we iterate from the last element to the first is that removing an element from an array shifts all the elements after it is down by one index. 
  // If we were iterating from the first element to the last, it can be problematic, because it would be shifted into the index we just removed, so we have to go reversely.
  for (let i = circles.length - 1; i >= 0; i--) {//here we are iterating from the last element to the first, so it is i--
    let circle = circles[i];
    circle.move();
    circle.display();
    if (circle.x < 0 || circle.x > windowWidth || circle.y < 0 || circle.y > windowHeight) {//remove circle that is out of the screen
      circles.splice(i, 1);
    }
  }

  // draw the heart shape
  drawHeartShape();
}

// draw the heart shape at the center of the canvas
function drawHeartShape() {
  let size;
  if (stupidHeart.isPlaying()) {
    let tPos = stupidHeart.currentTime() / stupidHeart.duration();//Heart is responsive to music as well, it pops together with the music
    let dIndexDelay = floor(tPos * waveDiameters.length);
    let dIndex = constrain(dIndexDelay, 0, waveDiameters.length - 1);
    size = map(waveDiameters[dIndex], 0, 500, 50, 150);
  } else {
    size = 50;
  }
  heart(windowWidth / 2, windowHeight / 2, size);
}

// draw a heart shape using bezier vertices
function heart(x, y, size) {
  fill(255, 182, 193);
  beginShape();
  vertex(x, y);
  bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
  bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  endShape(CLOSE);
}

// play or pause the sound when the play button is clicked
function playClicked() {
  if (stupidHeart.isPlaying()) {
    stupidHeart.pause();
  } else {
    stupidHeart.play();
  }
}

// stop the sound when the stop button is clicked
function stopClicked() {
  stupidHeart.stop();
}