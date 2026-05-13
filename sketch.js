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
let grid;
let rows;
let cols;
let thePlayer = {
  x:0,
  y:0,
};
let exit;
let pathimg;
let zombies = [];

class Zombie{
  constructor(){
    //find a place to spawn
    let found = false;

    // try to find a valid spawn tile
    for (let attempt = 0; attempt < 1000; attempt++) {
    // pick random tile 
      let x = floor(random(cols));
      let y = floor(random(rows));
      //if tile is path then its a valid spawn point
      if (grid[y][x] === PATH && !(x === thePlayer.x && y === thePlayer.y)) {
        this.x = x;
        this.y = y;
        found = true;
        break;//stop the loop because a spawn point was found
      }
    }

    // if it cant find a spawn point it will just spawn at origin 
    if (!found) {
      this.x = 1;
      this.y = 1;
    }

    this.finder = new PF.AStarFinder();
  }

  display(){
    fill("green");

    rect(this.x*CELL_SIZE, this.y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }

  move(){
    let pfGrid = new PF.Grid(grid);

    let path = this.finder.findPath(
      this.x,
      this.y,
      thePlayer.x,
      thePlayer.y,
      pfGrid
    );

    //move 1 step
    if(path.length > 1){

      this.x = path[1][0];
      this.y = path[1][1];
    }
  }
}

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
  
  for (let i = 0; i < 5; i++) {
    zombies.push(new Zombie());
  }
  
}

function draw() {
  background(220);
  displayGrid();
  
  if(frameCount % 15 === 0){
    for(let z of zombies){
      z.move();
    }
  }
  for (let z of zombies) {
    z.display();
  }
  for (let z of zombies){
    if (z.x === thePlayer.x && z.y === thePlayer.y){
      setup(); // restart game
    }
  }

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
    }
  }
  fill("red");
  rect(thePlayer.x * CELL_SIZE, thePlayer.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

//if path generation is currently in the window
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
      
          if (inBounds(newx, newy) && newx > 0 && newx < cols-1 && newy > 0 && newy < rows-1 && random(100) < 22){
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

    if (random() < 0.5 && x < cols-1){
      x++;
    } 
    else if (y < rows-1){
      y++;
    }
  }
  grid[y][x] = PATH;
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
  // top and bottom walls
  for (let x = 0; x < cols; x++){
    newGrid[0][x] = BUILDING;
    newGrid[rows-1][x] = BUILDING;
  }

  // left and right walls
  for (let y = 0; y < rows; y++){
    
    newGrid[y][0] = BUILDING;
    newGrid[y][cols-1] = BUILDING;
  }

  // reopen start and exit
  newGrid[0][0] = PATH;
  newGrid[rows-1][cols-1] = PATH;
  return newGrid;
}


function keyPressed(){
  if (key === "e"){
    grid = generateEmptyGrid(cols, rows);
   
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
  if ( x >= 0 && x < cols && y >= 0 && y < rows && grid[y][x] === PATH){
    thePlayer.x = x;
    thePlayer.y = y;
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
   
    zombies = [];

    for (let i = 0; i < 5; i++) {
      zombies.push(new Zombie());
    }
  }
}