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
    this.updateGrid(grid);
  }

  toggle(state) {
    if (state) {
      this.on = true;
      this.display = 'x';
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

// inintialize grid dimensions
const NUM_COLS = 5;
const NUM_ROWS = 5;
// grid and objects creator
const createGrid = (numRows, numCols) => {
  let grid = [];
  let gridBoxes = [];
  for (let rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    let row = [];
    for (let colIndex = 0; colIndex < NUM_COLS; colIndex++) {
      let gridNum = NUM_ROWS*rowIndex + colIndex;
      // could create a coordinates class, but this is good enough for now
      gridBoxes.push(new GridBox(gridNum, {col: colIndex, row: rowIndex}));
      row.push(0);
    }
    grid.push(row);
  }
  return [grid, gridBoxes];
}

const [grid, gridBoxes] = createGrid(NUM_COLS, NUM_ROWS);
// we have separated out the shape moving logic from the grid
let shape = [-NUM_COLS, -NUM_COLS + 1, -2 * NUM_COLS + 1, -2 * NUM_COLS];

// tradeoffs: have to recalculate gridboxnum every time
// refactor: have shape be grid box number, subtract by num columns every time
const step = () => {
  let touchFloor = false;
  for (let i = 0; i < shape.length; i++) {
    // check if the next location will be a floor
    if ( (shape[i] + NUM_COLS) > (NUM_ROWS*NUM_COLS - 1) ) {
      touchFloor = true;
    }
  }

  // update positions of the shape
  if (!touchFloor) {
    for (let i = 0; i < shape.length; i++) {
      shape[i] += NUM_COLS;
      // set the grid box to true and active
      if (gridBoxes[shape[i]]) {
        gridBoxes[shape[i]].activate(grid);
      }
    } 
  } else {
    for (let i = 0; i < shape.length; i++) {
      if (gridBoxes[shape[i]]) {
        gridBoxes[shape[i]].touchFloor(true, grid);
      }
    }    
  }

  console.log(grid);
  // update board 
  for (let i = 0; i < shape.length; i++) {
    if (gridBoxes[shape[i]]) {
      gridBoxes[shape[i]].step(grid);
    }
  }
  if (!touchFloor)
    setTimeout(step, 800); 
}

step();

// TODO: Control grid front end using logic from gridbox objects
// e.g. when to turn on grid
// start off w/ brute force before optimizing

