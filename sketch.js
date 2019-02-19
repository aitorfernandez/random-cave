var DEBUG = false;

var blockSize = 600;
var SIZE = Math.floor(blockSize / 8);
var colors = [
  'Yellow', 'LightSkyBlue', 'LightSlateGrey', 'LightSteelBlue', 'LightGrey', 'YellowGreen'
];

var MARGIN = 3;

var center;

var path = [], direction = [], p;
var upPosition, goesUp, left;

var prevPoint, point;

function getRoom(row, column, limit, dir) {
  var room;

  if (column === upPosition) {
    // Start room (0) or from bellow room (3)
    room = (row === 0) ? 0 : 3;
  }
  else {
    if (goesUp) {
      room = 4;
    }
    else {
      var r = Math.floor(random(0, 6));

      if (r === 5 || column === limit) {
        if (column === limit) {
          // I'm in the edge of the screen go to the oposite dir in the next iteration
          left = dir;
        }
        else {
          // Choosing random direction for the nex iteration
          left = Math.random() >= 0.5;
        }

        // Exit room (5) or going up room (2)
        room = (row === 3) ? 5 : 2;
        goesUp = true;
        upPosition = column;
      }
      else {
        room = 1;
      }
    }
  }

  return room;
}

function fillGrid() {
  // A grid of 4x4
  for (var j = 0; j < 4; j++) {
    // Saving the direction for future references
    direction.push(left);

    goesUp = false;
    p = [];

    // ->
    if (left) {
      for (var i = 0; i < 4; i++) {
        // cover no-path rooms
        if (j > 0 && i < upPosition) {
          p[i] = 4;
        }
        else {
          p[i] = getRoom(j, i, 3, false);
        }
      }
    }
    // <-
    else {
      for (var i = 3; i >= 0; i--) {
        // cover no-path rooms
        if (j > 0 && i > upPosition) {
          p[i] = 4;
        }
        else {
          p[i] = getRoom(j, i, 0, true);
        }
      }
    }

    path.push(p);
  }
}

function drawTriangle(pos, room, dir) {
  var triangleSize = 5;
  var a, b, c;

  if (room === 2) {
    a = createVector(pos.x - triangleSize, pos.y + triangleSize);
    b = createVector(pos.x, pos.y - triangleSize);
    c = createVector(pos.x + triangleSize, pos.y + triangleSize);
  }
  else {
    // ->
    if (dir) {
      a = createVector(pos.x - triangleSize, pos.y + triangleSize);
      b = createVector(pos.x - triangleSize, pos.y - triangleSize);
      c = createVector(pos.x + triangleSize, pos.y);
    }
    // <-
    else {
      a = createVector(pos.x - triangleSize, pos.y);
      b = createVector(pos.x + triangleSize, pos.y - triangleSize);
      c = createVector(pos.x + triangleSize, pos.y + triangleSize);
    }
  }

  triangle(a.x, a.y, b.x, b.y, c.x, c.y);
}

function drawGrid(row, column) {
  if (path[row][column] === 4) {
    noStroke();
    fill(colors[path[row][column]]);
  }
  else {
    strokeWeight(1);
    noFill();
    stroke(colors[path[row][column]]);
  }

  var m = createVector(column * MARGIN, row * MARGIN);
  var pos = createVector(center.x + (SIZE * column) + m.x, center.y + (SIZE * (4 - row)) - m.y);

  rect(pos.x, pos.y, SIZE, SIZE);

  // Draw triangle path
  if (path[row][column] !== 4) {

    point = createVector(pos.x + (SIZE / 2), pos.y + (SIZE / 2));

    if (prevPoint) {
      strokeWeight(1);
      stroke('LightGrey');
      line(prevPoint.x, prevPoint.y, point.x, point.y);
    }

    noStroke();
    fill('LightGrey');
    drawTriangle(point, path[row][column], direction[row]);
  }

  prevPoint = point;
}

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight, P2D);
  canvas.parent('content');

  center = createVector((windowWidth / 2) - (SIZE * 2), (windowHeight / 2) - (SIZE * 3));

  if (DEBUG)
    noLoop();
  else
    frameRate(1);
}

function draw() {
  background(255);

  prevPoint = null;
  point = null;

  // Dir... if not left is right
  left = Math.random() >= 0.5;
  path = [];
  direction = [];

  // Start room
  if (left) {
    upPosition = 0;
  }
  else {
    upPosition = 3;
  }

  fillGrid();

  for (var i = 0; i < 4; i++) {
    if (direction[i]) {
      for (var j = 0; j < 4; j++) {
        drawGrid(i, j);
      }
    }
    else {
      for (var j = 3; j >= 0; j--) {
        drawGrid(i, j);
      }
    }
  }

  if (DEBUG) {
    var prettyPrintPath = '';

    for (var i = 3; i >= 0; i--) {
      for (var j = 0; j < 4; j++) {
        prettyPrintPath += ' ' + path[i][j];
      }

      console.log('p' + i + (direction[i] ? ' -> ' : ' <- ') + prettyPrintPath);
      prettyPrintPath = '';
    }
  }
}
