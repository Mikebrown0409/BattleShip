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


  /*----- cached elements  -----*/

    const playerGridEl = document.querySelector('#player-grid');
    const enemyGridEl = document.querySelector('#enemy-grid'); 

  /*----- event listeners -----*/


  /*----- functions -----*/
  init();

  function init() {
    playerGrid = createEmptyGrid();
    enemyGrid = createEmptyGrid();
  
    // playerShips = initializeShipObjects();
    // enemyShips = initializeShipObjects();
  
    winner = null;
    turn = 'Player';
    gamestate = 'placeholder'

    shipSelected = null;
    //need to figure out shipsToPlace

    render();
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
    // renderMessage();
    // renderControls();
  };

  function renderGrids() {
    renderSingleGrid(playerGridEl, playerGrid, 'p', true);
    renderSingleGrid(playerGridEl, playerGrid, 'e', false);
  }

  function renderSingleGrid(gridElement, gridData, prefix, showShips) {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            // Select the cell ..*Doesnt* currently work.. need to fix. We have all 0's in our grid but no column,row array set. think data.
            const cellEl = gridElement.querySelector(`#${gridData}-r${r}c${c}`);

            const state = gridData[r][c]; 
        }
    }
}


  function renderEnemyGrid() {

  }

  function renderMessage() {

  }

  function renderControls() {

  }

  