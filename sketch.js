// Define the number of columns, rows, and width of each square on the 2D grid
let cols = 10,
  rows,
  w;

// "cols" is the number of columns, "rows" is the number of rows, and "w" is the width of each square on the 2D grid.
let grid; // 2D array to represent the grid
let totalMines, mines; // The number of mines on the grid
let canvasVisible = "landing"; // Variable determining what is shown on the screen
let videoPlayed = false; // Variable determining when the explosion video will be played (indicating loss)
let gameIsOver = false,
  gamewon = false,
  rebtn; // Variables related to game state and restart button
let landing; // Landing page content
let revealButtons,
  lives = 3; // Array of 'Random Reveal' buttons and lives counter
let totalFound = 0,
  alrFound; // The number of safe squares found
let flagImg; // Image of flag
let millisTime,
  speedrunMillis,
  startMillis,
  countDown,
  timeLimit,
  endMillis,
  speedrunEndMillis,
  alrMillis = false,
  timedMode = false; // Variables for timed game & speedrun mode
let bestEasy, bestNormal, bestHard; //Variables for best time in speedrun mode
let speedrun = false; //Variable for speedrun mode
let wh, ww; //windowWidth and windowHeight variables
let difficulty; // Variable for difficulty

function preload() {
  // Load the flag image
  flagImg = loadImage("minesweeper-flag.png");
}

function setup() {
  // Disable the right-click context menu popup for p5 canvas
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (rightClickMenu) =>
      rightClickMenu.preventDefault()
    );
  }
  // Calculate the width of each square based on the number of columns
  w = 493 / cols;
  // Calculate number of rows based on height of screen
  rows = round((windowHeight - 100) / w);
  // WindowWidth and windowHeight based on screen size
  ww = (windowWidth - 493) / 2;
  wh = windowHeight;
  if (ww < 0) {
    ww = 0;
  }
  // Postioning of all images/buttons/sliders/video/canvas based on size of viewport
  let mine1 = document.getElementById("minefield1");
  mine1.style.width = ww + "px";
  mine1.style.height = wh + "px";
  let mine2 = document.getElementById("minefield2");
  mine2.style.width = ww + "px";
  mine2.style.height = wh + "px";
  mine2.style.left = ww + 493 + "px";
  document.getElementById("ezbtn").style.left = 101.5 + ww + "px";
  document.getElementById("normbtn").style.left = 201.5 + ww + "px";
  document.getElementById("hardbtn").style.left = 326.5 + ww + "px";
  document.getElementById("rebtn").style.left = 186.5 + ww + "px";
  document.getElementById("timedModeBtn").style.left = 70 + ww + "px";
  document.getElementById("speedrunModeBtn").style.left = 250 + ww + "px";
  document.getElementById("livesSlider").style.left = 144.5 + ww + "px";
  document.getElementById("timedModeSlider").style.left = 144.5 + ww + "px";
  let random1 = document.getElementById("revealButtons1");
  random1.style.top = height - 58 + "px";
  random1.style.left = 21.5 + ww + "px";
  let random2 = document.getElementById("revealButtons2");
  random2.style.top = height - 58 + "px";
  random2.style.left = 176.5 + ww + "px";
  let random3 = document.getElementById("revealButtons3");
  random3.style.top = height - 58 + "px";
  random3.style.left = 331.5 + ww + "px";
  select("canvas").style("margin-left", ww + "px");
  // Create a canvas with specified dimensions
  createCanvas(493, windowHeight);
  // Initialize the grid, place mines, calculate neighbors, and create reveal buttons
  createGrid();
  placeMines();
  calculateNeighbours();
  // Determines if a safe square has already been found
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].alrFound = false;
    }
  }
  bestEasy = getItem('bestEasy');
  bestNormal = getItem(`bestNormal`);
  bestEasy = getItem(`bestEasy`);
}

