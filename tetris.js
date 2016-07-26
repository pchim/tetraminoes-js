// inintialize grid dimensions
const NUM_COLS = 5;
const NUM_ROWS = 5;

let grid = [];
for (let rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
  let row = [];
  for (let colIndex = 0; colIndex < NUM_COLS; colIndex++) {
    row.push(0);
  }
  grid.unshift(row);
}

let shape = [{x: 0, y: 5}, {x: 1, y: 5}, {x: 1, y: 6}, {x: 0, y: 6}];

// tradeoffs: have to recalculate gridboxnum every time
// refactor: have shape be grid box number, subtract by num columns every time
const step = () => {
  let touchFloor = false;
  for (let i = 0; i < shape.length; i++) {
    // check if the next location will be a floor
    let gridBoxNum = NUM_ROWS*(shape[i].y - 1) + shape[i].x;
    if (gridBoxNum - 4 < -4) {
      touchFloor = true;
    }
  }
  if (!touchFloor) {
    for (let i = 0; i < shape.length; i++) {
      shape[i].y -= 1;
    }
    console.log(shape);  
    setTimeout(step, 750); 
  }
 
}


console.log(grid);

let objGrid = [];
for (let rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
  let row = [];
  for (let colIndex = 0; colIndex < NUM_COLS; colIndex++) {
    row.push(NUM_ROWS*rowIndex + colIndex);
  }
  objGrid.unshift(row);
}
console.log(objGrid);

step();