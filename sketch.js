// Zombie Apocalypse
// Audrey DesChamp
//
// Extra for Experts:
// - pathfinding.js
// - map generation
// - OOP stuff for attacking zombies and kill display
// - timer functions


//  ---------- CONSTANTS  ---------- 
const CELL_SIZE = 20; // size of map cells
const PATH = 0; // passable
const BUILDING = 1; // impassable
const PLANTS = 2; // impassable
const BIGTEXT = 80;
const MEDTEXT = 50;
const SMALLTEXT = 25;

//  ---------- VARIABLES  ---------- 
let grid; //game grid for map generation
let rows; // rows in grid
let cols; // columns in grid
let thePlayer; // x and y coords of player
let exit; // x and y coors of exit(win point)
let start; // spawn point of player
let startimg; // start screen image
let endimg; // end screen image
let pathimg; // path image
let buildingimg; // building image
let zombieimg; // zombie image
let plantsimg; // plants image
let zombies = []; // zombies array
let plants = []; // plants array
let paused = false; // game is not paused
let pauseStart = 0; // what time the game is paused
let totalPausedTime = 0; // how long the game is paused
let spawnRate = 360; // how often zombies will spawn
let screenMode = "start"; // start game on the start screen
let timerActive = false; // timer not on when game starts
let timeStart =  0; // run time that the timer starts
let timePassed; // how long the timer has been on since it started
let health = 3; // player health at start of game
let zombiesKilled = 0; // amount of zombies player has killed

//  ---------- ALL CLASS FUNCTIONS -----------
class Zombie{ //ZOMBIE CLASS
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

  display(){ // display zombies
    image(zombieimg, this.x*CELL_SIZE, this.y*CELL_SIZE);
  }

  move(){ // move zombies
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

    let path = this.finder.findPath(  //PATHFINDING
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
    else{//nowhere to go despawn and make new zombie
      this.attacked();
      zombies.push(new Zombie());
    }
  }

  attacked(){ // zombie despawn
    let index = zombies.indexOf(this);

    if (index !== -1){
      zombies.splice(index, 1);
    }
  }
}

class Plant{ //PLANT CLASS
  constructor(){
    this.x = floor(random(cols));
    this.y = floor(random(rows));
    this.size = CELL_SIZE;

  }