function draw() {
  // Setting the bests for each difficulty if it is the player's first time playing speedrun mode
    if (bestEasy == null) {
      bestEasy = "N.A.";
    }
    if (bestNormal == null) {
      bestNormal = "N.A.";
    }
    if (bestHard == null) {
      bestHard = "N.A.";
    }
  // Check the current canvas visibility to determine what to display
  if (canvasVisible == "landing") {
    // Display landing page content
    background("#778DA9");
    textFont("SixtyFour");
    fill("#E1E0DD");
    textSize(40);
    textAlign(CENTER);
    text("Minesweeper", width / 2, 50);
    textFont("Roboto");
    textSize(15);
    textAlign(LEFT);
    textWrap(WORD);
    // Display Minesweeper game instructions
    text(
      `Minesweeper is a logic puzzle where you unveil a hidden minefield. Imagine a grid of squares, some hiding sneaky mines, others safe. Left-click to cautiously open squares, and right-click to place a flag on a square which you suspect is a mine. When you left-click a square and it's safe, you'll see a number (1-8), revealing how many mines lurk nearby in the surrounding eight squares. Empty squares connected to that number automatically open, giving you a glimpse of the safe zone. Uncover all the safe squares, and you've conquered the minefield! There are three 'Random Reveal' buttons, which help you by revealing a random safe square. However, each button can only be used once. Use these buttons wisely. Additionally, you have a certain number of lives. When you click on a mine, the lives counter goes down. If you reach 0 lives left, BOOM! the minefield explodes and you lose! Remember, logic is key. Start small, use the numbers wisely, and don't get too greedy - too many wrong clicks can end your spree! Choose your preferred difficulty and begin by clicking the respective buttons - "Easy", "Normal", or "Hard". You can also choose a timed mode, where you have to win the game within a certain time, or a speedrun mode, where you try to beat the game as fast as you can!
Note: Mines are the coloured squares with a circle in the centre.`,
      15,
      75,
      width - 25
    );
    // Determine number of lives using lives slider
    lives = document.getElementById("livesSlider").value;
    text(`Number of lives: ${lives}`, 15, 475);
    // Showing slider for timed mode
    if (timedMode == true) {
      timeLimit = document.getElementById("timedModeSlider").value;
      text(`Time : ${timeLimit} seconds`, 15, 505);
    }
    // Showing text for speedrun mode
    if (speedrun == true) {
      textAlign(CENTER);
      text("You have chosen speedrun mode.", width / 2, 505);
      textAlign(LEFT);
      textSize(20);
      text("Best:", 30, 600);
      text(`${bestEasy} s`, 105, 600);
      text(`${bestNormal} s`, 210, 600);
      text(`${bestHard} s`, 335, 600);
      textSize(15);
    }
    totalFound = 0;
  } else if (canvasVisible == true) {
    // Display game grid, reveal buttons, and lives counter
    background("#29AB30");
    drawGrid();
    displayRevealButtons();
    displayLivesCounter();
    millisTime = round((millis() - startMillis) / 1000);
    speedrunMillis = round((millis() - startMillis) / 1000, 1);
    countDown = timeLimit - millisTime;
    if (countDown == 0 && gamewon == false && gameIsOver == false) {
      gameOver();
    }
  }
  // Display game over message and show restart button if game is over
  if (gameIsOver == true) {
      noStroke();
      fill("#778DA9");
      rect(width / 2 - 150, 150, 300, 100);
      fill("#E1E0DD");
      textSize(30);
      textAlign(CENTER, CENTER);
      text("Game Over!", width / 2, 175);
      showRestartButton();
  }
  // Display win message and show restart button if game is won
  if (speedrun == false && gamewon == true) {
    noStroke();
    fill("#778DA9");
    rect(width / 2 - 150, 150, 300, 100);
    fill("#E1E0DD");
    textSize(30);
    textAlign(CENTER, CENTER);
    text("You Won!", width / 2, 175);
    showRestartButton();
  } else if (speedrun == true && gamewon == true) {
  // Display win message, time taken, and best time, if game is won in speedrun mode
    noStroke();
    fill("#778DA9");
    rect(width / 2 - 200, 150, 400, 150);
    fill("#E1E0DD");
    textSize(30);
    textAlign(CENTER, CENTER);
    text("You Won!", width / 2, 175);
    textFont("Roboto");
    if (difficulty == "easy") {
      text(
        `Time: ${speedrunEndMillis}s | Best: ${bestEasy}s`,
         width / 2,
        225
      );
    } else if (difficulty == "normal") {
      text(
        `Time: ${speedrunEndMillis}s | Best: ${bestNormal}s`,
         width / 2,
        225
      );
    } else if (difficulty == "hard") {
      text(
        `Time: ${speedrunEndMillis}s | Best: ${bestHard}s`,
         width / 2,
        225
      );
    }
    document.getElementById("rebtn").style.top = "243px";
    showRestartButton();
    millisRecorder();
  }
}

