class GridBox {
  constructor(id, coordinates) {
    this.id = id;
    this.col = coordinates.col;
    this.row = coordinates.row;
    this.on = false;
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
    this.on = state;
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

// GridManager model updates GridVisual view, piece is a state of gridmanager
class GridManager {
  constructor(numRows, numCols) {
    this.gridBoxes = [];
    this.gridVisual = new GridVisual(numRows, numCols);

    // maybe a new class that creates grid boxes
    // initialize gridboxes
    for (let rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
      let row = [];
      for (let colIndex = 0; colIndex < NUM_COLS; colIndex++) {
        let gridNum = NUM_ROWS*rowIndex + colIndex;
        // could create a coordinates class, but this is good enough for now
        this.gridBoxes.push(new GridBox(gridNum, {col: colIndex, row: rowIndex}));
      }
    }    
  }

  activate(shape) {
    this.gridVisual.activate(shape);
  }

  floor(shape) {
    this.floorPiece(shape);
    this.gridVisual.floorPiece(shape);
  }

  floorPiece(shape) {
    for (let i = 0; i < shape.length; i++) {
      if (shape[i] >= 0) {
        this.gridBoxes[shape[i]].touchFloor(true);
      }
    }  
  }

  move(piece) {
    return piece.moveDown();
  }

  step() {
    this.gridVisual.step();
  }

  getGrid() {
    return this.gridVisual.getGrid();
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
    this.floorTouched = false;
    this.coordinates = [];
    // initialize grid
    for (let rowIndex = 0; rowIndex < this.numRows; rowIndex++) {
      let row = [];
      for (let colIndex = 0; colIndex < this.numCols; colIndex++) {
        row.push(this.displayOff);
        this.coordinates.push({row: rowIndex, col: colIndex});
      }
      this.grid.push(row);
    }   
  }

  getRow(index) {
    return this.coordinates[index].row;
  }

  getCol(index) {
    return this.coordinates[index].col;
  }

  getRowCol(index) {
    try {
      return { row: this.getRow(index), col: this.getCol(index) };
    } catch (e) {
      console.error('getRowCol(index): Index out of bounds ' + index + ': ' + e.message);
      throw new RangeError(e);
    }
  }

  toggleSquare(index, state) {
    try {
      let { row, col } = this.getRowCol(index);
      this.grid[row][col] = state ? this.displayOn : this.displayOff;
    } catch (e) {
      console.error('toggleSquare(index, state): Index out of bounds: ' + index + ': ' + e.message);
    }
  }

  activate(shape) {
    for (let i = 0; i < shape.length; i++) {
      if (shape[i] < 0) {
        continue;
      }
      this.activeSquares.push(shape[i]);
      this.toggleSquare(shape[i], true); 
    } 
  }

  floorPiece(shape) {
    this.activate(shape);
    this.floorTouched = true;
  }

  step() {
    for (let i = 0; i < this.activeSquares.length; i++) {
      if (!this.floorTouched) {
        this.toggleSquare(this.activeSquares[i], false);
        this.floorTouched = false;       
      }
    }
    this.activeSquares = [];
  }

  getGrid() {
    return this.grid;
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
  }

  checkMoveDown() {
    let touchFloor = false;
    // can refactor each bound check to find the first invalid block
    for (let i = 0; i < this.shape.length; i++) {
      // check if the next location will be a floor (not yet checking collisions)
      if ( (this.shape[i] + this.numCols) > (this.numRows*this.numCols - 1) ) {
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


module.exports = {GridVisual, GridManager, Piece, GridBox};









// inintialize grid dimensions
const NUM_COLS = 5;
const NUM_ROWS = 10;
let lockKeyPress = false;

const gridManager = new GridManager(NUM_ROWS, NUM_COLS);
const piece = new Piece(NUM_ROWS, NUM_COLS);
const shape = piece.shape;
// we have separated out the shape moving logic from the grid

const step = () => {
  // can refactor each bound check to find the first invalid block
  let movedDown = gridManager.move(piece);
  let shape = piece.shape;

  // update positions of the shape on the board
  if (movedDown) {
    gridManager.activate(shape);
  } else {
    gridManager.floor(shape); 
  }
  for (let i = 0; i < 10; i++) {
    console.log('\n');
  }

  console.log(gridManager.getGrid());
  // update board
  gridManager.step(); 
  if (movedDown)
    setTimeout(step, 500); 
}

step();





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

// (DONE) LEFTOFF: MAKE SHAPE INTO AN OBJECT SO THAT IT CAN BE SAFELY ACCESSED BY DIFFERENT PARTS OF THE PROGRAM
// Most of the trip initial up was from col and row maths. 

// (DONE) LEFTOFF: UPDATE GRIDMANAGER STATE WHEN THE SHAPE HITS THE FLOOR, 
// LEAVE THE BOXES 'ON' IN GRID INSTEAD OF TOGGLING 'OFF' AFTER STEP

// LEFTOFF: IMPLEMENT UNIT TESTING



