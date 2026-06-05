// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"
//TO DO:
// FIX ERRORS WITH PLANTS



const CELL_SIZE = 20;
const PATH = 0;
const BUILDING = 1;
const PLANTS = 2;
let grid;
let rows;
let cols;
let thePlayer;
let exit;
let start;
let pathimg;
let buildingimg;
let zombieimg;
let zombies = [];
let paused = false;
let pauseStart = 0;
let totalPausedTime = 0;
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
    image(zombieimg, this.x*CELL_SIZE, this.y*CELL_SIZE);
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


function preload(){
  pathimg = loadImage("pathimg1.png");
  buildingimg = loadImage("buildingimg1.png");
  zombieimg = loadImage("zombie.png");
  font = loadFont("pcsenior.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  restart();
  textFont(font);
}

function draw() {
  screens();
}

function screens(){
  if(screenMode=== "start"){
    background(100);
    fill("white");
    textAlign(CENTER);
    textSize(80);
    text(`Zombie Apocolypse`, width/2, height/2);
    buttons("start");
    displayInstructions();
  }
  
  if(screenMode === "play"){
    timerStart();
    background(220);
    displayGrid();
    displayTimer();
    healthBar();
    displayKills();

    //show end
    rectMode(CORNER);
    fill("yellow");
    rect(exit.x * CELL_SIZE, exit.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    if (!paused){
      if(frameCount % 30 === 0 ){
        for(let z of zombies){
          z.move();
        }
      }
    }
    if (paused){

    }

    if(frameCount % spawnRate === 0){
      zombies.push(new Zombie());
    }

    if(frameCount % 600 === 0 && spawnRate > 30){
      spawnRate -= 20;
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

    if (frameCount % 300 === 0) {
      growPlants();
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
    textSize(80);
    fill("red");
    text(`GAME OVER
You Lose`, width/2, height/2 - 100);
    textSize(30);
    text(`You lost in ${timePassed} seconds
You killed ${zombiesKilled} zombies`, width/2, height/2 + 100);
    buttons("restart");
  }

  if(screenMode === "endWin"){
    timerActive = false;
    background(100);
    textAlign(CENTER);
    textSize(80);
    fill("green");
    text(`GAME OVER
You Win`, width/2, height/2 - 100);
    textSize(30);
    text(`You won in ${timePassed} seconds
You killed ${zombiesKilled} zombies`, width/2, height/2 + 100);
    buttons("restart");
  }
}

function buttons(button){
  if(button === "start"){
    let startX = width/2;
    let startY = height/2 + 100;
    rectMode(CENTER);
    fill("blue");
    rect(startX, startY, 200, 100);
    textAlign(CENTER);
    fill("white");
    textSize(30);
    text('start', startX, startY);
    if(mouseX<= startX + 50 && mouseX >= startX - 50 && mouseY <= startY + 25 && mouseY >= startY -25){
      restart();
      screenMode = "play";
      return;
    }
  }

  if(button === "restart"){
    let restartX = width/2;
    let restartY = height/2 + 200;
    rectMode(CENTER);
    fill("red");
    rect(restartX, restartY, 200, 100);
    textAlign(CENTER);
    fill("white");
    textSize(25);
    text('restart', restartX, restartY);
    if(mouseX<= restartX + 50 && mouseX >= restartX - 50 && mouseY <= restartY + 25 && mouseY >= restartY -25){
      restart();
      screenMode = "play";
      return;
    }
  }
}

function displayInstructions(){
  let instrX = 50;
  let instrY = 50;
  textAlign(LEFT);
  textSize(30);
  text("Instructions", instrX, instrY);
  if(mouseX<= instrX + 400 && mouseX >= instrX && mouseY <= instrY + 50 && mouseY >= instrY){
    rectMode(CORNER);
    fill("black");
    rect(instrX + 10, instrY + 10, 500, 250);
    textSize(10);
    fill("green");
    text(`-WASD to move Player(red square)

-press P to pause game

-reach the yellow square to win

-walk on grey paths

-look out for zombies

-click on nearby zombies to kill them

-3 pink circles are your health

-blue rectangle is your time

-green rectangle is your zombie kill count

-press 1 to reset game in an emergency`, instrX + 10, instrY + 20);
  }
}

function timerStart(){
  if (!timerActive) {
    timeStart = millis(); // Start the timer right now
    timerActive = true;
  }
  if(!paused){
    timePassed = round((millis() - timeStart - totalPausedTime)/ 1000);
  }
}

function displayTimer(){
  rectMode(CENTER);
  let timerX = width - 100;
  let timerY = 30;
  fill(51, 60, 97);
  rect(timerX, timerY, 50, 30);
  fill(187, 198, 242);
  textSize(CELL_SIZE);
  text(`${timePassed}`, timerX, timerY+ CELL_SIZE/2);
}

function healthBar(){
  let healthX = width - 200;
  let healthY = 30;
  for(let i = 0; i < 3; i++){
    if (i < health){
      fill(209, 52, 91);
    }
    else{
      fill(43, 0, 22);
    }
    circle(healthX + i * 25, healthY, CELL_SIZE);
  }
}

function displayKills(){
  rectMode(CENTER);
  let killsX = width - 100;
  let killsY = 80;
  fill(6, 79, 34);
  rect(killsX, killsY, 50, 30);
  fill(221, 235, 226);
  textSize(CELL_SIZE);
  text(`${zombiesKilled}`, killsX, killsY + 10);
}


function displayGrid(){
  for (let y = 0; y < rows; y++){
    for (let x = 0; x < cols; x++){
      rectMode(CORNER);
      if (grid[y][x] === BUILDING){
        image(buildingimg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      if (grid[y][x] === PATH){
        image(pathimg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // fill(180);
        // rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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
    if(paused === true){
      pauseStart = millis();
    }

    else{
      totalPausedTime += millis() - pauseStart;
    }
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

  timerActive = false;
  timePassed = 0;
  pauseStart = 0;
  totalPausedTime = 0;
  health = 3;
  zombiesKilled = 0;
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
}

//kill zombie
function mousePressed(){
  for(let i = zombies.length - 1; i >= 0; i--){

    let z = zombies[i];
    let zx = z.x * CELL_SIZE;
    let zy = z.y * CELL_SIZE;
    let px = thePlayer.x * CELL_SIZE;
    let py = thePlayer.y * CELL_SIZE;
    if(dist(zx, zy, px, py) < CELL_SIZE*2 &&
      dist(mouseX, mouseY, zx, zy ) < CELL_SIZE*2 && dist(mouseX, mouseY, px, py) < CELL_SIZE*2){

      z.attacked();
      zombiesKilled ++; 
      console.log("Kills:", zombiesKilled);
      break;
    }
  }
}

function growPlants() {
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {

      if (grid[y][x] === PATH) {

        let nearBuilding = false;

        let directions = [
          [1,0], [-1,0],
          [0,1], [0,-1]
        ];

        for (let d of directions) {
          let nx = x + d[0];
          let ny = y + d[1];

          if (grid[ny][nx] === BUILDING) {
            nearBuilding = true;
          }
        }

        if (nearBuilding && random(100) < 2) {
          grid[y][x] = PLANTS;
        }

        displayPlants();
      }
    }
  }
}

function displayPlants(){
  if (grid[y][x] === PLANTS) {
    fill("green");
    rect(x *CELL_SIZE, y *CELL_SIZE, CELL_SIZE, CELL_SIZE);
    // image(overgrownPathImg,
    //       x * CELL_SIZE,
    //       y * CELL_SIZE,
    //       CELL_SIZE,
    //       CELL_SIZE);
  }
}