// Function to create the initial grid
function createGrid() {
  grid = new Array(cols);
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j, w);
    }
  }
}

// Function to draw the grid
function drawGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }
}

// Function to randomly place mines on the grid
function placeMines() {
  let options = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      options.push([i, j]);
    }
  }

  for (let n = 0; n < totalMines; n++) {
    let index = floor(random(options.length));
    let choice = options[index];
    let i = choice[0];
    let j = choice[1];
    options.splice(index, 1);
    grid[i][j].mine = true;
  }
}
// Function to calculate the number of mines neighboring each cell
function calculateNeighbours() {
  // Loop through each cell in the grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Call the countMines function for each cell
      grid[i][j].countMines();
    }
  }
}

// Function to reveal a random safe square when a 'Random Reveal' button is pressed
function revealRandomSafeSquare(button) {
  // Check if there are remaining lives
  if (lives > 0) {
    let safeSquares = [];
    // Find all unrevealed and non-mine cells
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (!grid[i][j].mine && !grid[i][j].revealed) {
          safeSquares.push({ i, j });
        }
      }
    }

    // Check if there are safe squares available
    if (safeSquares.length > 0) {
      // Choose a random safe square and reveal it
      let randomIndex = floor(random(safeSquares.length));
      let { i, j } = safeSquares[randomIndex];
      grid[i][j].reveal();
      grid[i][j].flag = false;
    }
  }
}

// Function to display the 'Random Reveal' buttons
function displayRevealButtons() {
  // Display the 'Random Reveal' buttons on the webpage
  document.getElementById("revealButtons1").style.display = "inline-block";
  document.getElementById("revealButtons2").style.display = "inline-block";
  document.getElementById("revealButtons3").style.display = "inline-block";
}

