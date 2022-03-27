/*
Santa Paravia e Fiumaccio
-------------------------
The original BASIC game for the TRS-80 was created by George Blank (1978)
This JS implementation by Taciano Dreckmann Perez (2022) is based on the
C implementation by Thomas Knox (2000)
*/

// CONVENIENCE FUNCTIONS
const debug = function(msg) {
    console.log(msg);
}

// returns a random integer between 0 and max
const Random = function(max) {
    return Math.floor(Math.random() * max+1);
}

const showError = function(msg) {
    alert(msg);
}

// GAME CONSTANTS & CLASSES
CityList = ["Santa Paravia", "Fiumaccio", "Torricella", "Molinetto", "Fontanile", "Romanga", "Monterana"];
MaleTitles = ["Sir", "Baron", "Count", "Marquis", "Duke", "Grand Duke", "Prince", "* H.R.H. King"];
FemaleTitles = ["Lady","Baroness","Countess", "Marquise","Duchess", "Grand Duchess", "Princess", "* H.R.H. Queen"];

class Player {
    constructor(_year, _city, _name, _isMale, titleLevel) {
        this.Cathedral = 0;
        this.City = _city;
        this.Clergy = 5;
        this.CustomsDuty = 25;
        this.Difficulty = level;
        this.GrainPrice = 25;
        this.GrainReserve = 5000;
        this.IncomeTax = 5;
        this.IsBankrupt = false;
        this.IsDead = false;
        this.IWon = false;
        this.Justice = 2;
        this.Land = 10000;
        this.LandPrice = 10.0;
        this.MaleOrFemale = _isMale;
        this.Marketplaces = 0;
        this.Merchants = 25;
        this.Mills = 0;
        this.Name = _name;
        this.Nobles = 4;
        this.OldTitle = 1;
        this.Palace = 0;
        this.PublicWorks = 1.0;
        this.SalesTax = 10;
        this.Serfs = 2000;
        this.Soldiers = 25;
        this.TitleNum = 1;
    
        if (this.MaleOrFemale == true)
            this.Title = MaleTitles[titleLevel];
        else
            this.Title = FemaleTitles[titleLevel];

        this.Treasury = 1000;
        // this.WhichPlayer = _city;
        this.Year = _year;
        this.YearOfDeath = _year + 20 + Random(35);        
    }
}

class Game {
    constructor() {
        this.AllDead = false;
        this.Winner = false;
        this.WinningPlayer = 0;
        this.Baron = new Player(1400, CityList[6], "Peppone", 1);
    }
}

// GAME STATE
var level;          // difficulty level
var playerName;     // player name
var isPlayerMale;   // is player male?
var player;         // player object (from Player class)
var game;           // game object (from Game class)

// GAME FUNCTIONS

const setDifficulty = function(l) {
    level = l;
    debug("Difficulty set to " + l);
}

const setRulerName = function (name) {
    playerName = name;
    debug("Player Name set to " + name);
}

const setRulerIsMale = function(isMale) {
    isPlayerMale = isMale;
    debug("Player Is Male set to " + isMale);
}

const initializePlayer = function() {
    player = new Player(1400, "Santa Paravia", playerName, isPlayerMale, 0);
}

const initializeGame = function() {
    game = new Game();
}

const GenerateHarvest = function(player) {
    player.Harvest = Math.floor((Random(5) + Random(6)) / 2);
    player.Rats = Random(50);
    player.GrainReserve = ((player.GrainReserve * 100) - (player.GrainReserve * player.Rats)) / 100;
}

const NewLandAndGrainPrices = function(player) {
    x = player.Land;
    y = ((player.Serfs - player.Mills) * 100.0) * 5.0;

    if (y < 0.0)
        y = 0.0;

    if (y < x)
        x = y;

    y = player.GrainReserve * 2.0;
    if (y < x)
        x = y;

    y = player.Harvest + (Random(1) - 0.5);
    h = Math.round(x * y);
    player.GrainReserve += h;
    player.GrainDemand = (player.Nobles * 100) + (player.Cathedral * 40) + (player.Merchants * 30);
    player.GrainDemand += ((player.Soldiers * 10) + (player.Serfs * 5));
    player.LandPrice = (3.0 * player.Harvest + Random(6) + 10.0) / 10.0;

    if (h < 0)
        h *= -1;
    if (h < 1)
        y = 2.0;
    else {
        y = (player.GrainDemand / h);
        if (y > 2.0)
            y = 2.0;
    }

    if (y < 0.8)
        y = 0.8;

    player.LandPrice *= y;

    if (player.LandPrice < 1.0)
        player.LandPrice = 1.0;

    player.GrainPrice = (((6.0 - player.Harvest) * 3.0 + Random(5) + Random(5)) * 4.0 * y);
    player.RatsAte = h;
}

