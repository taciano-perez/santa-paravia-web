/*
Santa Paravia e Fiumaccio

The original BASIC game for the TRS-80 was created by George Blank (1979)
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

// GAME CONSTANTS & CLASSES
MaleTitles = ["Sir", "Baron", "Count", "Marquis", "Duke", "Grand Duke", "Prince", "* H.R.H. King"];
FemaleTitles = ["Lady","Baroness","Countess", "Marquise","Duchess", "Grand Duchess", "Princess", "* H.R.H. Queen"];

class Player {
    constructor(_year, _city, _name, _isMale) {
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
            this.Title = MaleTitles[0];
        else
            this.Title, FemaleTitles[0];
    
        // if (city == 6)
        //     strcpy(this.Title, "Baron");
    
        this.Treasury = 1000;
        // this.WhichPlayer = _city;
        this.Year = _year;
        this.YearOfDeath = _year + 20 + Random(35);        
    }
}

// GAME STATE
var level;          // difficulty level
var playerName;     // player name
var isPlayerMale;   // is player male?

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

// UI FUNCTIONS

// UI controls
var images = document.getElementById("images"); 
var text = document.getElementById("text"); 
var buttonBox = document.getElementById('buttonBox');
var input = document.getElementById('input');

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

// advance to a next screen s
const advanceTo = function(s) {
  changeImage(s.image)
  changeText(s.text)
  changeButtons(s.buttons)
  getInputText(s.inputText)
};

// execute action a and then advance to screen s
const actionAndAdvanceTo = function (a, s) {
    eval(a);
    advanceTo(s);
}

// GAME SCREENS

const screenRulerGenderText = function() {
    debug("replacing...")
    return "Is %s male or female?".replace("%s", playerName)
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
      text: "Are you ready to start?",
      buttons: [["Yes!", ""]]
  }
  
};

// start game
input.hidden = true;
advanceTo(screens.start);