// Function to display the lives counter and timed mode (if chosen)
function displayLivesCounter() {
  // Display the lives counter on the webpage
  if (timedMode == false && speedrun == false) {
    fill("#EAE0D5");
    textAlign(CENTER, CENTER);
    textSize(20);
    textFont("SixtyFour");
    text(`Lives: ${lives}`, width / 2, height - 75);
  } else if ((timedMode == true) & (speedrun == false)) {
    // Display timer and lives counter on the webpage
    if (gameIsOver == false && gamewon == false) {
      fill("#EAE0D5");
      textSize(17);
      textFont("SixtyFour");
      textAlign(CENTER, CENTER);
      text(`Timer: ${countDown}s | Lives: ${lives}`, width / 2, height - 75);
      console.log(gamewon);
    } else if (gameIsOver == true || gamewon == true) {
      fill("#EAE0D5");
      textSize(17);
      textFont("SixtyFour");
      textAlign(CENTER, CENTER);
      text(`Timer: ${endMillis}s | Lives: ${lives}`, width / 2, height - 75);
    }
  } else if (speedrun == true) {
    if (gameIsOver == false && gamewon == false) {
      fill("#EAE0D5");
      textSize(17);
      textFont("SixtyFour");
      textAlign(LEFT, CENTER);
      text(`Time:${speedrunMillis}s`, 75, height - 75);
      text(` | Lives: ${lives}`, 225, height - 75);
    } else if (gameIsOver == true || gamewon == true) {
      fill("#EAE0D5");
      textSize(17);
      textFont("SixtyFour");
      textAlign(LEFT, CENTER);
      text(`Time:${speedrunEndMillis}s`, 75, height - 75);
      text(` | Lives: ${lives}`, 225, height - 75);
      if (gamewon == true) {
        if (difficulty == "easy") {
          if (bestEasy == "N.A." || bestEasy > speedrunEndMillis) {
            storeItem(`bestEasy`, speedrunEndMillis);
            bestEasy = getItem(`bestEasy`);
            console.log(bestEasy)
          } 
        } else if (difficulty == "normal") {
          if (bestNormal == "N.A." || bestNormal > speedrunEndMillis) {
            storeItem(`bestNormal`, speedrunEndMillis);
            bestNormal = getItem(`bestNormal`);
          } 
        } else if (difficulty == "hard") {
          if (bestHard == "N.A." || bestHard > speedrunEndMillis) {
            storeItem(`bestHard`, speedrunEndMillis);
            bestHard = getItem(`bestHard`);
              }
            }
          }
        }
      }
    }
// MousePressed event handler
function mousePressed() {
  // Check if the mouse click is on the reveal buttons area
  if (mouseY > height - 100) {
    return; // Ignore clicks on reveal buttons
  }
  if (mouseButton == LEFT) {
    // Loop through each cell in the grid
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid[i][j].revealed) {
          grid[i][j].flag = false;
        }
        // Check if the mouse click is within the boundaries of the current cell
        if (grid[i][j].contains(mouseX, mouseY)) {
          // Check if the cell contains a mine
          if (
            grid[i][j].mine &&
            gameIsOver == false &&
            !grid[i][j].revealed &&
            grid[i][j].flag == false
          ) {
            // Decrement lives and trigger game over if lives reach zero
            lives--;
            grid[i][j].reveal();
            if (lives == 0) {
              gameOver();
            }
          } else if (grid[i][j].flag == false) {
            // Reveal the cell if it doesn't contain a mine
            grid[i][j].reveal();
          }
        }
        //Adding to the number of safe squares found
        if (grid[i][j].revealed) {
          if (grid[i][j].alrFound == false) {
            if (!grid[i][j].mine) {
              totalFound++;
            }
            grid[i][j].alrFound = true;
          }
          // Game win mechanism
          if (totalFound == cols * rows - totalMines && gameIsOver == false) {
            gamewon = true;
          }
        }
      }
    }
  } else if (mouseButton == RIGHT) {
    // Loop through each cell in the grid
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        // Check if the mouse click is within the boundaries of the current cell
        if (grid[i][j].contains(mouseX, mouseY) && gameIsOver == false) {
          // Flag placing mechanism
          if (grid[i][j].flag == false && !grid[i][j].revealed) {
            grid[i][j].flag = true;
          } else if (grid[i][j].flag == true) {
            grid[i][j].flag = false;
          }
        }
      }
    }
  }
}

// Cell class constructor
class Cell {
  constructor(i, j, w) {
    this.i = i;
    this.j = j;
    this.x = i * w;
    this.y = j * w;
    this.w = w;
    this.mine = false;
    this.revealed = false;
    this.neighbourCount = 0;
    this.mineR = random(225);
    this.mineG = random(127);
    this.mineB = random(225);
    this.flag = false;
  }