const printHarvestMsg = function(player) {
    switch (player.Harvest) {
        case 0: return "";
        case 1: return "Drought. Famine threatens ";
        case 2: return "Bad weather. Poor harvest ";
        case 3: return "Normal weather. Average harvest ";
        case 4: return "Good weather. Fine harvest ";
        case 5: return "Excellent weather. Great harvest ";
    }
}

const prepareBuySellGrain = function() {
    GenerateHarvest(player);
    NewLandAndGrainPrices(player);
}

const BuyGrain = function(player, amount) {
    player.Treasury -= (amount * player.GrainPrice / 1000);
    player.GrainReserve += amount;
}

const SellGrain = function(player, amount) {
    player.Treasury += (amount * player.GrainPrice / 1000);
    player.GrainReserve -= amount;
}

const BuyLand = function(player, amount) {
    player.Treasury -= (amount * player.LandPrice);
    player.Land += amount;
}

const SellLand = function(player, amount) {
    player.Treasury += (amount * player.LandPrice);
    player.Land -= amount;
}


const newTurn = function() {
    // GenerateHarvest(player);
    // NewLandAndGrainPrices(player);
        // ---> prepareBuySellGrain()

    BuySellGrain(player);
        // screen buySellGrain

    // ReleaseGrain(Me);

    // if (player.InvadeMe) {
    //     int i;
    //     for (i = 0; i < HowMany; i++) {
    //         if (i != player.WhichPlayer)
    //             if (MyPlayers[i].Soldiers > (player.Soldiers * 2.4)) {
    //                 AttackNeighbor(&MyPlayers[i], Me);
    //                 i = 9;
    //             }
    //     }

    //     if (i != 9)
    //         AttackNeighbor(Baron, Me);
    // }

    // AdjustTax(Me);
    // DrawMap(Me);
    // StatePurchases(Me, HowMany, MyPlayers);
    // CheckNewTitle(Me);

    // player.Year++;
    // if (player.Year == player.YearOfDeath)
    //     ImDead(Me);
    // if (player.TitleNum >= 7)
    //     player.IWon = true;    
}

// UI FUNCTIONS

// UI controls
var images = document.getElementById("images"); 
var text = document.getElementById("text"); 
var buttonBox = document.getElementById('buttonBox');
var input = document.getElementById('inputText');

// updates text based on the current screen
const changeText = function(words) {
    if (typeof words === 'function') {
        text.innerHTML = words();
    } else {
        text.innerHTML = words;
    }
};

// updates image based on the current screen
const changeImage = function(img) {
    if (img !== null && img !== undefined) {
        images.style.backgroundImage = "url(" + img + ")";
        images.hidden = false;
    } else {
        images.hidden = true;
    }
};

// updates multiple choice buttons based on the current screen
const changeButtons = function(buttonList) {
    buttonBox.innerHTML = "";
    if (buttonList !== null && buttonList !== undefined) {
        for (var i = 0; i < buttonList.length; i++) {
            buttonBox.innerHTML += "<button onClick="+buttonList[i][1]+">" + buttonList[i][0] + "</button>";
        };
    }
};

// gets input text and then executes an action
const getInputText = function(action) {
    if (action !== null && action !== undefined) {
        input.value = "";   // clear field
        const listener = function(event) {
            if (event.key == "Enter" || event.keyCode == 13) {
                debug("INPUT: " + input.value);
                input.removeEventListener("keydown", listener); // avoid double trigger after enter
                eval(action);
            }};
        input.addEventListener("keydown", listener);
        input.hidden = false;
    } else {
        input.hidden = true;
    }
}

const preprocess = function(fn) {
    if (fn !== null && fn !== undefined) {
        eval(fn);
    }
}

// advance to a next screen s
const advanceTo = function(s) {
  preprocess(s.preprocess);
  changeImage(s.image);
  changeText(s.text);
  changeButtons(s.buttons);
  getInputText(s.inputText);
};

// execute action a and then advance to screen s
const actionAndAdvanceTo = function (a, s) {
    eval(a);
    advanceTo(s);
}

// GAME SCREENS

const screenRulerGenderText = function() {
    return "Is %s male or female?".replace("%s", playerName)
}

const screenAreYouReadyText = function() {
    return "%s, are you ready to rule Santa Paravia?".replace("%s", player.Title + " " + player.Name);
}

