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
  //TODO map these somehow once inside grid is created
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
  playerGridEl.addEventListener('click', handleShipSelect);
  playerGridEl.addEventListener('click', handlePlacementClick);
  rotateBtn.addEventListener('click',toggleOrientation);

  shipSelectBtns.forEach(btn => btn.addEventListener('click', handleShipSelect));
 


  /*----- functions -----*/
  init();

  function init() {
    playerGrid = createEmptyGrid();
    enemyGrid = createEmptyGrid();
  
    playerShips = initializeShipObjects();
    enemyShips = initializeShipObjects();
  
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
            msgEl.textContent = "All ships placed! Prepare for battle!";
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
    } else {
      orientation = 'vertical';
    }

    const displayOrientation = orientation.charAt(0).toUpperCase() + orientation.slice(1);
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
      msgEl.textContent = `${winner} Wins! Congratulations!`;
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

  