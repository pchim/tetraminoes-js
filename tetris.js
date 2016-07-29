// hold state of each grid square on the board
class GridBox {
  constructor(id, coordinates) {
    this.id = id;
    this.col = coordinates.col;
    this.row = coordinates.row;
    this.on = false;
    this.displayOn = Math.random() * 2 > 1 ? 'X' : '-';
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
    // this.active = false;
    // this.toggle(false);
    // if (this.floor === true) {
    //   this.toggle(true);
    // }
  }
}

class GridBoxes {
  constructor(numRows, numCols) {
    this.grid = [];
    // initialize gridboxes
    for (let rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
      let row = [];
      for (let colIndex = 0; colIndex < NUM_COLS; colIndex++) {
        let gridNum = NUM_ROWS*rowIndex + colIndex;
        // could create a coordinates class, but this is good enough for now
        this.grid.push(new GridBox(gridNum, {col: colIndex, row: rowIndex}));
      }
    } 
  }

  getBox(index) {
    return this.grid[index];
  }

  setState(index, option, state) {
    try {
      (this.grid[index])[option] = state;
      return true;
    }
    catch (e) {
      console.error(e.message);
      return false;
    }
  }

  getState(index, option) {
    try {
      return (this.grid[index])[option];
    }
    catch (e) {
      console.error(e.message);
      return null;
    }
  }
}

// GridManager model updates GridVisual view, piece is a state of gridmanager
class GridManager {
  constructor(numRows, numCols) {
    this.gridBoxes = new GridBoxes(numRows, numCols);
    this.gridVisual = new GridVisual(numRows, numCols);
    this.keyPress = null;
    // maybe a new class that creates grid boxes

   
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
        this.gridBoxes.getBox(shape[i]).touchFloor(true);
      }
    }  
  }

  pressKey(key) {
    this.keyPress = key;
  }

  move(piece) {
    // the IMPORTANT aspect of this is that we take care of the asynchronous
    // user key presses by checking for that key press here.
    // we now synchronously update the position of the piece

    // later the piece will be re-rendered and is guaranteed to be in one piece

    // here is where we will check if any key presses have been done in queue
    if (this.keyPress !== null) {
      this.moveHoriz(piece, this.keyPress);
      this.keyPress = null;
    }
    return piece.moveDown(this.gridBoxes);
  }

  moveHoriz(piece, dir) {
    return piece.moveHoriz(dir, this.gridBoxes);
  }

  step() {
    this.gridVisual.step();
  }

  getGrid() {
    return this.gridVisual.getGrid();
  }
}


// display and control grid view
class GridVisual {
  constructor(numRows, numCols) {
    this.grid = [];
    this.displayOff = ' ';
    this.displayOn = Math.random() * 2 > 1 ? 'o' : '-';
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
      console.error('getRowCol(index): Index ' + index + ' out of bounds: ' + e.message);
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
    this.displayOn = Math.random() * 2 > 1 ? 'o' : '-';
  }

  step() {
    for (let i = 0; i < this.activeSquares.length; i++) {
      if (!this.floorTouched) {
        this.toggleSquare(this.activeSquares[i], false);
      }
    }
    this.floorTouched = false;       
    this.activeSquares = [];
  }

  getGrid() {
    return this.grid;
  }
}

// board piece
class Piece {

  constructor(numRows, numCols) {
    this.numRows = numRows;
    this.numCols = numCols;
    this.shapes = this.makeShapes(numRows, numCols);
    this.shape = this.newShape();
  }

  makeShapes(numRows, numCols) {
    const shapes = {
      square: [-numCols, -(numCols) + 1, -2 * (numCols) + 1, -2 * (numCols)],
      barI: [-numCols, -2 * numCols, -3 * numCols, -4 * numCols]
    };
    return shapes;
  }

  newShape() {
    this.shape = Math.random() * 2 > 1 ? this.shapes.barI.concat() : this.shapes.square.concat();
  }

  movePiece(moves) {
    for (let i = 0; i < this.shape.length; i++) {
      this.shape[i] += moves;
    }    
  }

  checkMoveDown(boardState) {
    let touchFloor = false;
    // can refactor each bound check to find the first invalid block
    for (let i = 0; i < this.shape.length; i++) {
      // check if the next location will be a floor (not yet checking collisions)
      if ( (this.shape[i] + this.numCols) > (this.numRows*this.numCols - 1) || this.checkCollision(this.shape[i] + this.numCols, boardState)) {
        touchFloor = true;
        return false;
      }
    }
    return true;    
  }

  moveDown(boardState) {
    if (this.checkMoveDown(boardState)) {
      this.movePiece(this.numCols);
      return true; 
    } else {
      // play some thumping sound
      return false;
    }
  }

  // can refactor all of the checks by putting a 'params' parameter
  checkMoveHoriz(checkBound, boardState, moveSpace) {
    for (let i = 0; i < this.shape.length; i++) {
      if (!checkBound(this.shape[i]) || this.checkCollision(this.shape[i] + moveSpace, boardState)) {
        return false;
      }
    }
    return true;
  }


  moveHoriz(dir, boardState) {
    const NUM_COLS = this.numCols;
    // for RIGHT, LEFT key presses
    const checkRight = (shapeNum) => (shapeNum % NUM_COLS + 1) < NUM_COLS;
    const checkLeft = (shapeNum) => (shapeNum % NUM_COLS - 1) > 0;
    let checkBound = checkRight;
    let moveSpace = 1;

    switch (dir) {
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

    // check bounds and move
    if(this.checkMoveHoriz(checkBound, boardState, moveSpace)) {
      this.movePiece(moveSpace);
      return true;
    } else {
      return false;
    }
  }

  checkCollision(index, boardState){
    if (boardState.getState([index], 'on')) {
      return true;
    }
    return false;
  }
}


module.exports = {GridVisual, GridManager, Piece, GridBox};









// inintialize grid dimensions
const NUM_COLS = 5;
const NUM_ROWS = 10;
let lockKeyPress = false;

const gridManager = new GridManager(NUM_ROWS, NUM_COLS);
const piece = new Piece(NUM_ROWS, NUM_COLS);
let shape = piece.newShape();
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
    piece.newShape();
  }
  for (let i = 0; i < 10; i++) {
    console.log('\n');
  }

  console.log(gridManager.getGrid());
  // update board
  gridManager.step(); 
  //if (movedDown)
    setTimeout(step, 500); 
}

step();

const testKeyPresses = () => {
  let randNum = Math.floor(Math.random() * 2);
  let direction = randNum ? 'RIGHT' : 'LEFT';
  gridManager.pressKey(direction);
  setTimeout(testKeyPresses, Math.random()*800 + 1000);
  console.log(direction);
}
testKeyPresses();
// TODO: Control grid front end using logic from gridbox objects

// (DONE) LEFTOFF: MAKE SHAPE INTO AN OBJECT SO THAT IT CAN BE SAFELY ACCESSED BY DIFFERENT PARTS OF THE PROGRAM
// Most of the initial trip up was from col and row maths. 

// (DONE) LEFTOFF: UPDATE GRIDMANAGER STATE WHEN THE SHAPE HITS THE FLOOR, 
// LEAVE THE BOXES 'ON' IN GRID INSTEAD OF TOGGLING 'OFF' AFTER STEP

// (DONE) LEFTOFF: IMPLEMENT UNIT TESTING (INITIAL SETUPS - GRIDVISUAL)

// (DONE) MOVE BOX LEFT AND RIGHT, SIMULATE RANDOM L/R KEY PRESSES

// (DONE) LEFTOFF: IMPLEMENT ANOTHER SHAPE AND FLOOR LOGIC



