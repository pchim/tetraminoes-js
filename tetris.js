class GridBox {
  constructor(id, coordinates) {
    this.id = id;
    this.x = coordinates.x;
    this.y = coordinates.y;
    this.on = false;
    this.active = false;
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
      gridBoxes.push(new GridBox(gridNum, {rowIndex, colIndex}));
      row.push(0);
    }
    grid.unshift(row);
  }
  return [grid, gridBoxes];
}

// console.log(grid);


// we have separated out the shape moving logic from the grid
let shape = [(NUM_ROWS*NUM_COLS), (NUM_ROWS*NUM_COLS + 1), (NUM_ROWS*NUM_COLS + NUM_COLS), (NUM_ROWS*NUM_COLS + NUM_COLS + 1)];

// tradeoffs: have to recalculate gridboxnum every time
// refactor: have shape be grid box number, subtract by num columns every time
const step = () => {
  let touchFloor = false;
  for (let i = 0; i < shape.length; i++) {
    // check if the next location will be a floor
    if (shape[i] - NUM_COLS < 0) {
      touchFloor = true;
    }
  }
  if (!touchFloor) {
    for (let i = 0; i < shape.length; i++) {
      shape[i] -= NUM_COLS;
    }
    console.log(shape);  
    setTimeout(step, 750); 
  }
 
}

step();