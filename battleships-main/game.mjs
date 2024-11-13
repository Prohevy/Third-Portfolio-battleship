import { ANSI } from "./utils/ansi.mjs";
import { print, clearScreen } from "./utils/io.mjs";
import SplashScreen from "./game/splash.mjs";
import { FIRST_PLAYER, SECOND_PLAYER } from "./consts.mjs";
import createMenu from "./utils/menu.mjs";
import createMapLayoutScreen from "./game/mapLayoutScreen.mjs";
import createInnBetweenScreen from "./game/innbetweenScreen.mjs";
import createBattleshipScreen from "./game/battleshipsScreen.mjs";
import {languages} from "./language.mjs";




const MAIN_MENU_ITEMS = buildMenu();

const GAME_FPS = 1000 / 60; // The theoretical refresh rate of our game engine
let currentState = null;    // The current active state in our finite-state machine.
let gameLoop = null;        // Variable that keeps a refrence to the interval id assigned to our game loop 

let mainMenuScene = null;

// my own code
const MIN_WIDTH = 80;  // Minimum console width in characters
const MIN_HEIGHT = 24; // Minimum console height in characters

//Function to get console dimensions
function getConsoleDimensions() {
    return {
      width: process.stdout.columns,
      height: process.stdout.rows
    };
  }

  // My own code. Function to check if console meets minimum resolution requirements
function isConsoleResolutionSufficient() {
    const { width, height } = getConsoleDimensions();
    return width >= MIN_WIDTH && height >= MIN_HEIGHT;
  }

(function initialize() {
    print(ANSI.HIDE_CURSOR);
    clearScreen();

  // my own code - Check console resolution before starting the game
  if (!isConsoleResolutionSufficient()) {
    print(ANSI.COLOR.RED + "The console window is too small to run the game." + ANSI.RESET);
    print(`Minimum required resolution: ${MIN_WIDTH}x${MIN_HEIGHT}`);
    print(`Current resolution: ${process.stdout.columns}x${process.stdout.rows}`);
    print("Please resize the console window and restart the game.");
    print(ANSI.SHOW_CURSOR);
    process.exit(1); // Exit the program with an error code
}
 mainMenuScene = createMenu(MAIN_MENU_ITEMS);
    SplashScreen.next = mainMenuScene;
    currentState = SplashScreen  // This is where we decide what state our finite-state machine will start in. 
    gameLoop = setInterval(update, GAME_FPS); // The game is started.
})();

// my own code - Check console resolution before starting the game
if (!isConsoleResolutionSufficient()) {
    print(ANSI.COLOR.RED + "The console window is too small to run the game." + ANSI.RESET);
    print(`Minimum required resolution: ${MIN_WIDTH}x${MIN_HEIGHT}`);
    print(`Current resolution: ${process.stdout.columns}x${process.stdout.rows}`);
    print("Please resize the console window and restart the game.");
    print(ANSI.SHOW_CURSOR);
    process.exit(1); // Exit the program with an error code
}

function update() {
    currentState.update(GAME_FPS);
    currentState.draw(GAME_FPS);
    if (currentState.transitionTo != null) {
        currentState = currentState.next;
        print(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
    }
}

// Support / Utility functions ---------------------------------------------------------------

function buildMenu() {
    let menuItemCount = 0;
    return [
        {
            text: "Start Game", id: menuItemCount++, action: function () {
                clearScreen();
                let innbetween = createInnBetweenScreen();
                innbetween.init(`SHIP PLACMENT\nFirst player get ready.\nPlayer two look away`, () => {

                    let p1map = createMapLayoutScreen();
                    p1map.init(FIRST_PLAYER, (player1ShipMap) => {


                        let innbetween = createInnBetweenScreen();
                        innbetween.init(`SHIP PLACMENT\nSecond player get ready.\nPlayer one look away`, () => {
                            let p2map = createMapLayoutScreen();
                            p2map.init(SECOND_PLAYER, (player2ShipMap) => {
                                return createBattleshipScreen(player1ShipMap, player2ShipMap);
                            })
                            return p2map;
                        });
                        return innbetween;
                    });

                    return p1map;

                }, 3);
                currentState.next = innbetween;
                currentState.transitionTo = "Map layout";
            }
        },
        { text: "Exit Game", id: menuItemCount++, action: function () { print(ANSI.SHOW_CURSOR); clearScreen(); process.exit(); } },
    ];
}
   

//language module

let currentLanguage = "en"; 

function getText(key) {
    return languages[currentLanguage][key];
}