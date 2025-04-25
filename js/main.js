  /*----- constants -----*/


  /*----- state variables -----*/

  let playerGrid;
  let enemyGrid;

  let playerShips;
  let enemyShips;

  let turn;
  let winner;
  
  let shipSelected;
  let shipsToPlace;


  /*----- cached elements  -----*/


  /*----- event listeners -----*/


  /*----- functions -----*/
  init();

  function init() {
    playerGrid = createEmptyGrid();
    enemyGrid = createEmptyGrid();
  
    playerShips = initializeShipObjects();
    enemyShips = initializeShipObjects();
  
    winner = null;
    turn = 'Player';

    shipSelected = null;
    //need to figure out shipstoPlace
  }