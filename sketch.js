// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"
//TO DO:
// make it so there is a connecting path. make start screen and win screen. make a start and exit point. make it so buildings generate semi-randomly but must generate around edges
const CELL_SIZE = 20;
const PATH = 0;
const BUILDING = 1;
const PLAYER = 9;
let grid;
let rows;
let cols;
let thePlayer = {
  x:0,
  y:0,
};



function setup() {
  createCanvas(windowWidth, windowHeight);
  rows = Math.floor(height/CELL_SIZE);
  cols = Math.floor(width/CELL_SIZE);
  grid = generateRandomGrid(cols, rows);
  // add player to grid
  grid[thePlayer.y][thePlayer.x] = PLAYER;
}

function draw() {
  background(220);
  displayGrid();
}

function displayGrid(){
  for (let y = 0; y < rows; y++){
    for (let x = 0; x < cols; x++){
      if (grid[y][x] === BUILDING){
        fill("black");
        rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
      }
      if (grid[y][x] === PATH){
        fill("white");
        rect(x*CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
      }
      if(grid[y][x] === PLAYER){
        fill("red");
        rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function mousePressed(){
  let x = Math.floor(mouseX/CELL_SIZE);
  let y = Math.floor(mouseY/CELL_SIZE);

  toggleGrid(x, y);
}

function toggleGrid(x, y){
  if (x>=0 && x< cols && y >=0 && y< rows){
    if (grid[y][x] === BUILDING){
      grid[y][x] = PATH;
    }

    else if (grid[y][x] === PATH){
      grid[y][x] = BUILDING;
    }
  }
}

//LOOK AT THIS
function generateRandomGrid(cols, rows){
  let newGrid = [];

  for(let y = 0; y < rows; y ++){
    newGrid.push([]);
    for(let x = 0; x < cols; x++){
      if(random(100) < 50){
        newGrid[y].push(PATH);
        newGrid[y][x-1] === PATH;
      }
      else {
        newGrid[y].push(BUILDING);
      }
    }
  }
  return newGrid;
}

function keyPressed(){
  if (key === "r"){
    grid = generateRandomGrid(cols, rows);
    grid[thePlayer.y][thePlayer.x] = PLAYER;
  }
  if (key === "e"){
    grid = generateEmptyGrid(cols, rows);
    grid[thePlayer.y][thePlayer.x] = PLAYER;
  }
  if(key === "s"){
    movePlayer(thePlayer.x, thePlayer.y + 1);
  }
  if(key === "w"){
    movePlayer(thePlayer.x, thePlayer.y - 1);
  }
  if(key === "a"){
    movePlayer(thePlayer.x - 1, thePlayer.y);
  }
  if(key === "d"){
    movePlayer(thePlayer.x + 1, thePlayer.y);
  }
}

function movePlayer(x, y){
  if (x>= 0 && x< cols && y>=0 && y< rows && grid[y][x] === PATH){
    //previous position
    let oldX = thePlayer.x;
    let oldY = thePlayer.y;

    //move player to new location
    thePlayer.x = x;
    thePlayer.y = y;

    //add player to grid
    grid[thePlayer.y][thePlayer.x] = PLAYER;

    //reset the old location to open tile
    grid[oldY][oldX] = PATH;
  }
}
function generateEmptyGrid(cols, rows){
  let newGrid = [];

  for(let y = 0; y < rows; y ++){
    newGrid.push([]);
    for(let x = 0; x < cols; x++){
      newGrid[y].push (PATH);
    }
  }
  return newGrid;
}