  // Function to display the cell
  show() {
    // Check if the game canvas is visible
    if (canvasVisible == true) {
      stroke(0);
      noFill();
      rect(this.x, this.y, this.w, this.w);
      fill("#1B263B");
      rect(0, w * rows, w * cols, height - rows * w);
      // Check if the cell is revealed
      if (this.revealed == true) {
        // Check if the cell contains a mine
        if (this.mine) {
          // Display mine with different colors
          fill(this.mineR + 30, this.mineG + 30, this.mineB + 30);
          rect(this.x, this.y, this.w, this.w);
          fill(this.mineR, this.mineG, this.mineB);
          ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
        } else {
          // Display different colors based on the number of neighboring mines
          fill("#E5C29F");
          rect(this.x, this.y, this.w, this.w);
          if (this.neighbourCount > 0) {
            // Display the number of neighboring mines
            if (this.neighbourCount == 1) {
              fill("#3ADFE8");
            } else if (this.neighbourCount == 2) {
              fill("#E9FA02");
            } else if (this.neighbourCount >= 3 && this.neighbourCount < 8) {
              fill("#E0312B");
            } else if (this.neighbourCount == 8) {
              fill("#FFFFFF");
            }
            // Display the number of neighboring mines
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(30);
            textFont("SixtyFour");
            text(
              this.neighbourCount,
              this.x + this.w * 0.5,
              this.y + this.w * 0.5
            );
          }
        }
      }
      // Placing flag down
      if (this.flag == true) {
        // Display flag image
        image(flagImg, this.x + 2, this.y + 2, this.w - 4, this.w - 4);
      }
    }
  }

  // Function to count the number of neighboring mines
  countMines() {
    if (this.mine) {
      this.neighbourCount = -1;
      return;
    }
    let total = 0;
    // Loop through neighboring cells
    for (let xoff = -1; xoff <= 1; xoff++) {
      for (let yoff = -1; yoff <= 1; yoff++) {
        let i = this.i + xoff;
        let j = this.j + yoff;
        // Check if neighboring cell is within the grid boundaries
        if (i > -1 && i < cols && j > -1 && j < rows) {
          let neighbour = grid[i][j];
          // Check if neighboring cell contains a mine
          if (neighbour.mine) {
            total++;
          }
        }
      }
    }
    this.neighbourCount = total;
  }

  // Function to reveal the cell
  reveal() {
    this.revealed = true;
    // Trigger flood fill if the cell has no neighboring mines
    if (this.neighbourCount == 0) {
      this.floodFill();
    }
  }

  // Function to recursively reveal neighboring cells with no mines
  floodFill() {
    for (let xoff = -1; xoff <= 1; xoff++) {
      for (let yoff = -1; yoff <= 1; yoff++) {
        let i = this.i + xoff;
        let j = this.j + yoff;
        // Check if neighboring cell is within the grid boundaries
        if (i > -1 && i < cols && j > -1 && j < rows) {
          let neighbour = grid[i][j];
          // Check if neighboring cell is not revealed
          if (!neighbour.revealed) {
            // Recursively reveal neighboring cell
            neighbour.reveal();
            neighbour.flag = false;
          }
        }
      }
    }
  }

  // Function to check if given coordinates are within the cell boundaries
  contains(x, y) {
    return (
      x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w
    );
  }
}
// Function to handle game over
function gameOver() {
  canvasVisible = false;
  // Display explosion video and set speed of the video
  if (!videoPlayed) {
    let vid = document.getElementById("explosionVideo");
    vid.style.display = "block";
    vid.play();
    vid.playbackRate = 2.5;
    videoPlayed = true;
    canvasVisible = false;
  }
  hideAll();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].flag = false;
    }
  }
  // Disable all 'Random Reveal' buttons
  document.getElementById("revealButtons1").disabled = "true";
  document.getElementById("revealButtons2").disabled = "true";
  document.getElementById("revealButtons3").disabled = "true";
  endMillis = countDown;
  speedrunEndMillis = speedrunMillis;
}

//Function to preserve timer when game is won
function millisRecorder() {
  if (alrMillis == false) {
    endMillis = countDown;
    speedrunEndMillis = speedrunMillis;
    alrMillis = true;
  }
}