const screenBuySellGrainText = function() {
    const harvestMsg = printHarvestMsg(player);
    return `
    <table>
    <tr><td>${player.Title} ${player.Name} of ${player.City}</td>   <td align=right>Year ${player.Year}</td></tr>
    <tr><td colspan=2>Rats ate ${player.Rats}% of your grain reserves.</td></tr>
    <tr><td colspan=2>${harvestMsg} (${player.RatsAte} steres).</td></tr>
    </table>
    &nbsp;<br>
    <table>
    <tr valign=bottom><td>Grain Reserve</td> <td>Grain Demand</td> <td>Price of Grain</td> <td>Price of Land</td> <td>Treasury</td></tr>  
    <tr valign=top><td>${player.GrainReserve.toFixed(0)} steres</td> <td>${player.GrainDemand} steres</td> <td>${player.GrainPrice.toFixed(2)} per 1000 st.</td> <td>${player.LandPrice.toFixed(2)} hectare</td> <td>${player.Treasury.toFixed(2)} gold florins</td></tr>
    </table>
    &nbsp;<br>
    <table>
    <tr><td>You have ${player.Land} hectares of land.</td></tr>
    </table>
    `;
}

const screenBuyGrainText = function() {
    return `
    <table>
    <tr><td>${player.Title} ${player.Name} of ${player.City}</td>   <td align=right>Year ${player.Year}</td></tr>
    </table>
    &nbsp;<br>
    <table>
    <tr valign=bottom><td>Grain Reserve</td> <td>Grain Demand</td> <td>Price of Grain</td> <td>Treasury</td></tr>  
    <tr valign=top><td>${player.GrainReserve.toFixed(0)} steres</td> <td>${player.GrainDemand} steres</td> <td>${player.GrainPrice.toFixed(2)} per 1000 st.</td>  <td>${player.Treasury.toFixed(2)} gold florins</td></tr>
    </table>
    &nbsp;<br>
    How much grain do you want to buy?
    `;
}

const buyGrain = function (value) {
    var amount = parseInt(value);
    if (amount >= 0 && amount <= player.GrainReserve) {
        BuyGrain(player, amount);
    } else {
        showError("Invalid amount.");
    }
}

const screenSellGrainText = function() {
    return `
    <table>
    <tr><td>${player.Title} ${player.Name} of ${player.City}</td>   <td align=right>Year ${player.Year}</td></tr>
    </table>
    &nbsp;<br>
    <table>
    <tr valign=bottom><td>Grain Reserve</td> <td>Grain Demand</td> <td>Price of Grain</td> <td>Treasury</td></tr>  
    <tr valign=top><td>${player.GrainReserve.toFixed(0)} steres</td> <td>${player.GrainDemand} steres</td> <td>${player.GrainPrice.toFixed(2)} per 1000 st.</td>  <td>${player.Treasury.toFixed(2)} gold florins</td></tr>
    </table>
    &nbsp;<br>
    How much grain do you want to sell?
    `;
}

const sellGrain = function (value) {
    var amount = parseInt(value);
    if (amount >= 0 && amount <= player.GrainReserve) {
        SellGrain(player, amount);
    } else {
        showError("You don't have it.");
    }
}

const screenBuyLandText = function() {
    const harvestMsg = printHarvestMsg(player);
    return `
    <table>
    <tr><td>${player.Title} ${player.Name} of ${player.City}</td>   <td align=right>Year ${player.Year}</td></tr>
    </table>
    &nbsp;<br>
    <table>
    <tr valign=bottom><td>Price of Land</td> <td>Treasury</td></tr>  
    <tr valign=top><td>${player.LandPrice.toFixed(2)} hectare</td> <td>${player.Treasury.toFixed(2)} gold florins</td></tr>
    </table>
    &nbsp;<br>
    <table>
    <tr><td>You have ${player.Land} hectares of land.</td></tr>
    </table>
    &nbsp;<br>
    How much land do you want to buy?
    `;
}

const buyLand = function (value) {
    var amount = parseInt(value);
    if (amount >= 0 && amount <= (player.Treasury / player.LandPrice)) {
        BuyLand(player, amount);
    } else {
        showError("Invalid amount.");
    }
}

const screenSellLandText = function() {
    const harvestMsg = printHarvestMsg(player);
    return `
    <table>
    <tr><td>${player.Title} ${player.Name} of ${player.City}</td>   <td align=right>Year ${player.Year}</td></tr>
    </table>
    &nbsp;<br>
    <table>
    <tr valign=bottom><td>Price of Land</td> <td>Treasury</td></tr>  
    <tr valign=top><td>${player.LandPrice.toFixed(2)} hectare</td> <td>${player.Treasury.toFixed(2)} gold florins</td></tr>
    </table>
    &nbsp;<br>
    <table>
    <tr><td>You have ${player.Land} hectares of land.</td></tr>
    </table>
    &nbsp;<br>
    How much land do you want to sell?
    `;
}

const sellLand = function (value) {
    var amount = parseInt(value);
    if (amount >= 0 && amount <= player.Land) {
        SellLand(player, amount);
    } else {
        showError("You can't sell that much.");
    }
}

