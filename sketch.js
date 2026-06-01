// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"
//TO DO:
// add health bar, fix graphics



const CELL_SIZE = 20;
const PATH = 0;
const BUILDING = 1;
let grid;
let rows;
let cols;
let thePlayer;
let exit;
let start;
let pathimg;
let zombies = [];
let paused = false;
let spawnRate = 360; // frames
let screenMode = "start";
let timerActive = false;
let timeStart =  0;
let timePassed;
let health = 3;
let zombiesKilled = 0;

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
      if (grid[y][x] === PATH && dist(x, y, thePlayer.x, thePlayer.y) > 10) {
        this.x = x;
        this.y = y;
        found = true;
        break;//stop the loop because a spawn point was found
      }
    }

    // if it cant find a spawn point it will just spawn at origin 
    if (!found) {
      console.log("zombies failed to spawn");
    }

    this.finder = new PF.AStarFinder({
      allowDiagonal: false
    });
  }

  display(){
    fill("green");

    rect(this.x*CELL_SIZE, this.y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }

  move(){
    if (!grid || !grid[0]) {
      return;
    }

    if (this.x < 0 || this.x >= cols || this.y < 0 || this.y >= rows){
      return;
    }
    if (thePlayer.x < 0 || thePlayer.x >= cols || thePlayer.y < 0 || thePlayer.y >= rows){
      return;
    }

    let pfGrid = new PF.Grid(cols, rows);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        pfGrid.setWalkableAt(x, y, grid[y][x] === PATH);
      }
    }

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
    else{//nowhere to go despawn
      this.attacked();
      zombies.push(new Zombie());
    }
  }

  attacked(){
    let index = zombies.indexOf(this);

    if (index !== -1){
      zombies.splice(index, 1);
    }
  }
}


// function preload(){
//   pathimg = loadImage("pathimg.png");
// }

function setup() {
  createCanvas(windowWidth, windowHeight);
  restart();
}

function draw() {
  screens();
}

function screens(){
  if(screenMode=== "start"){
    background(100);
    textAlign(CENTER);
    textSize(100);
    text(`Zombie Apocolypse`, width/2, height/2);
    buttons("start");
  }

  if(screenMode === "play"){
    timerStart();
    background(220);
    displayGrid();
    displayTimer();
    healthBar();
    
    if (!paused){
      if(frameCount % 30 === 0 ){
        for(let z of zombies){
          z.move();
        }
      }
    }

    if(frameCount % spawnRate === 0){
      zombies.push(new Zombie());
    }
    if(frameCount % 600 === 0 && spawnRate > 30){
      spawnRate -= 10;
    }

    for (let z of zombies) {
      z.display();
    }

    for (let z of zombies){
      if (z.x === thePlayer.x && z.y === thePlayer.y){
        health -= 1;
        z.attacked();
        if(health <= 0){
          screenMode = "endLose"; // restart game
          return;
        }
      }
    }

    if(thePlayer.x === exit.x && thePlayer.y === exit.y){
      screenMode = "endWin";
      return;
    }

    console.log(thePlayer.x, thePlayer.y);
  }

  if(screenMode === "endLose"){
    timerActive = false;
    background(100);
    textAlign(CENTER);
    textSize(100);
    fill("red");
    text(`Game Over
        You Lose`, width/2, height/2);

  }

  if(screenMode === "endWin"){
    timerActive = false;
    background(100);
    textAlign(CENTER);
    textSize(100);
    fill("green");
    text(`Game Over
        You Win`, width/2, height/2);
  }
}

function buttons(button){
  if(button === "start"){
    let startX = width/2;
    let startY = height/2 + 50;
    rectMode(CENTER);
    fill("blue");
    rect(startX, startY, 100, 50);
    textAlign(CENTER);
    fill("white");
    text('start', startX, startY);
    if(mouseX<= startX + 50 && mouseX >= startX - 50 && mouseY <= startY + 25 && mouseY >= startY -25){
      screenMode = "play";
      return;
    }
  }
}

function timerStart(){
  if (!timerActive) {
    timeStart = millis(); // Start the timer right now
    timerActive = true;
  }
  timePassed = round((millis() - timeStart)/ 1000);
}

function displayTimer(){
  let timerX = width - 100;
  let timerY = 30;
  fill("red");
  rect(timerX, timerY, 50, 30);
  fill("black");
  textSize(CELL_SIZE);
  text(`${timePassed}`, timerX, timerY+ CELL_SIZE/2);
}

function healthBar(){
  let healthX = width - 200;
  let healthY = 30;
  for(let i = 0; i < 3; i++){
    if (i < health){
      fill("yellow");
    }
    else{
      fill("grey");
    }
    circle(healthX + i * 25, healthY, CELL_SIZE);
  }
}

function displayKills(){
  let killsX = width - 100;
  let killsY = 60;
  fill(green);
  rect(killsX, killsY, 50, 30);
  fill////////
}