// Function to hide all elements on the canvas
function hideAll() {
  fill(0);
  noStroke();
  rect(0, 0, 493, height);
  // Hide all 'Random Reveal' buttons & minefield photos
  document.getElementById("revealButtons1").style.display = "none";
  document.getElementById("revealButtons2").style.display = "none";
  document.getElementById("revealButtons3").style.display = "none";
  document.getElementById("minefield1").style.display = "none";
  document.getElementById("minefield2").style.display = "none";
}

// Function to show the game canvas
function showCanvas() {
  canvasVisible = true;
  // Hide explosion video
  document.getElementById("explosionVideo").style.display = "none";
  // Show minefield photos
  document.getElementById("minefield1").style.display = "inline-block";
  document.getElementById("minefield2").style.display = "inline-block";
  // Mark all cells as revealed and set game over state
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].revealed = true;
    }
  }
  gameIsOver = true;
}

// Function to restart the game by reloading the page
function restart() {
  window.location.reload();
  gameIsOver = false;
}

// Function to set up the game for easy difficulty
function easyDiff() {
  w = 50;
  cols = 8;
  let mines = round(rows * cols * 0.1);
  totalMines = mines;
  // Call the setup function to initialize the game with new parameters
  setup();
  // Set the game canvas as visible
  canvasVisible = true;
  startMillis = millis();
  difficulty = "easy";
}

// Function to set up the game for normal difficulty
function normalDiff() {
  w = 40;
  cols = 10;
  let mines = round(rows * cols * 0.2);
  totalMines = mines;
  // Call the setup function to initialize the game with new parameters
  setup();
  // Set the game canvas as visible
  canvasVisible = true;
  startMillis = millis();
  difficulty = "normal"
}

// Function to set up the game for hard difficulty
function hardDiff() {
  w = 33 + 1 / 3;
  cols = 12;
  let mines = round(rows * cols * 0.35);
  totalMines = mines;
  // Call the setup function to initialize the game with new parameters
  setup();
  // Set the game canvas as visible
  canvasVisible = true;
  startMillis = millis();
  difficulty = "hard"
}

// Function to hide buttons and sliders
function hideDiffBtn() {
  // Get and hide the button for easy difficulty
  document.getElementById("ezbtn").style.display = "none";
  // Get and hide the button for normal difficulty
  document.getElementById("normbtn").style.display = "none";
  // Get and hide the button for hard difficulty
  document.getElementById("hardbtn").style.display = "none";
  // Get and hide timed mode button
  document.getElementById("timedModeBtn").style.display = "none";
  //Get and hide speedrun mode button
  document.getElementById("speedrunModeBtn").style.display = "none";
  // Get and hide the lives slider
  document.getElementById("livesSlider").style.display = "none";
  // Get and hide the timed mode slider
  document.getElementById("timedModeSlider").style.display = "none";
}

function showRestartButton() {
  document.getElementById("rebtn").style.display = "inline-block";
}

// Functions to disable random reveal buttons after one click
function reveal1() {
  let reveal1 = document.getElementById("revealButtons1");
  reveal1.disabled = "true";
  reveal1.classList.toggle("alrClicked");
}

function reveal2() {
  let reveal2 = document.getElementById("revealButtons2");
  reveal2.disabled = "true";
  reveal2.classList.toggle("alrClicked");
}

function reveal3() {
  let reveal3 = document.getElementById("revealButtons3");
  reveal3.disabled = "true";
  reveal3.classList.toggle("alrClicked");
}

// Function to show slider to choose the amount of time if Timer Mode button is clicked
function showTimerSlider() {
  document.getElementById("timedModeBtn").style.display = "none";
  document.getElementById("timedModeSlider").style.display = "inline-block";
  document.getElementById("speedrunModeBtn").style.display = "none";
  timedMode = true;
}

//Function to setup speedrun mode
function hideModeBtns() {
  document.getElementById("timedModeBtn").style.display = "none";
  document.getElementById("speedrunModeBtn").style.display = "none";
  speedrun = true;
}