// content of the different game screens
const screens = {
  start: {
    image: "./img/village.svg",
    text: "Santa Paravia and Fiumaccio.<br>Do you wish to read the instructions?",
    buttons: [["Yes", "advanceTo(screens.instructions)"], ["No", "advanceTo(screens.difficulty)"]]
  },
  instructions: {
    image: null,
    text: `Santa Paravia and Fiumaccio<BR><BR>
    You are the ruler of a 15th century Italian city-state. 
    If you rule well, you will receive higher titles. The 
    first player to become king or queen wins. Life expectancy 
    then was brief, so you may not live long enough to win. 
    The computer will draw a map of your state. The size 
    of the area in the wall grows as you buy more land. The 
    size of the guard tower in the upper left corner shows 
    the adequacy of your defenses. If it shrinks, equip more 
    soldiers! If the horse and plowman is touching the top of the wall, 
    all your land is in production. Otherwise you need more 
    serfs, who will migrate to your state if you distribute 
    more grain than the minimum demand. If you distribute less 
    grain, some of your people will starve, and you will have 
    a high death rate. High taxes raise money, but slow down 
    economic growth."`,
    buttons: [["Continue", "advanceTo(screens.difficulty)"]]
  },
  difficulty: {
    image: "./img/arch.svg",
    text: "What will be the difficulty of this game?",
    buttons: [
        ["Apprentice", "actionAndAdvanceTo(setDifficulty(1),screens.rulerName)"],
        ["Journeyman", "actionAndAdvanceTo(setDifficulty(2),screens.rulerName)"],
        ["Master", "actionAndAdvanceTo(setDifficulty(3),screens.rulerName)"],
        ["Grand Master", "actionAndAdvanceTo(setDifficulty(4),screens.rulerName)"]]
  },
    rulerName: {
    image: "./img/statue.svg",
    text: "Who is the ruler of Santa Paravia?",
    inputText: "actionAndAdvanceTo(setRulerName(input.value),screens.rulerGender)",
    buttons: null
  },
    rulerGender: {
    image: "./img/crossroads-sign.svg",
    text: () => screenRulerGenderText(),
    buttons: [["Male", "actionAndAdvanceTo(setRulerIsMale(true),screens.areYouReady)"],
              ["Female", "actionAndAdvanceTo(setRulerIsMale(false),screens.areYouReady)"]]
  },
  areYouReady: {
      preprocess: "initializePlayer()",
      image: "./img/round-tower-with-flag.svg",
      text: () => screenAreYouReadyText(),
      buttons: [["Yes!", "actionAndAdvanceTo(initializeGame(),screens.newTurn)"], ["Wait, let me think again...", "advanceTo(screens.start)"]]
  },
  newTurn: {
    preprocess: "prepareBuySellGrain()",
    image: "./img/farm.svg",
    text: () => screenBuySellGrainText(),
    buttons: [["Buy grain", "advanceTo(screens.buyGrain)"], ["Sell grain", "advanceTo(screens.sellGrain)"], ["Buy land", "advanceTo(screens.buyLand)"], ["Sell land", "advanceTo(screens.sellLand)"], ["Continue", ""]]
  },
  buySellGrain: {
      image: "./img/farm.svg",
      text: () => screenBuySellGrainText(),
      buttons: [["Buy grain", "advanceTo(screens.buyGrain)"], ["Sell grain", "advanceTo(screens.sellGrain)"], ["Buy land", "advanceTo(screens.buyLand)"], ["Sell land", "advanceTo(screens.sellLand)"], ["Continue", ""]]
  },
  buyGrain: {
    image: "./img/warehouse.svg",
    text: () => screenBuyGrainText(),
    inputText: "actionAndAdvanceTo(buyGrain(input.value),screens.buySellGrain)"
  },
  sellGrain: {
    image: "./img/warehouse.svg",
    text: () => screenSellGrainText(),
    inputText: "actionAndAdvanceTo(sellGrain(input.value),screens.buySellGrain)"
  },
  buyLand: {
    image: "./img/scroll.svg",
    text: () => screenBuyLandText(),
    inputText: "actionAndAdvanceTo(buyLand(input.value),screens.buySellGrain)"
  },
  sellLand: {
    image: "./img/scroll.svg",
    text: () => screenSellLandText(),
    inputText: "actionAndAdvanceTo(sellLand(input.value),screens.buySellGrain)"
  },
  
};

// start game
input.hidden = true;
//advanceTo(screens.start);

//TEMP
setDifficulty(1);
setRulerName("Rodrigo Borgia");
setRulerIsMale(true);
initializePlayer();
advanceTo(screens.areYouReady);