  display(){ // display plants
    fill("green");
    image(plantsimg, this.x * CELL_SIZE, this.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
}


// ---------- ALL IMAGES ------------
function preload(){ 
  startimg = loadImage("startscreen.png");
  endimg = loadImage("endscreen.png");
  pathimg = loadImage("pathimg1.png");
  buildingimg = loadImage("buildingimg1.png");
  zombieimg = loadImage("zombie.png");
  plantsimg = loadImage("plant.jpg");
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


// ---------- ALL OF SCREEN STUFF ---------- 
function screens(){
  if(screenMode=== "start"){ //START GAME
    background(startimg);
    fill("white");
    textAlign(CENTER);
    textSize(BIGTEXT);
    text(`Zombie Apocolypse`, width/2, height/2);
    buttons("start");
    displayInstructions();
  }
  
  if(screenMode === "play"){// PLAY GAME
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

    if (!paused){ // if unpaused
      if(frameCount % 30 === 0 ){
        for(let z of zombies){
          z.move();
        }
      }

      if(frameCount % spawnRate === 0){
        zombies.push(new Zombie());
      }
  
      if(frameCount % 600 === 0 && spawnRate > 30){
        spawnRate -= 20;
      }

      if (frameCount % 300 === 0 && timePassed > 10){
        plants.push(new Plant());
      }
      
      if(frameCount % 100 === 0 && timePassed > 20){
        plants.push(new Plant());
      }
    }

    for (let z of zombies) {
      z.display();
    }

    for(let p of plants){
      grid[p.y][p.x] = BUILDING;
      p.display();
    }

    for (let z of zombies){
      if (z.x === thePlayer.x && z.y === thePlayer.y){
        health -= 1;
        z.attacked();
        if(health <= 0){
          screenMode = "endLose"; 
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

  if(screenMode === "endLose"){ //LOSE GAME
    timerActive = false;
    background(endimg);
    textAlign(CENTER);
    textSize(BIGTEXT);
    fill("yellow");
    text(`GAME OVER
You Lose`, width/2, height/2 - 100);
    textSize(SMALLTEXT);
    text(`You lost in ${timePassed} seconds
You killed ${zombiesKilled} zombies`, width/2, height/2 + 100);
    buttons("restart");
  }

  if(screenMode === "endWin"){ //WIN GAME
    timerActive = false;
    background(endimg);
    textAlign(CENTER);
    textSize(BIGTEXT);
    fill("green");
    text(`GAME OVER
You Win`, width/2, height/2 - 100);
    textSize(SMALLTEXT);
    text(`You won in ${timePassed} seconds
      You killed ${zombiesKilled} zombies`, width/2, height/2 + 100);
    buttons("restart");
  }
}


// ---------- ALL OF GRID GENERATOR FUNCTIONS----------
function generateRandomGrid(cols, rows){ // GENERATE ORIGINAL GRID WITH PATHS AND BUILDINGS
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

function displayGrid(){ // MAP GRID DISPLAY
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

function inBounds(x, y){ //PATH GENERATION CURRENTLY IN WINDOW
  return x >= 0 && x < cols && y >= 0 && y < rows;
}

function pathFromPlayer(steps){ // RANDOMLY GROW PATH
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

function toggleGrid(){ // EXPAND EXISTING PATHS
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

function pathToExit(){ // GUARANTEED ROUTE FROM START TO EXIT
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

function addLoops(){ //EXPAND PATHS EVEN MORE
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


//  ---------- ALL BUTTONS AND OTHER ITEMS TO DISPLAY  ---------- 
function buttons(button){ //START AND RESET BUTTONS
  if(button === "start"){
    let startX = width/2;
    let startY = height/2 + 100;
    rectMode(CENTER);
    fill("blue");
    rect(startX, startY, 200, 100);
    textAlign(CENTER);
    fill("white");
    textSize(SMALLTEXT);
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
    let restartW = 50;
    let restartH = 25;
    let restartrecW = 200;
    let restartrecH = 100;
    rectMode(CENTER);
    fill("red");
    rect(restartX, restartY, restartrecW, restartrecH);
    textAlign(CENTER);
    fill("white");
    textSize(SMALLTEXT);
    text('restart', restartX, restartY);
    if(mouseX<= restartX + restartW &&
      mouseX >= restartX - restartW &&
      mouseY <= restartY + restartH &&
      mouseY >= restartY - restartH){
      restart();
      screenMode = "play";
      return;
    }
  }
}

function displayInstructions(){ // INSTRUCTIONS BUTTON
  let instrX = 50;
  let instrY = 50;
  let instrText = 10;
  let instrrectW = 500;
  let instrrecH = 250;
  textAlign(LEFT);
  textSize(SMALLTEXT);
  text("Instructions", instrX, instrY);
  if(mouseX<= instrX + 400 && mouseX >= instrX && mouseY <= instrY + 50 && mouseY >= instrY){
    rectMode(CORNER);
    fill("black");
    rect(instrX + instrText, instrY + instrText, instrrectW, instrrecH);
    textSize(instrText);
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

-press 1 to reset game in an emergency`, instrX + instrText, instrY + instrText * 2);
  }
}

function timerStart(){ // TIMER MATH
  if (!timerActive) {
    timeStart = millis(); // Start the timer right now
    timerActive = true;
  }
  if(!paused){
    timePassed = round((millis() - timeStart - totalPausedTime)/ 1000);
  }
}

function displayTimer(){ // TIMER DISPLAY
  rectMode(CENTER);
  let timerX = width - 100;
  let timerY = 30;
  fill(51, 60, 97);
  rect(timerX, timerY, 50, 30);
  fill(187, 198, 242);
  textSize(SMALLTEXT);
  textAlign(CORNER);
  text(`${timePassed}`, timerX - CELL_SIZE/2, timerY + CELL_SIZE/2);
}

function healthBar(){ // HEALTH BAR
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

function displayKills(){ //KILLS DISPLAY
  rectMode(CENTER);
  let killsX = width - 100;
  let killsY = 80;
  fill(6, 79, 34);
  rect(killsX, killsY, 50, 30);
  fill(221, 235, 226);
  textSize(SMALLTEXT);
  text(`${zombiesKilled}`, killsX - CELL_SIZE/2, killsY + CELL_SIZE/2);
}


//  ----------  ALL KEY FUNCTIONS  ---------- 
function keyPressed(){ 
  console.log("key pressed");

  //toggle pause
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


//  ---------- ALL PLAYER FUNCTIONS  ---------- 
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


//  ---------- TESTING  ---------- 
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


//  ---------- RESTART ALL GAME FUNCTIONS  ---------- 
function restart(){
  zombies = [];
  plants = [];

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



