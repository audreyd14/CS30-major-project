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
let exit;
let pathimg;

function preload(){
  pathimg = loadImage("pathimg.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rows = Math.floor(height/CELL_SIZE);
  cols = Math.floor(width/CELL_SIZE);
  grid = generateRandomGrid(cols, rows);
  exit = { 
    x: cols-1, 
    y: rows-1,
  };

  grid[exit.y][exit.x] = PATH;
  // add player to grid
  pathToExit();
  pathFromPlayer(500);
  addLoops();
  toggleGrid();
  grid[thePlayer.y][thePlayer.x] = PLAYER;
}

function draw() {
  background(220);
  displayGrid();
  restart();
}

function displayGrid(){
  for (let y = 0; y < rows; y++){
    for (let x = 0; x < cols; x++){
      if (grid[y][x] === BUILDING){
        fill("black");
        rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
      }
      if (grid[y][x] === PATH){
        image(pathimg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      if(grid[y][x] === PLAYER){
        fill("red");
        rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
      }
    }
  }
}


function inBounds(x, y){
  return x >= 0 && x < cols && y >= 0 && y < rows;
}

function toggleGrid(){
  let pathGrid = [];

  for(let y = 0; y< rows; y++){
    pathGrid.push([]);
    for(let x = 0; x< cols; x++){
      pathGrid[y].push(grid[y][x]);
    }
  }

  for(let y = 0; y<rows; y++){
    for(let x = 0; x< cols; x++){
      if (grid[y][x] === PATH){
        let directions = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ];

        for (let dir of directions){
          let newx = x + dir[0];
          let newy = y + dir[1];
      
          if (inBounds(newx, newy) && random(100) < 22){
            pathGrid[newy][newx] = PATH;
          }
        }
      }
    }
  }
  grid = pathGrid;
}

function pathFromPlayer(steps){
  for (let i = 0; i < steps; i++){
    let x = Math.floor(random(cols));
    let y = Math.floor(random(rows));

    // only grow from existing paths
    if (grid[y][x] === PATH){
      let directions = [[1,0],[-1,0],[0,1],[0,-1]];
      let d = random(directions);

      let newx = x + d[0];
      let newy = y + d[1];

      if (inBounds(newx, newy)){
        grid[newy][newx] = PATH;
      }
    }
  }
}

function pathToExit(){
  let x = 0;
  let y = 0;

  while(x !== exit.x || y !== exit.y){
    grid[y][x] = PATH;

    if (random() < 0.7 && x < cols-1){
      x++;
    } 
    else if (y < rows-1){
      y++;
    }
  }
}

function addLoops(){
  let chance = 15;
  for (let y = 1; y < rows-1; y++){
    for (let x = 1; x < cols-1; x++){

      if (grid[y][x] === BUILDING){

        let pathsAround = 0;

        if (grid[y+1][x] === PATH) {
          pathsAround++;
        } 
        if (grid[y-1][x] === PATH) {
          pathsAround++;
        } 
        if (grid[y][x+1] === PATH) {
          pathsAround++;
        } 
        if (grid[y][x-1] === PATH) {
          pathsAround++;
        } 

        // if a building is between paths, sometimes remove it
        if (pathsAround >= 2 && random(100) < chance){
          grid[y][x] = PATH;
        }
      }
    }
  }
}

function generateRandomGrid(cols, rows){
  let newGrid = [];

  for(let y = 0; y < rows; y ++){
    newGrid.push([]);
    for(let x = 0; x < cols; x++){
      if(random(100) < 25 ){
        newGrid[y].push(PATH);
      }
      
      else {
        newGrid[y].push(BUILDING);
      }
    }
  }
  return newGrid;
}


function keyPressed(){
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
      newGrid[y].push(PATH);
    }
  }
  return newGrid;
}

function restart(){
  if(thePlayer.x === exit.x && thePlayer.y === exit.y){
    rows = Math.floor(height/CELL_SIZE);
    cols = Math.floor(width/CELL_SIZE);
    grid = generateRandomGrid(cols, rows);
    exit = { 
      x: cols-1, 
      y: rows-1,
    };

    grid[exit.y][exit.x] = PATH;
    // add player to grid
    pathToExit();
    pathFromPlayer(500);
    addLoops();
    toggleGrid();
    
    thePlayer.x = 0;
    thePlayer.y = 0;
    grid[thePlayer.y][thePlayer.x] = PLAYER;
  }
}
