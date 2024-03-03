// Define the number of columns, rows, and width of each square on the 2D grid
let cols = 10,
  rows = 10,
  w;

// "cols" is the number of columns, "rows" is the number of rows, and "w" is the width of each square on the 2D grid.
let grid; // 2D array to represent the grid
let totalMines; // The number of mines on the grid
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
  startMillis,
  countDown,
  timeLimit,
  timedMode = false; // Variables for timed game

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
  // Create a canvas with specified dimensions
  createCanvas(493, 593);
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
}

function draw() {
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
      `Minesweeper is a logic puzzle where you unveil a hidden minefield. Imagine a grid of squares, some hiding sneaky mines, others safe. Left-click to cautiously open squares, and right-click to place a flag on a square which you suspect is a mine. When you left-click a square and it's safe, you'll see a number (1-8), revealing how many mines lurk nearby in the surrounding eight squares. Empty squares connected to that number automatically open, giving you a glimpse of the safe zone. Uncover all the safe squares, and you've conquered the minefield! There are three 'Random Reveal' buttons, which help you by revealing a random safe square. However, each button can only be used once. Use these buttons wisely. Additionally, you have a certain number of lives. When you click on a mine, the lives counter goes down. If you reach 0 lives left, BOOM! the minefield explodes and you lose! Remember, logic is key. Start small, use the numbers wisely, and don't get too greedy - too many wrong clicks can end your spree! Choose your preferred difficulty and begin by clicking the respective buttons - "Easy", "Normal", or "Hard". You can also choose a timed mode, where you have to win the game within a certain time!

Note: Mines are the coloured squares with a circle in the centre.`,
      15,
      75,
      width - 25
    );
    // Determine number of lives using lives slider
    lives = document.getElementById("livesSlider").value;
    text(`Number of lives: ${lives}`, 15, 475);
    if (timedMode == true) {
      timeLimit = document.getElementById("timedModeSlider").value;
      text(`Time : ${timeLimit} seconds`, 15, 505);
    }
  } else if (canvasVisible == true) {
    // Display game grid, reveal buttons, and lives counter
    background("#29AB30");
    drawGrid();
    displayRevealButtons();
    displayLivesCounter();
    millisTime = round((millis() - startMillis) / 1000);
    countDown = timeLimit - millisTime;
    if (countDown == 0) {
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
    text("Game Over!", width / 2, 175);
    showRestartButton();
  }
  if (gamewon == true) {
    noStroke();
    fill("#778DA9");
    rect(width / 2 - 150, 150, 300, 100);
    fill("#E1E0DD");
    textSize(30);
    text("You Won!", width / 2, 175);
    showRestartButton();
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
  let random1 = document.getElementById("revealButtons1");
  random1.style.display = "inline-block";
  let random2 = document.getElementById("revealButtons2");
  random2.style.display = "inline-block";
  let random3 = document.getElementById("revealButtons3");
  random3.style.display = "inline-block";
}

// Function to display the lives counter and timed mode (if chosen)
function displayLivesCounter() {
  // Display the lives counter on the webpage
  if (timedMode == false) {
    fill("#EAE0D5");
    textAlign(CENTER, CENTER);
    textSize(20);
    textFont("SixtyFour");
    text(`Lives: ${lives}`, width / 2, height - 75);
  } else if (timedMode == true) {
    // Display timer and lives counter on the webpage
    if (gameIsOver == false) {
      fill("#EAE0D5");
      textSize(17);
      textFont("SixtyFour");
      textAlign(CENTER, CENTER);
      text(`Timer: ${countDown}s | Lives: ${lives}`, width / 2, height - 75);
    } else if (gameIsOver == true) {
      fill("#EAE0D5");
      textSize(17);
      textFont("SixtyFour");
      textAlign(CENTER, CENTER);
      text(`Timer: 0s | Lives: 0`, width / 2, height - 75);
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
            if(!grid[i][j].mine) {
              totalFound++
            }
            grid[i][j].alrFound = true;
          }
          // Game win mechanism
          if (totalFound == (cols * rows) - totalMines && gameIsOver == false) {
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
      rect(0, w * rows, w * cols, 100);
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
    document.getElementById("explosionVideo").style.display = "block";
    document.getElementById("explosionVideo").play();
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
  let reveal1 = document.getElementById("revealButtons1");
  reveal1.disabled = "true";
  let reveal2 = document.getElementById("revealButtons2");
  reveal2.disabled = "true";
  let reveal3 = document.getElementById("revealButtons3");
  reveal3.disabled = "true";
}

// Function to hide all elements on the canvas
function hideAll() {
  fill("#1C1C1C");
  noStroke();
  rect(0, 0, w * cols, w * rows + 100);
  // Hide all 'Random Reveal' buttons
  let reveal1 = document.getElementById("revealButtons1");
  reveal1.style.display = "none";
  let reveal2 = document.getElementById("revealButtons2");
  reveal2.style.display = "none";
  let reveal3 = document.getElementById("revealButtons3");
  reveal3.style.display = "none";
}

// Function to show the game canvas
function showCanvas() {
  canvasVisible = true;
  // Hide explosion video
  document.getElementById("explosionVideo").style.display = "none";
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
  cols = 8;
  rows = 8;
  w = 50;
  totalMines = 12;
  // Call the setup function to initialize the game with new parameters
  setup();
  // Set the game canvas as visible
  canvasVisible = true;
  startMillis = millis();
}

// Function to set up the game for normal difficulty
function normalDiff() {
  cols = 10;
  rows = 10;
  w = 40;
  totalMines = 25;
  // Call the setup function to initialize the game with new parameters
  setup();
  // Set the game canvas as visible
  canvasVisible = true;
  startMillis = millis();
}

// Function to set up the game for hard difficulty
function hardDiff() {
  cols = 12;
  rows = 12;
  w = 33 + 1 / 3;
  totalMines = 50;
  // Call the setup function to initialize the game with new parameters
  setup();
  // Set the game canvas as visible
  canvasVisible = true;
  startMillis = millis();
}

// Function to hide buttons and sliders
function hideDiffBtn() {
  // Get and hide the button for easy difficulty
  let button1 = document.getElementById("ezbtn");
  button1.style.display = "none";
  // Get and hide the button for normal difficulty
  let button2 = document.getElementById("normbtn");
  button2.style.display = "none";
  // Get and hide the button for hard difficulty
  let button3 = document.getElementById("hardbtn");
  button3.style.display = "none";
  // Get and hide timed mode button
  let button4 = document.getElementById("timedModeBtn");
  button4.style.display = "none";
  // Get and hide the lives slider
  let slider1 = document.getElementById("livesSlider");
  slider1.style.display = "none";
  // Get and hide the timed mode slider
  let slider2 = document.getElementById("timedModeSlider");
  slider2.style.display = "none";
}

function showRestartButton() {
  let restartButton = document.getElementById("rebtn");
  restartButton.style.display = "inline-block";
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
  let timerBtn = document.getElementById("timedModeBtn");
  timerBtn.style.display = "none";
  let timerSlider = document.getElementById("timedModeSlider");
  timerSlider.style.display = "inline-block";
  timedMode = true;
}
