class GridBox {
  constructor(id, coordinates) {
    this.id = id;
    this.col = coordinates.col;
    this.row = coordinates.row;
    this.on = false;
    this.active = false;
    this.floor = false;
    this.display = '0';
  }

  updateGrid(grid) {
    grid[this.row][this.col] = this.display;
  }

  activate(grid) {
    this.active = true;
    this.toggle(true);
    // do I have to use this.updateGrid?
    this.updateGrid(grid);
  }

  touchFloor(state, grid) {
    this.floor = state;
    this.toggle(true);
    // this.updateGrid(grid);
  }

  toggle(state) {
    if (state) {
      this.on = true;
      this.display = '-';
    } else {
      this.on = false;
      this.display = '0';
    }
  }

  step(grid) {
    this.active = false;
    this.toggle(false);
    if (this.floor === true) {
      this.toggle(true);
    }
    this.updateGrid(grid);
  }
}

class GridManager {
  constructor(numRows, numCols) {
    this.gridBoxes = [];
    for (let rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
      let row = [];
      for (let colIndex = 0; colIndex < NUM_COLS; colIndex++) {
        let gridNum = NUM_ROWS*rowIndex + colIndex;
        // could create a coordinates class, but this is good enough for now
        this.gridBoxes.push(new GridBox(gridNum, {col: colIndex, row: rowIndex}));
      }
    }    
  }

  floor(shape) {
    for (let i = 0; i < shape.length; i++) {
      if (shape[i] >= 0) {
        this.gridBoxes[shape[i]].touchFloor(true);
      }
    }  
  }
}

class Piece {

  constructor(numRows, numCols) {
    this.shape = [-numCols, -(numCols) + 1, -2 * (numCols) + 1, -2 * (numCols)];
    this.numRows = numRows;
    this.numCols = numCols;
  }

  movePiece(moves) {
    for (let i = 0; i < this.shape.length; i++) {
      this.shape[i] += moves;
    }
    console.log(this.shape);     
  }

  checkMoveDown() {
    let touchFloor = false;
    // can refactor each bound check to find the first invalid block
    for (let i = 0; i < this.shape.length; i++) {
      // check if the next location will be a floor (not yet checking collisions)
      if ( (this.shape[i] + this.numCols) > (this.numRows*this.numCols - 1) ) {
        console.log("floor becomes true: " + (this.shape[i] + this.numCols) + " > " + (this.numRows*this.numCols - 1));
        touchFloor = true;
        return false;
      }
    }
    return true;    
  }

  moveDown() {
    if (this.checkMoveDown()) {
      this.movePiece(this.numCols);
      return true; 
    } else {
      // play some thumping sound
      return false;
    }
  }
}

class GridVisual {
  constructor(numRows, numCols) {
    this.grid = [];
    this.displayOff = '0';
    this.displayOn = '-';
    this.numRows = numRows;
    this.numCols = numCols;
    this.activeSquares = [];
    for (let rowIndex = 0; rowIndex < this.numRows; rowIndex++) {
      let row = [];
      for (let colIndex = 0; colIndex < this.numCols; colIndex++) {
        row.push(this.displayOff);
      }
      this.grid.push(row);
    }   
  }

  getRow(index) {
    return Math.floor(index / this.numCols);
  }

  getCol(index) {
    return (index % this.numCols);
  }

  toggleSquare(rowNum, colNum, state) {
    this.grid[rowNum][colNum] = state ? this.displayOn : this.displayOff;
  }

  activate(shape) {
    for (let i = 0; i < shape.length; i++) {
      if (shape[i] < 0) {
        continue;
      }
      this.activeSquares.push(shape[i]);
      let rowNum = this.getRow(shape[i]);
      let colNum = this.getCol(shape[i]);
      console.log("activated: " + rowNum + " " + colNum);
      this.toggleSquare(rowNum, colNum, true); 
    } 
  }

  step() {
    for (let i = 0; i < this.activeSquares.length; i++) {
      // this is recalculating every time, can refactor to use a hash of coordinates
      let rowNum = this.getRow(this.activeSquares[i]);
      let colNum = this.getCol(this.activeSquares[i]);
      this.toggleSquare(rowNum, colNum, false);       
    }
    this.activeSquares = [];
  }
}














// inintialize grid dimensions
const NUM_COLS = 5;
const NUM_ROWS = 10;
let lockKeyPress = false;

const grid = new GridVisual(NUM_ROWS, NUM_COLS);
const gridBoxes = new GridManager(NUM_ROWS, NUM_COLS);
const piece = new Piece(NUM_ROWS, NUM_COLS);
const shape = piece.shape;
// we have separated out the shape moving logic from the grid
// can refactor the shape to be a class

const checkKeyPress = (shape, key) => {
  let wall = false;

  // for RIGHT, LEFT key presses
  const checkRight = (shapeNum) => (shapeNum % NUM_COLS + 1) < NUM_COLS;
  const checkLeft = (shapeNum) => (shapeNum % NUM_COLS - 1) > 0;
  let checkBound = checkRight;
  let moveSpace = 1;

  switch (key) {
    case 'LEFT':
      checkBound = checkLeft;
      moveSpace = -1;
      break;
    case 'RIGHT':
      checkBound = checkRight;
      moveSpace = 1;
      break;
    default:
      console.log('Invalid direction');
  }

  // check bounds
  for (let i = 0; i < shape.length; i++) {
    if (!checkBound(shape[i])) {
      wall = true;
    }
  }

  // LOCK KEY PRESS UNTIL THIS HAS FULLY MOVED
  // move in the correct direction
  if (!wall && !lockKeyPress) {
    lockKeyPress = true;
    for (let i = 0; i < shape.length; i++) {
      // can refactor shape to be  class and take care of itself
      if (gridBoxes[shape[i]])
        gridBoxes[shape[i]].step(grid);
      shape[i] += moveSpace;
      if (gridBoxes[shape[i]])
        gridBoxes[shape[i]].activate(grid);
      // can refactor to have collections
    }
    lockKeyPress = false;    
  }
}

// create a settimeout for lockkeypress

// tradeoffs: have to recalculate gridboxnum every time
// refactor: have shape be grid box number, subtract by num columns every time
const step = () => {
  // can refactor each bound check to find the first invalid block
  let movedDown = piece.moveDown();

  // update positions of the shape on the board
  if (movedDown) {
    grid.activate(piece.shape);

  } else {
    gridBoxes.floor(piece.shape);
    // grid.floor(shape);  
  }
  for (let i = 0; i < 10; i++) {
    console.log('\n');
  }

  console.log(grid.grid);
  // update board
  grid.step(); 
  if (movedDown)
    setTimeout(step, 1000); 
}

step();

const testKeyPresses = () => {
  let randNum = Math.floor(Math.random() * 2);
  let direction = randNum ? 'RIGHT' : 'LEFT';
  checkKeyPress(shape, direction);
  setTimeout(testKeyPresses, Math.random()*800 + 1000);
}
// testKeyPresses();
// TODO: Control grid front end using logic from gridbox objects
// e.g. when to turn on grid
// start off w/ brute force before optimizing

// LEFTOFF: MAKE SHAPE INTO AN OBJECT SO THAT IT CAN BE SAFELY ACCESSED BY DIFFERENT PARTS OF THE PROGRAM

