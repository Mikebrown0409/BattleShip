  /*----- constants -----*/
  const GRID_SIZE = 10;

  //length refers to cell length once we have inside grid created aka cells.
  const SHIP_TYPES = {
    carrier: { name: 'Carrier', length: 5 },
    battleship: { name: 'Battleship', length: 4 },
    cruiser: { name: 'Cruiser', length: 3 },
    submarine: { name: 'Submarine', length: 3 },
    destroyer: { name: 'Destroyer', length: 2 },
  };

  // cell types inside grid should cover all things that will happen.
  const CELL_TYPES = {
    Water: 0,
    Ship: 1,
    Hit: 2,
    Miss: 3,
    Sunk: 4,
  }

  //mapping for CSS classes and for render single grid to work. 
  //TODO create these css classes. 
  const CELL_MAP = {
    [CELL_TYPES.Water]: 'water',
    [CELL_TYPES.Ship]: 'ship',
    [CELL_TYPES.Hit]: 'hit',
    [CELL_TYPES.Miss]: 'miss',
    [CELL_TYPES.Sunk]: 'sunk',
  }
  

  /*----- state variables -----*/

  let playerGrid;
  let enemyGrid;

  let playerShips;
  let enemyShips;

  let turn;
  let winner;
  let gameState;
  
  let shipSelected;
  let shipsToPlace;
  let orientation;


  /*----- cached elements  -----*/

    const playerGridEl = document.querySelector('#player-grid');
    const enemyGridEl = document.querySelector('#enemy-grid'); 
    const playAgainBtn = document.querySelector('#play-again');
    const shipPlacementEl = document.getElementById('ship-placement');
    const shipSelectBtns = document.querySelectorAll(`button[data-ship]`);
    const rotateBtn = document.querySelector('#orientation');

    const msgEl = document.querySelector('#message');

  /*----- event listeners -----*/
  // playerGridEl.addEventListener('click', handleShipSelect); //causing error, duplicated efforts with data attr pulls and clickhandler
  playerGridEl.addEventListener('click', handlePlacementClick);
  rotateBtn.addEventListener('click',toggleOrientation);
  //highlight for ship select
  playerGridEl.addEventListener('mouseover', handleCellMouseOver);
  playerGridEl.addEventListener('mouseout', handleCellMouseOut);
  
  //firing shot evt listner
  enemyGridEl.addEventListener('click', handleFireShot);


  shipSelectBtns.forEach(btn => btn.addEventListener('click', handleShipSelect));
 


  /*----- functions -----*/
  init();

  function init() {
    playerGrid = createEmptyGrid();
    enemyGrid = createEmptyGrid();
  
    playerShips = initializeShipObjects();
    enemyShips = initializeShipObjects();

    placeEnemyShips();
  
    winner = null;
    turn = 'Player';
    gameState = 'placement'

    shipSelected = null;
    orientation = 'vertical'
    shipsToPlace = Object.keys(SHIP_TYPES);

    createDomGrid (playerGridEl, 'p');
    createDomGrid (enemyGridEl, 'e');

    render();
  }

  function initializeShipObjects () {
    return Object.entries(SHIP_TYPES).map(([key,data]) => ({
        id: key,
        name: data.name,
        length: data.length,
        cells: [],
        hit: 0,
        sunk: false,
  }));
}


  function aiTakeTurn() {
    if (gameState !== 'firing' || turn !== 'Enemy' || winner ) return;

    let row,col;
    let isValidTarget = false;
    let attempts = 0;
    let maxAttempts = 100;
    while (!isValidTarget && attempts < maxAttempts) {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
      const cellState = playerGrid[row][col];
      if (cellState === CELL_TYPES.Ship || cellState === CELL_TYPES.Water) {
        isValidTarget = true;
        console.log(`AI target found ${row}${col} with state ${cellState}`)

      } 
    attempts++;
    }

    if (!isValidTarget) {
      console.log('calculation error in aiTakeTurn, maybe check the while loop/max attempts')
      msgEl.textContent = 'Enemy missed! Your turn'
      turn = 'Player';
      return;
    }

    const finalCellState = playerGrid[row][col];
      //if ship === hit // else water === miss ~ AI logic
      if (finalCellState === CELL_TYPES.Ship) {
        console.log('AI hit');
        playerGrid[row][col] = CELL_TYPES.Hit;
        msgEl.textContent = `Oh no! The enemy has hit your ship!`;

        const hitShip = playerShips.find(ship => {
          const wasHit = ship.cells.some(cellCoord => {
            return cellCoord[0] === row && cellCoord[1] === col;
          });
          return wasHit
        })
        
        if (hitShip) {
          hitShip.hit += 1;
          if (hitShip.hit === hitShip.length) {
            console.log(`AI sunk a ship lol!`);
            hitShip.sunk = true;
            msgEl.textContent = `Your enemy sunk your ${hitShip.name}!`;
            hitShip.cells.forEach(([r,c]) => {
              playerGrid[r][c] = CELL_TYPES.Sunk;
            })
            
            // copied winner logic with adjusting for AI. Need to refactor this if I change it into helper function for player. 
            if (playerShips.every(ship => ship.sunk === true)) {
              winner = 'Enemy';
              gameState = 'gameOver';
              msgEl.textContent = "You have lost :(";
              render();
              return;
            }
          
          }}       
      }

      else {
        console.log('miss');
        playerGrid[row][col] = CELL_TYPES.Miss;
        msgEl.textContent = "Enemy missed. Your turn!";
      }
    render();
    if (!winner) {
    turn = 'Player';
    console.log("switching to player");
    }}


  function handleFireShot (evt) {
    if (gameState !== 'firing' || turn !== 'Player' || winner || !evt.target.classList.contains('cell')) return;
    const row = parseInt(evt.target.dataset.row);
    const col = parseInt(evt.target.dataset.col);
    const cellState = enemyGrid[row][col];

    if (cellState === CELL_TYPES.Hit || cellState === CELL_TYPES.Miss || cellState === CELL_TYPES.Sunk) {
      msgEl.textContent = "You have already fired at this location.";
      return;
  }

    if (cellState === CELL_TYPES.Ship || cellState === CELL_TYPES.Water) {
      //if ship === hit // else water === miss
      if (cellState === CELL_TYPES.Ship) {
        console.log('hit');
        enemyGrid[row][col] = CELL_TYPES.Hit;
        msgEl.textContent = "Hit!";

        const hitShip = enemyShips.find(ship => {
          const wasHit = ship.cells.some(cellCoord => {
            return cellCoord[0] === row && cellCoord[1] === col;
          });
          return wasHit
        })
        
        if (hitShip) {
          hitShip.hit += 1;
          if (hitShip.hit === hitShip.length) {
            console.log('sunk!');
            hitShip.sunk = true;
            msgEl.textContent = `You sunk their ${hitShip.name}!`;
            hitShip.cells.forEach(([r,c]) => {
              enemyGrid[r][c] = CELL_TYPES.Sunk;
            })
            
            // winner logic only applies to player atm if all ships sunk. 
            // Maybe needs its own function to clean up this function a bit on a refactor?
            if (enemyShips.every(ship => ship.sunk === true)) {
              winner = 'Player';
              gameState = 'gameOver';
              msgEl.textContent = "You have won!";
              render();
              return;
            }
          
          }}       
      }

      else {
        console.log('miss');
        enemyGrid[row][col] = CELL_TYPES.Miss;
        msgEl.textContent = "Miss!";
      }
    } render();
    if (!winner) {
      turn = 'Enemy'; //was able to cheat and fire multiples. OOP
      setTimeout(() => {
        console.log("switching to enemy");
        msgEl.textContent = "Enemy is thinking...";
        setTimeout(aiTakeTurn, 1000);
      }, 1500);
  }}
  

  function placeEnemyShips () {
    enemyShips.forEach(ship => {
      let placed = false;
      while (!placed) {
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const startRow = Math.floor(Math.random() * GRID_SIZE);
        const startCol = Math.floor(Math.random() * GRID_SIZE);

        if (placementValidation(enemyGrid, ship.length, startRow, startCol, orientation)) {
        placeShip(enemyGrid, enemyShips, ship.id, startRow, startCol, orientation);
        placed = true;
        console.log(`Placed enemy ${ship.name} at [${startRow},${startCol}] ${orientation}`); 
      }
    }
  });
  }

  function handleCellMouseOver (evt) {
    if (gameState !== 'placement' || !shipSelected || !evt.target.classList.contains('cell')) return; 
    const row = parseInt(evt.target.dataset.row);
    const col = parseInt(evt.target.dataset.col);
    const shipLength = SHIP_TYPES[shipSelected].length;
    
    let previewCells = [];
    for (let i = 0; i < shipLength; i++) {

      let r = row;
      let c = col;
      if (orientation === 'horizontal') {
        c = col + i;
      } else {
        r = row + i;
      }
      previewCells.push([r,c]);
    }

    const isValidPreview = placementValidation(playerGrid, shipLength, row, col, orientation);
    const validityClass = isValidPreview ? 'valid' : 'invalid';

    for (const cellCoord of previewCells) {
      const r = cellCoord[0];
      const c = cellCoord[1];
      const cellId = `p-r${r}c${c}`;
      const cellEl = document.getElementById(cellId);

      if (cellEl) {
        cellEl.classList.add('preview', validityClass)
      };
    }
  }


  function handleCellMouseOut (evt) {
    const allCells = playerGridEl.querySelectorAll('.cell');

    allCells.forEach(cellElement => { 
      cellElement.classList.remove('preview', 'valid', 'invalid');
    });
  }



  function handlePlacementClick (evt) {
    if (gameState !== 'placement' || !shipSelected ||!evt.target.classList.contains('cell')) 
        return; 

        const row = parseInt(evt.target.dataset.row);
        const col = parseInt(evt.target.dataset.col);
        const shipData = SHIP_TYPES[shipSelected]; // now need to validate before moving forward
        
        const isValid = placementValidation(playerGrid, shipData.length, row, col, orientation);
        if (isValid) {
        placeShip(playerGrid, playerShips, shipSelected, row, col, orientation);
        
        const placedShipId = shipSelected;
        const placedShipName = shipData.name
        shipSelected = null;
        shipsToPlace = shipsToPlace.filter(shipId => shipId !== placedShipId) //creates new list for iterating

          if (shipsToPlace.length === 0) {
            gameState = 'firing';
            console.log("Switching gameState to:", gameState);
            msgEl.textContent = "All ships placed! Click the enemy grid to fire!";
          } else {
            msgEl.textContent = `${placedShipName} placed! Select the next ship.`
          }

        render();
        } else {
          msgEl.textContent = "Error on placement click";
        }
  }
  

  function placementValidation (grid, length, startRow, startCol, orientation) {
    for (let i = 0; i < length; i++) {
      let r = startRow;
      let c = startCol;
      if (orientation === 'horizontal') {
        c = startCol + i;
      } else {
        r = startRow + i;
      }
    
    //grid validation check off grid
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
      console.log(`Out of bounds at [${r}, ${c}] for segment ${i}`);
      return false;
    }
    //grid validation check for cells occupied (e.g. previous ship)
    if (grid[r][c] !== CELL_TYPES.Water) {
      console.log('Invalid placement');
      return false;
    }
  } return true;
}
  
  function handleShipSelect (evt) {
    if (gameState !== 'placement') return; {
        const shipType = evt.target.dataset.ship;
        if (shipsToPlace.includes(shipType)) {
            shipSelected = shipType;
            console.log(shipSelected);
            shipSelectBtns.forEach(btn => {
                if (btn.dataset.ship === shipSelected) {
                    btn.classList.add('selected')
                } else {
                    btn.classList.remove('selected');
                }
            })
        } else {
            msgEl.textContent = `${SHIP_TYPES[shipType].name} has already been placed.`;
            shipSelected = null;
            shipSelectBtns.forEach(btn => {btn.classList.remove('selected')
            });
        }
        renderMessage();
    }
  }
  
  

  // ship placement helper function similiar to empty grid but pushes ship when placed. Cells should now be occupied by 'ship'
  //TODO need to verify this. Added ship validation to avoid overwriting anything.
  function placeShip (grid, shipList, shipId, startRow, startCol, orientation) {
    const ship = shipList.find(s => s.id === shipId);
    if(!ship) return;

    ship.cells = [];
    for (let i = 0; i < ship.length; i++) {
        let r = startRow;
        let c = startCol;
        if (orientation === 'horizontal') {
          c += i;
        } else {
          r += i;
        }
        grid[r][c] = CELL_TYPES.Ship;
        ship.cells.push([r,c]);
    }
  }

  function toggleOrientation () {
    if (orientation === 'vertical') {
      orientation = 'horizontal';
      nextOrientation = 'vertical';
    } else {
      orientation = 'vertical';
      nextOrientation = 'horizontal';
    }

    const displayOrientation = nextOrientation.charAt(0).toUpperCase() + nextOrientation.slice(1);
    rotateBtn.textContent = `Rotate Ship (${displayOrientation})`;
    console.log("Orientation changed to:", orientation);
  }


  //creates the actual cells inside adding elements to HTML.
  function createDomGrid (gridElement, prefix) {
    gridElement.innerHTML = ''; 
    for (let r =0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `${prefix}-r${r}c${c}`;
            cell.dataset.row = r;
            cell.dataset.col = c;
            gridElement.appendChild(cell);
        }           
    }
  }


  //resolved errors. Should be good, nested row and then adds water value which we have at 0 to each nested row when iterating through it. 
  // then adds row to grid. Should be 10by10 rows of '0'.
  // circle back if issue once the rest of grid is set up.  
  function createEmptyGrid() {
    const grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        const row = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            row.push(CELL_TYPES.Water); 
        }
        grid.push(row);
    }
    return grid;
}

  function render () {
    renderGrids();
    renderMessage();
    renderControls();
  };

  function renderGrids() {
    renderSingleGrid(playerGridEl, playerGrid, 'p', true);
    renderSingleGrid(enemyGridEl, enemyGrid, 'e', false);
  }

  function renderSingleGrid(gridElement, gridData, prefix, showShips) {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cellEl = gridElement.querySelector(`#${prefix}-r${r}c${c}`);

            const state = gridData[r][c]; 
            // for css class
            cellEl.className = "cell";
            
            const stateClass = CELL_MAP[state];
            if (stateClass) {
                // if user grid, ships should be showing once logic is added. Ensure enemy/comp ships DO NOT show. 
                // Circle back if needed as this should iterate the state management for calling the correct classes. 
                // TODO Verify this actually works.
                if (state === CELL_TYPES.Ship && showShips) {
                   cellEl.classList.add(stateClass);
                } else if (state !== CELL_TYPES.Ship) {
                    // adds the other classes sunk,hit,miss during runtime. 
                     cellEl.classList.add(stateClass);
                }
            }

        }
    }
}

function renderMessage() {
    if (gameState === 'placement') {
      if (shipSelected) {
        msgEl.textContent = `Place the ${SHIP_TYPES[shipSelected].name}. Click on your grid.`;
      } else if (shipsToPlace.length > 0) {
        msgEl.textContent = `Select a ship to place (${shipsToPlace.length} remaining).`;
      } else {
        msgEl.textContent = 'Error: Placement phase but no ships left?';
      }
    } else if (gameState === 'firing') {
    //   if (!winner) {
    //     
    //   }
    } else if (gameState === 'gameOver') {
      // msgEl.textContent = `${winner} Wins! Congratulations!`;
    }
  }

  function renderControls() {
    playAgainBtn.style.visibility = gameState === 'gameOver' ? 'visible' : 'hidden';
    shipPlacementEl.style.display = gameState === 'placement' ? 'block' : 'none';
  
    // Should update ship button states and make them disappear after starting.
    shipSelectBtns.forEach(btn => {
      const shipType = btn.dataset.ship;
      btn.disabled = gameState !== 'placement' || !shipsToPlace.includes(shipType);
      if (gameState === 'placement' && shipSelected === shipType) {
           btn.classList.add('selected');
      } else {
           btn.classList.remove('selected');
      }
    });
  } 

  