function displayGrid(){
  for (let y = 0; y < rows; y++){
    for (let x = 0; x < cols; x++){
      if (grid[y][x] === BUILDING){
        fill("black");
        rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      if (grid[y][x] === PATH){
        // image(pathimg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        fill(180);
        rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
  drawPlayer(thePlayer.x, thePlayer.y);
}

//if path generation is currently in the window
function inBounds(x, y){
  return x >= 0 && x < cols && y >= 0 && y < rows;
}

function toggleGrid(){
  let pathGrid = [];

  for(let y = 0; y< rows; y++){
    pathGrid[y] = [];
    for(let x = 0; x< cols; x++){
      pathGrid[y][x] = grid[y][x];
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
  grid[exit.y][exit.x] = PATH;
  grid[start.y][start.x] = PATH;
}

function pathToExit(){
  let x = 1;
  let y = 1;

  while(x !== exit.x || y !== exit.y){
    grid[y][x] = PATH;

    if (random() < 0.5 && x < exit.x){
      x++;
    } 
    else if (y < exit.y){
      y++;
    }
  }
  grid[y][x] = PATH;
  grid[exit.y][exit.x] = PATH;
  grid[start.y][start.x] = PATH;
}

function addLoops(){
  let chance = 15;
  for (let y = 1; y < rows-1; y++){
    for (let x = 1; x < cols-1; x++){

      if (grid[y][x] === BUILDING){

        let pathsAround = 0;

        if (inBounds(x, y+1) && grid[y+1][x] === PATH){
          pathsAround++;
        }

        if (inBounds(x, y-1) && grid[y-1][x] === PATH){
          pathsAround++;
        }

        if (inBounds(x+1, y) && grid[y][x+1] === PATH){
          pathsAround++;
        }

        if (inBounds(x-1, y) && grid[y][x-1] === PATH){
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
  for (let x = 1; x < cols-1; x++){
    newGrid[0][x] = BUILDING;
    newGrid[rows-1][x] = BUILDING;
  }

  // left and right walls
  for (let y = 1; y < rows-1; y++){
    newGrid[y][0] = BUILDING;
    newGrid[y][cols-1] = BUILDING;
  }

  // reopen start and exit
  newGrid[1][1] = PATH;
  newGrid[rows-2][cols-2] = PATH;
  return newGrid;
}


function keyPressed(){
  console.log("key pressed");
  if(key === "p"){
    paused = !paused;
    return;
  }
  
  // dont let any other buttons get pressed while paused
  if(paused){
    return;
  }
  
  //start play 
  if(key === "1"){
    restart();
    screenMode = "play";
    return;
  }

  //empty grid 
  if (key === "e"){
    grid = generateEmptyGrid(cols, rows);
   
  }

  //move down
  if(key === "s"){
    movePlayer(thePlayer.x, thePlayer.y + 1);
  }

  //move up
  if(key === "w"){
    movePlayer(thePlayer.x, thePlayer.y - 1);
  }

  //move left
  if(key === "a"){
    movePlayer(thePlayer.x - 1, thePlayer.y);
  }

  //move right
  if(key === "d"){
    movePlayer(thePlayer.x + 1, thePlayer.y);
  }
}

//draw the player as it moves
function drawPlayer(x,y){
  fill("red");
  rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

//use this to move the player using keys
function movePlayer(x, y){
  if (!inBounds(x, y)) {
    return;
  }
  console.log("trying move to:", x, y);

  console.log("tile value:", grid[y][x]);
  if (grid[y][x] === PATH){
    let oldX = thePlayer.x;
    let oldY = thePlayer.y;
    

    thePlayer.x = x;
    thePlayer.y = y;
    
    drawPlayer(thePlayer.x, thePlayer.y);
    displayGrid();
    console.log(oldX, oldY);
    console.log(thePlayer.x, thePlayer.y);
  }
}

//if i need to test
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

//use this to start and restart the whole game
function restart(){
  zombies = [];

  health = 3;
  timerActive = false;
  timePassed = 0;
  rows = Math.floor(height/CELL_SIZE);
  cols = Math.floor(width/CELL_SIZE);
  exit = { 
    x: cols-2, 
    y: rows-2,
  };
  start = {
    x: 1,
    y: 1
  };
  thePlayer = {
    x: start.x,
    y: start.y
  };

  grid = generateRandomGrid(cols, rows);
    
  // add player to grid
  pathToExit();
  pathFromPlayer(1000);
  addLoops();
  toggleGrid();
    
  for (let i = 0; i < 3; i++) {
    zombies.push(new Zombie());
  }

  grid[exit.y][exit.x] = PATH;
  grid[start.y][start.x] = PATH;

  for (let y = 0; y < rows; y++){

    if (!grid[y]){
      console.log("Missing row:", y);
    }

    else if (grid[y].length !== cols){
      console.log("Bad row length:", y);
    }
  }
}

//kill zombie
function mousePressed(){
  for(let i = zombies.length - 1; i >= 0; i--){

    let z = zombies[i];
    let zx = z.x * CELL_SIZE;
    let zy = z.y * CELL_SIZE;
    if(dist(z.x, z.y, thePlayer.x, thePlayer.y) < CELL_SIZE*5 &&
    mouseX <= zx + CELL_SIZE &&
    mouseX >= zx &&
    mouseY <= zy + CELL_SIZE &&
    mouseY >= zy){

      z.attacked();
      zombiesKilled ++; 

      break;
    }
  }
}

