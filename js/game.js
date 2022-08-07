/*
Santa Paravia e Fiumaccio
-------------------------
The original BASIC game for the TRS-80 was created by George Blank (1978)
This JS implementation by Taciano Dreckmann Perez (2022) is based on the
C implementation by Thomas Knox (2000).
*/

// CONVENIENCE FUNCTIONS
const debug = function(msg) {
    console.log(msg);
}

// returns a random integer between 1 and max
const Random = function(max) {
    const rnd = Math.trunc(Math.random() * max+1);
    return rnd;
}

const showError = function(msg) {
    alert(msg);
}

const limit10 = function(num, denom) {
    const val = Math.trunc(num / denom);
    return (val > 10 ? 10 : val);
}

// GAME CONSTANTS & CLASSES
CityList = ["Santa Paravia", "Fiumaccio", "Torricella", "Molinetto", "Fontanile", "Romanga", "Monterana"];
MaleTitles = ["Sir", "Baron", "Count", "Marquis", "Duke", "Grand Duke", "Prince", "* H.R.H. King"];
FemaleTitles = ["Lady","Baroness","Countess", "Marquise","Duchess", "Grand Duchess", "Princess", "* H.R.H. Queen"];
const SOLDIERS_PER_PLATOON = 20;
const PLATOON_COST = 500;

class Player {
    constructor(_year, cityIndex, _name, _isMale, titleLevel) {
        this.Cathedral = 0;
        this.City = CityList[cityIndex];
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
        this.WhichPlayer = cityIndex;
        this.Year = _year;
        this.YearOfDeath = _year + 20 + Random(35);        
    }
    justiceAsString() {
        switch(this.Justice) {
            case 1: return "Very Fair";
            case 3: return "Harsh";
            case 2: return "Moderate";
            case 4: return "Outrageous";
        }
        return "";

    }
}

class Game {
    constructor() {
        this.AllDead = false;
        this.Winner = false;
        this.WinningPlayer = 0;
        this.Baron = new Player(1400, 6, "Peppone", true, 1);
    }
}

// GAME STATE
var level;                  // difficulty level
var playerName;             // player name
var isPlayerMale;           // is player male?
var player;                 // player object (from Player class)
var game;                   // game object (from Game class)
var populationMessages = [] // list of messages concerning population on the current turn
var attackMessages = []     // list of messages concernings attacks on the current turn

// GAME FUNCTIONS

const setDifficulty = function(l) {
    level = l+5;    // the original BASIC code uses difficulties from 6 to 10, which is key for balancing the game
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
    player = new Player(1400, 0, playerName, isPlayerMale, 0);
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
    h = Math.floor(x * y);
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

const SerfsDecomposing = function (player, MyScale) {
    var absc = Math.floor(MyScale);
    var ord = MyScale-absc;

    player.DeadSerfs = Math.floor((((Random(absc) + ord) * player.Serfs) / 100.0));
    player.Serfs -= player.DeadSerfs;

    return `${player.DeadSerfs} serfs died this year.`;
}

const SerfsProcreating = function(player, MyScale) {
    var absc = Math.floor(MyScale);
    var ord = MyScale-absc;

    player.NewSerfs = Math.floor((((Random(absc) + ord) * player.Serfs) / 100.0));
    player.Serfs += player.NewSerfs;

    return `${player.NewSerfs} serfs born this year.`;
}

// releases grain, calculates consequences, and returns array of message strings
const ReleaseGrain = function(player, HowMuch) {
    var xp, zp;
    var x, z;
    const messages = [];

    player.SoldierPay = player.MarketRevenue = player.NewSerfs = player.DeadSerfs = 0;
    player.TransplantedSerfs = player.FleeingSerfs = 0;
    player.InvadeMe = false;
    player.GrainReserve -= HowMuch;
    z = HowMuch / player.GrainDemand - 1.0;

    if (z > 0.0)
        z /= 2.0;
    if (z > 0.25)
        z = z / 10.0 + 0.25;

    zp = 50.0 - player.CustomsDuty - player.SalesTax - player.IncomeTax;

    if (zp < 0.0)
        zp *= player.Justice;
    zp /= 10.0;

    if (zp > 0.0)
        zp += (3.0 - player.Justice);

    z += (zp / 10.0);

    if (z > 0.5)
        z = 0.5;

    if (HowMuch < (player.GrainDemand - 1)) {
        x = (player.GrainDemand - HowMuch) / player.GrainDemand * 100.0 - 9.0;
        xp = x;

        if (x > 65.0)
            x = 65.0;

        if (x < 0.0) {
            xp = 0.0;
            x = 0.0;
        }

        messages.push(SerfsProcreating(player, 3.0));
        messages.push(SerfsDecomposing(player, xp + 8.0));
    } else {
        messages.push(SerfsProcreating(player, 7.0));
        messages.push(SerfsDecomposing(player, 3.0));

        if ((player.CustomsDuty + player.SalesTax) < 35)
            player.Merchants += Random(4);

        if (player.IncomeTax < Random(20)) {// typo in C version, should be 20 i.o. 28
            player.Nobles += Random(2)-1;   // BASIC version is RND(2)-1
            player.Clergy += Random(3)-1;   // BASIC version is RND(3)-1
        }

        // bonus for large surplus
        if (HowMuch > Math.floor((player.GrainDemand * 1.3))) {
            zp = player.Serfs / 1000.0;
            z = (HowMuch - (player.GrainDemand)) / player.GrainDemand * 10.0;
            z *= (zp * Random(25));
            z += Random(40);
            if (z > 32000) z = 32000;   // from BASIC version
            zp = Math.trunc(z);         // from BASIC version
            z = Random(zp);             // from BASIC version
            player.TransplantedSerfs = z;
            player.Serfs += player.TransplantedSerfs;
            messages.push(`${player.TransplantedSerfs} serfs move to your city.`);
            zp = Math.trunc(z / 5);     // from BASIC version
            z = Random(zp);             // from BASIC version
            if (z < 1) z = 1;           // from BASIC version
            //z = (zp * Random(100)) / 100; // from C version
            if (z > 50.0)
                z = 50.0;
            player.Merchants += Math.floor(z);
            player.Nobles++;
            player.Clergy += 2;
        }
    }

    if (player.Justice > 2) {
        player.JusticeRevenue = player.Serfs / 100 * (player.Justice - 2) * (player.Justice - 2);
        player.JusticeRevenue = Random(player.JusticeRevenue);
        player.Serfs -= player.JusticeRevenue;
        player.FleeingSerfs = player.JusticeRevenue;
        messages.push(`${player.FleeingSerfs} serfs flee harsh justice.`);
    }

    player.MarketRevenue = player.Marketplaces * 75;
    if (player.MarketRevenue > 0) {
        player.Treasury += player.MarketRevenue;
        messages.push(`Your market earned ${player.MarketRevenue} florins.`);
    }

    player.MillRevenue = player.Mills * (55 + Random(250));
    if (player.MillRevenue > 0) {
        player.Treasury += player.MillRevenue;
        messages.push(`Your woolen mill earned ${player.MillRevenue} florins.`);
    }

    player.SoldierPay = player.Soldiers * 3;
    player.Treasury -= player.SoldierPay;

    messages.push(`You paid your soldiers ${player.SoldierPay} florins.`);
    messages.push(`You have ${player.Serfs} serfs in your city.`);

    if ((player.Land / 1000) > player.Soldiers) {
        player.InvadeMe = true;
    }

    if ((player.Land / PLATOON_COST) > player.Soldiers) {
        player.InvadeMe = true;
    }

    return messages;
}

const setPopulationMessages = function(messages) {
    populationMessages = messages;
}

const AttackNeighbor = function(me, Him) {
    var messages = [];
    var LandTaken;

    if (me.WhichPlayer == 6)    // Baron
        LandTaken = Random(9000) + 1000;
    else
        LandTaken = (me.Soldiers * 1000) - (me.Land / 3);

    if (LandTaken > (Him.Land - 5000))
        LandTaken = (Him.Land - 5000) / 2;

    me.Land += LandTaken;
    Him.Land -= LandTaken;

    messages.push(`${me.Title} ${me.Name} of ${me.City} invades and seizes ${LandTaken} hectares of land!`);

    var deadsoldiers = Random(40);
    if (deadsoldiers > (Him.Soldiers - 15))
        deadsoldiers = Him.Soldiers - 15;
    Him.Soldiers -= deadsoldiers;

    messages.push(`${Him.Title} ${Him.Name} loses ${deadsoldiers} soldier(s) in battle.`);
    return messages;
}

const setAttackMessages = function(messages) {
    attackMessages = messages;
}

// perform attack rounds & return list of messages
const attackRounds = function(player) {
    var Players = [player, game.Baron];
    var HowMany = Players.length;
    var messages = [];
    if (player.InvadeMe) {
        var i;
        for (i = 0; i < HowMany; i++) {
            if (i != player.WhichPlayer) {
                if (Players[i].Soldiers > (player.Soldiers * 2.4)) {
                    const msgs = AttackNeighbor(Players[i], player);
                    messages = messages.concat(msgs);
                    i = 9;
                }
            }
        }
        if (i != 9) {
            const msgs = AttackNeighbor(game.Baron, player);
            messages = messages.concat(msgs);
        }
    }
    setAttackMessages(messages);
}

const GenerateIncome = function(player) {
    player.JusticeRevenue = (player.Justice * 300 - 500) * player.TitleNum;

    var y = 150.0 - player.SalesTax - player.CustomsDuty - player.IncomeTax;
    if (y < 1.0)
        y = 1.0;
    y /= 100.0;

    player.CustomsDutyRevenue = player.Nobles * 180 + player.Clergy * 75 + player.Merchants * 20 * y;
    player.CustomsDutyRevenue += Math.floor(player.PublicWorks * 100.0);
    player.CustomsDutyRevenue = Math.floor(player.CustomsDuty / 100.0 * player.CustomsDutyRevenue);
    player.SalesTaxRevenue = player.Nobles * 50 + player.Merchants * 25 + Math.floor(player.PublicWorks * 10.0);
    player.SalesTaxRevenue *= (y * (5 - player.Justice) * player.SalesTax);
    player.SalesTaxRevenue /= 200;
    player.IncomeTaxRevenue = player.Nobles * 250 + Math.floor(player.PublicWorks * 20.0);
    player.IncomeTaxRevenue += (10 * player.Justice * player.Nobles * y);
    player.IncomeTaxRevenue *= player.IncomeTax;
    player.IncomeTaxRevenue /= 100;
}

const adjustCustomsDuty = function(player, duty) {
    if (duty >= 0 && duty <= 100) {
        player.CustomsDuty = duty;
    } else {
        showError("Invalid value!");
    }
}

const adjustSalesTax = function(player, duty) {
    if (duty >= 0 && duty <= 50) {
        player.SalesTax = duty;
    } else {
        showError("Invalid value!");
    }
}

const adjustIncomeTax = function(player, duty) {
    if (duty >= 0 && duty <= 25) {
        player.IncomeTax = duty;
    } else {
        showError("Invalid value!");
    }
}

const adjustJustice = function(player, justice) {
    if (justice >= 1 && justice <= 4) {
        player.Justice = justice;
    }
}

const AddRevenue = function(player) {
    player.Treasury += (player.JusticeRevenue + player.CustomsDutyRevenue);
    player.Treasury += (player.IncomeTaxRevenue + player.SalesTaxRevenue);

    // Penalize deficit spending.
    if (player.Treasury < 0)
    player.Treasury = Math.floor(player.Treasury * 1.5);

    // Will a title make the creditors happy (for now)?
    if (player.Treasury < (-10000 * player.TitleNum))
    player.IsBankrupt = player;
}

const SeizeAssets = function(player) {
    player.Marketplaces = 0;
    player.Palace = 0;
    player.Cathedral = 0;
    player.Mills = 0;
    player.Land = 6000;
    player.PublicWorks = 1.0;
    player.Treasury = 100;
    player.IsBankrupt = false;
}

const BuyMarket = function(player) {
    if (player.Treasury < 1000) {
        showError("Sire, your treasury can't afford that much!");
        return;
    }
    player.Marketplaces += 1;
    player.Merchants += 5;
    player.Treasury -= 1000;
    player.PublicWorks += 1.0;
}

const BuyMill = function(player) {
    if (player.Treasury < 2000) {
        showError("Sire, your treasury can't afford that much!");
        return;
    }
    player.Mills += 1;
    player.Treasury -= 2000;
    player.PublicWorks += 0.25;
}

const BuyPalace = function(player) {
    if (player.Treasury < 3000) {
        showError("Sire, your treasury can't afford that much!");
        return;
    }
    player.Palace += 1;
    player.Nobles += Random(2);
    player.Treasury -= 3000;
    player.PublicWorks += 0.5;
}

const BuyCathedral = function(player) {
    if (player.Treasury < 5000) {
        showError("Sire, your treasury can't afford that much!");
        return;
    }
    player.Cathedral += 1;
    player.Clergy += Random(6);
    player.Treasury -= 5000;
    player.PublicWorks += 1.0;
}

const BuySoldiers = function(player) {
    if (player.Treasury < PLATOON_COST) {
        showError("Sire, your treasury can't afford that much!");
        return;
    }
    player.Soldiers += SOLDIERS_PER_PLATOON;
    player.Serfs -= SOLDIERS_PER_PLATOON;
    player.Treasury -= PLATOON_COST;
}

const ChangeTitle = function(player) {
    if (player.MaleOrFemale)
        player.Title = MaleTitles[player.TitleNum];
    else
        player.Title = FemaleTitles[player.TitleNum];

    if (player.TitleNum == 7)
        player.IWon = true;
}

const CheckNewTitle = function (player) {
    // Tally up our success so far.
    var Total = limit10(player.Marketplaces, 1);
    Total += limit10(player.Palace, 1);
    Total += limit10(player.Cathedral, 1);
    Total += limit10(player.Mills, 1);
    Total += limit10(player.Treasury, 5000);
    Total += limit10(player.Land, 6000);
    Total += limit10(player.Merchants, 50);
    Total += limit10(player.Nobles, 5);
    Total += limit10(player.Soldiers, 50);
    Total += limit10(player.Clergy, 10);
    Total += limit10(player.Serfs, 2000);
    Total += limit10(Math.trunc(player.PublicWorks * 100.0), 500);
    player.TitleNum = Math.trunc((Total / player.Difficulty) - player.Justice)-1; // C version did not truncate TitleNum, subtracted one because original BASIC largest title is 8
    
    if (player.TitleNum > 7)
        player.TitleNum = 7;
    if (player.TitleNum < 0)
        player.TitleNum = 0;
    
    // Did we change (could be backwards or forwards)?
    if (player.TitleNum > player.OldTitle) {
        player.OldTitle = player.TitleNum;
        ChangeTitle(player);
        return true;
    }
    
    player.TitleNum = player.OldTitle;
    return false;
}

const endTurn = function(player) {
    player.Year += 1;
    if (player.TitleNum >= 7) {
        player.IWon = true;
        advanceTo(screens.victory);    
    } else if (player.Year == player.YearOfDeath) {
        advanceTo(screens.death);
    } else {
        advanceTo(screens.newTurn);
    }
}

// UI FUNCTIONS

// UI controls
const playerStatus = document.getElementById("playerStatus");
const images = document.getElementById("images"); 
const map = document.getElementById("map"); 
const text = document.getElementById("text"); 
const buttonBox = document.getElementById('buttonBox');
const inputArea = document.getElementById('ïnputTextArea');
const input = document.getElementById('inputText');

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
        images.style.backgroundImage.width = 256;
        images.style.backgroundImage.height = 256;
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
        const doIt = function(listener, action) {
            // avoid double trigger
            input.removeEventListener("keydown", listener);
            input.removeEventListener("focusout", listener);
            // perform action
            eval(action);
        }
        const listener = function(event) {
            if (event.type == "keydown") {
                if (event.key == "Enter" || event.keyCode == 13) {
                    doIt(listener, action);
                } else {
                    // ignore keys other than enter
                }
            } else if (event.type == "focusout") {
                doIt(listener, action);
            }
        };
        input.addEventListener("keydown", listener);    // enter key on PC keyboards
        input.addEventListener("focusout", listener);   // needed for iPhone virtual keyboard
        inputArea.hidden = false;
    } else {
        inputArea.hidden = true;
    }
}

const preprocess = function(fn) {
    if (fn !== null && fn !== undefined) {
        eval(fn);
    }
}

const updatePlayerStatus = function() {
    if (player !== null && player !== undefined) {
        playerStatus.innerHTML = `
        <table>
        <tr><td>${player.Title} ${player.Name} of ${player.City}</td>   <td align=right>Year ${player.Year}</td></tr>
        </table>`
    } else {
        playerStatus.innerHTML = "";
    }
}

// advance to a next screen s
const advanceTo = function(s) {
  preprocess(s.preprocess);
  updatePlayerStatus();
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

const actionsAndAdvanceTo = function (a1, a2, s) {
    eval(a1);
    eval(a2);
    advanceTo(s);
}

// GAME SCREENS

const screenRulerGenderText = function() {
    return `Is ${playerName} male or female?`;
}

const screenAreYouReadyText = function() {
    return "%s, are you ready to rule Santa Paravia?".replace("%s", player.Title + " " + player.Name);
}

const screenBuySellGrainText = function() {
    const harvestMsg = printHarvestMsg(player);
    return `
    <table>
    <tr><td colspan=5>Rats ate ${player.Rats}% of your grain reserves.</td></tr>
    <tr><td colspan=5>${harvestMsg} (${player.RatsAte} steres).</td></tr>
    </table>
    &nbsp;<br>
    <table class="center">
    <tr valign=bottom><td>Grain Reserve</td> <td>Grain Demand</td> <td>Price of Grain</td> <td>Price of Land</td> <td>Treasury</td></tr>  
    <tr valign=top><td>${player.GrainReserve.toFixed(0)} steres</td> <td>${player.GrainDemand} steres</td> <td>${player.GrainPrice.toFixed(2)} per 1000 st.</td> <td>${player.LandPrice.toFixed(2)} hectare</td> <td>${player.Treasury.toFixed(2)} gold florins</td></tr>
    </table>
    &nbsp;<br>
    <table>
    <tr><td colspan=5>You have ${player.Land} hectares of land.</td></tr>
    </table>
    `;
}

const screenBuyGrainText = function() {
    return `
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
        showError(`Sire, the amount ${amount} is not valid.`);
    }
}

const screenSellGrainText = function() {
    return `
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
    } else if (amount < 0) {
        showError(`Sire, we cannot sell ${amount} steres.`);
    } else {
        showError(`My lord, we don't have ${amount} steres to sell.`);
    }
}

const screenBuyLandText = function() {
    return `
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
    } else if (amount >= (player.Treasury / player.LandPrice)) {
        showError(`Sire, you do not have enough gold florins to buy that much land. Your coffers afford at most ${Math.floor(player.Treasury / player.LandPrice)} hectares.`);
    } else if (amount == 0) {
        // do nothing
    } else {
        showError("My lord, that amount is not valid.");
    }
}

const screenSellLandText = function() {
    return `
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
    } else if (amount ==0) {
        // do nothing
    } else if (amount < 0) {
        showError("Sire, that amount is not valid.");
    } else {
        showError("My lord, you do not have that much land to sell.");
    }
}

const screenReleaseGrainText = function() {
    return `
    <table>
    <tr valign=bottom><td>Grain Reserve</td> <td>Grain Demand</td> </tr>  
    <tr valign=top><td>${player.GrainReserve.toFixed(0)} steres</td> <td>${player.GrainDemand} steres</td> </tr>
    </table>
    &nbsp;<br>
    How much grain will you release for consumption?
    `;
}

const releaseMinGrain = function() {
    const Minimum = player.GrainReserve / 5;
    setPopulationMessages(ReleaseGrain(player, Minimum));
}

const releaseMaxGrain = function() {
    const Minimum = player.GrainReserve / 5;
    const Maximum = (player.GrainReserve - Minimum);
    setPopulationMessages(ReleaseGrain(player, Maximum));
}

const releaseGrainAmount = function(HowMuch) {
    const Minimum = player.GrainReserve / 5;
    const Maximum = (player.GrainReserve - Minimum);

    if (HowMuch < Minimum) {
        showError("You must release at least 20% of your reserves.");
        advanceTo(screens.releaseGrain);
    } else if (HowMuch > Maximum) {
        showError("You must keep at least 20%.");
        advanceTo(screens.releaseGrain);
    } else {
        setPopulationMessages(ReleaseGrain(player, HowMuch));
        advanceTo(screens.population);
    }
}

const screenPopulationText = function() {
    var screen = `
    <table>`;
    populationMessages.forEach((msg) => {
        screen += `<tr><td>${msg}</td></tr>`;
    });
    screen += "</table>";
    return screen;
}

const checkBattle = function()  {
    attackRounds(player);
    if (attackMessages.length === 0) {
        advanceTo(screens.adjustTax);
    } else {
        advanceTo(screens.battle);
    }    
}

const screenBattleText = function() {
    if (attackMessages.length === 0) {
        return "There were no attacks this year.";
    } else {
        var screen = `
        <table>`;
        attackMessages.forEach((msg) => {
            screen += `<tr><td>${msg}</td></tr>`;
        });
        screen += "</table>";
        return screen;
    }
}

const screenAdjustTaxText = function() {
    var revenues = player.CustomsDutyRevenue + player.SalesTaxRevenue + player.IncomeTaxRevenue + player.JusticeRevenue;

    return `<table><tr><td>State revenues ${revenues.toFixed(2)} gold florins.</td></tr></table>` +
    `<table>
    <tr valign=bottom> <td>Customs Duty</td> <td>Sales Tax</td> <td>Income Tax</td> <td>Justice</td> </tr>
    <tr valign=top> <td>${player.CustomsDuty}%</td> <td>${player.SalesTax}%</td> <td>${player.IncomeTax}%</td> <td>${player.justiceAsString()}</td> </tr>
    <tr valign=top> <td>${player.CustomsDutyRevenue.toFixed(2)}</td> <td>${player.SalesTaxRevenue.toFixed(2)}</td> <td>${player.IncomeTaxRevenue.toFixed(2)}</td> <td>${player.JusticeRevenue.toFixed(2)}</td> </tr>
    </table>
    `;
}

const screenCustomsDutyText = function() {
    return `Sales Tax: ${player.CustomsDuty}%<br>
    New customs duty (0 to 100):`;
}

const screenSalesTaxText = function() {
    return `Customs Duty: ${player.SalesTax}%<br>
    New sales tax (0 to 50):`;
}

const screenIncomeTaxText = function() {
    return `Income Tax: ${player.IncomeTax}%<br>
    New wealth tax (0 to 25):`;
}

const screenJusticeText = function() {
    return `Justice: ${player.justiceAsString()}<br>
    New justice:`;
}

const checkBankruptcy = function(player) {
    AddRevenue(player);
    if (player.IsBankrupt) {
        advanceTo(screens.bankruptcy);
    } else {
        // advanceTo(screens.map);
        advanceTo(screens.statePurchases);
    }
}

const screenBankruptcyText = function() {
    return `${player.Title} ${player.Name} is bankrupt.<br>
            Creditors have seized much of your assets.`;
}

const screenStatsText = function() {
    return `<table>
    <tr><td>Nobles:</td> <td align=right>${player.Nobles}</td></tr>
    <tr><td>Soldiers:</td> <td align=right>${player.Soldiers}</td></tr>
    <tr><td>Clergy:</td> <td align=right>${player.Clergy}</td></tr>
    <tr><td>Merchants:</td> <td align=right>${player.Merchants}</td></tr>
    <tr><td>Serfs:</td> <td align=right>${player.Serfs}</td></tr>
    <tr><td>Land:</td> <td align=right>${player.Land}</td><td> hectares</td></tr>
    <tr><td>Treasury:</td> <td align=right>${player.Treasury.toFixed(2)}</td> <td> gold florins</td></tr>
    </table>`;
}

const screenStatePurchasesText = function() {
    return `<table>
    <tr><td colspan=2>State purchases:</td></tr>
    <tr><td colspan=2>&nbsp;</td></tr>
    <tr><td>Marketplace (${player.Marketplaces})</td> <td align=right>1000 florins</td></tr>
    <tr><td>Woolen mill (${player.Mills})</td> <td align=right>2000 florins</td></tr>
    <tr><td>Palace (partial) (${player.Palace})</td> <td align=right>3000 florins</td></tr>
    <tr><td>Cathedral (partial) (${player.Cathedral})</td> <td align=right>5000 florins</td></tr>
    <tr><td>Equip one platoon of serfs as soldiers (${player.Soldiers} soldiers)</td> <td align=right>500 florins</td></tr>
    <tr><td colspan=2>&nbsp;</td></tr>
    <tr><td>You have in your treasury</td> <td align=right>${player.Treasury.toFixed(2)} gold florins</td></tr>`;
}

const checkForNewTitle = function() {
    hideMap();
    const titleUpgrade = CheckNewTitle(player);
    if (titleUpgrade) {
        advanceTo(screens.newTitle);
    } else {
        endTurn(player);
    }
}

const screenNewTitleText = function() {
    return `The achievements of ${player.Name} warrant a new rank of ${player.Title}.`;
}

const screenDeathText = function() {
    var screen = `Very sad news.<br> ${player.Title} ${player.Name} has just died `;

    if (player.Year > 1450)
        screen += "of old age after a long reign.";
    else {
        var why = Random(8);
        switch (why) {
            case 0:
            case 1:
            case 2:
            case 3:
                screen += "of pneumonia after a cold winter in a drafty castle.";
                break;
            case 4:
                screen += "of typhoid after drinking contaminated water.";
                break;
            case 5:
                screen += "in a smallpox epidemic.";
                break;
            case 6:
                screen += "after being attacked by robbers while travelling.";
                break;
            case 7:
            case 8:
                screen += "of food poisoning.";
                break;
        }
    }
    player.IsDead = true;
    return screen;
}

const clearGame = function() {
    player = undefined;
    game = undefined;
    playerName = "";
    difficulty = undefined;
    isPlayerMale = undefined;
}

const startGame = function(playerMale) {
    setRulerIsMale(playerMale);
    initializeGame();
    initializePlayer();
}

// constants for drawing map
const TILE_WIDTH = 60;
const TILE_HEIGHT = 60;
const BUILDING_WIDTH = TILE_WIDTH * 3;
const BUILDING_HEIGHT = TILE_HEIGHT * 3;
const ROAD_WIDTH = TILE_WIDTH/5;
const ROAD_HEIGHT = TILE_HEIGHT;
const IMG_H = 128;  // height of SVG image
const IMG_W = 128;  // width of SVG image
const MAX_PARTS = 10;   // maximum number of parts that can be built in a building
const MAP_WIDTH = TILE_WIDTH * 13;
const MAP_HEIGHT = TILE_HEIGHT * 6;
const NUM_TILES_PER_FIELD_HOR = 5;
const NUM_TILES_PER_FIELD_VER = 3;
const ROAD_COL1 = NUM_TILES_PER_FIELD_HOR;
const ROAD_COL2 = NUM_TILES_PER_FIELD_HOR + 3;
const ROAD_COL3 = (NUM_TILES_PER_FIELD_HOR * 2) + 3;
const X_OFFSET = 3;

const sources = {
    img_grass: './img/grass-tile.svg',
    img_road_vertical: './img/road-vertical.svg',
    img_road_horizontal: './img/road-horizontal.svg',
    img_tree02: './img/tree02.svg',
    img_tree11: './img/tree11.svg',
    img_hill: './img/hill6.svg',
    img_marketplace: './img/warehouse.svg',
    img_mill: './img/windmill.svg',
    img_cathedral: './img/cathedral.svg',
    img_cathedral_outline:'./img/cathedral_outline.svg',
    img_palace_outline: './img/townhall_outline.svg',
    img_palace: './img/townhall.svg',
    img_tower: './img/tower_round.svg',
    img_barracks: './img/tent.svg',
}

// ensures that all images are loaded before calling a callback
// from http://www.java2s.com/Tutorials/HTML_CSS/HTML5_Canvas/0400__HTML5_Canvas_Image.htm
function loadImages(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    for(const src in sources) {
      numImages++;
    }
    for(const src in sources) {
      images[src] = new Image();
      images[src].onload = function() {
        if(++loadedImages >= numImages) {
          callback(images);
        }
      };
      images[src].src = sources[src];
    }
  }

const drawMap = function(player) {
    const ctx = map.getContext('2d');
    const ctx_terrain = ctx;
    ctx.canvas.width = MAP_WIDTH;
    ctx.canvas.height = MAP_HEIGHT;
    map.hidden = false;

    const num_marketplaces = player.Marketplaces;
    const num_mills = player.Mills;
    const num_barracks = Math.floor(player.Soldiers / SOLDIERS_PER_PLATOON);
    const num_palace = Math.min(player.Palace, 10);
    const num_cathedral = Math.min(player.Cathedral, 10);

    loadImages(sources, function(images) {
        // grass
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 13; j++) {
                ctx_terrain.drawImage(images.img_grass, j * TILE_WIDTH, i * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
            }
        }
        // roads
        for (var i = 0; i < 6; i++) {
            ctx_terrain.drawImage(images.img_road_vertical, ROAD_COL1 * TILE_WIDTH, i * TILE_HEIGHT, ROAD_WIDTH, ROAD_HEIGHT);
            ctx_terrain.drawImage(images.img_road_vertical, ROAD_COL2 * TILE_WIDTH, i * TILE_HEIGHT, ROAD_WIDTH, ROAD_HEIGHT);
        }
        for (var i = 0; i < 13; i++) {
            ctx_terrain.drawImage(images.img_road_horizontal, i * TILE_WIDTH, 3 * TILE_HEIGHT, TILE_WIDTH, ROAD_WIDTH);
        }
        // marketplace trees
        for (var j = 0; j < NUM_TILES_PER_FIELD_HOR; j++) {
            ctx.drawImage(images.img_tree02, j * TILE_WIDTH, 0, TILE_WIDTH, TILE_HEIGHT);
        }
        // marketplaces
        var marketplace_count = 0;
        for (var i = 1; i < NUM_TILES_PER_FIELD_VER; i++) {
            for (var j = 0; j < NUM_TILES_PER_FIELD_HOR; j++) {
                if (++marketplace_count > num_marketplaces) break;
                ctx.drawImage(images.img_marketplace, j * TILE_WIDTH, i * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
            }
        }
        // mills
        const mill_x_offset = 0;
        const mill_y_offset = BUILDING_HEIGHT;
        var mill_count = 0;
        for (var i = 1; i < NUM_TILES_PER_FIELD_VER; i++) {
          for (var j = 0; j < NUM_TILES_PER_FIELD_HOR; j++) {
              if (++mill_count > num_mills) break
              ctx.drawImage(images.img_mill, mill_x_offset + j * TILE_WIDTH, mill_y_offset + i * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
          }
        }
        // cathedral
        const cathedral_x_offset = TILE_WIDTH * ROAD_COL1;
        const cathedral_y_offset = 0;
        if (num_cathedral > 0) {
            drawBuilding(ctx, images.img_cathedral_outline, images.img_cathedral, cathedral_x_offset, cathedral_y_offset, num_cathedral);
        } else {
            drawBuilding(ctx, images.img_hill, images.img_hill, cathedral_x_offset, cathedral_y_offset, MAX_PARTS);
        }
        // palace
        const palace_x_offset = TILE_WIDTH * ROAD_COL1;
        const palace_y_offset = BUILDING_HEIGHT;
        if (num_palace > 0) {
            drawBuilding(ctx, images.img_palace_outline, images.img_palace, palace_x_offset, palace_y_offset, num_palace);
        } else {
            drawBuilding(ctx, images.img_tree11, images.img_tree11, palace_x_offset, palace_y_offset, MAX_PARTS);
        }
        // barracks fortifications
        ctx.drawImage(images.img_tower, (ROAD_COL2 + 2) * TILE_WIDTH, 0, TILE_WIDTH, TILE_HEIGHT);
        // barracks
        const barracks_x_offset = TILE_WIDTH * ROAD_COL2;
        const barracks_y_offset = TILE_HEIGHT;
        var barracks_count = 0;
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < NUM_TILES_PER_FIELD_HOR; j++) {
                if (++barracks_count > num_barracks) break;
                ctx.drawImage(images.img_barracks, (barracks_x_offset + j * TILE_WIDTH) + X_OFFSET, barracks_y_offset + i * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
            }
        }
      });
}

const drawBuilding = function(ctx, img_outline, img_building, x_offset, y_offset, num_parts_built) {
    x_offset += X_OFFSET;
    // outline
    ctx.drawImage(img_outline, x_offset, y_offset, BUILDING_WIDTH, BUILDING_HEIGHT);

    // actual building
    // source image coordinates for clipping
    const sWidth = IMG_W;
    const sHeight = (num_parts_built * (IMG_H / MAX_PARTS))
    const sy = IMG_H - sHeight;
    const sx = 0;
    // target coordinates for drawing
    const dWidth = BUILDING_WIDTH;
    const dHeight = (num_parts_built * (BUILDING_HEIGHT / MAX_PARTS));
    const dy = Math.floor(y_offset + (BUILDING_HEIGHT - dHeight));
    const dx = x_offset;
    ctx.drawImage(img_building,
        sx,
        sy,
        sWidth,
        sHeight,
        dx,
        dy,
        dWidth,
        dHeight);
}

const hideMap = function() {
    map.hidden = true;
}

// content of the different game screens
const screens = {
  start: {
    image: "./img/city.svg",
    text: "Santa Paravia and Fiumaccio.<br>Do you wish to read the instructions?",
    buttons: [["Yes", "advanceTo(screens.instructions)"], ["No", "advanceTo(screens.difficulty)"]]
  },
  instructions: {
    image: null,
    text: `Santa Paravia and Fiumaccio<BR><BR>
    You are the ruler of a 15th century Italian city-state. 
    If you rule well, you will receive higher titles. The 
    first player to become king or queen wins. Life expectancy 
    then was brief, so you may not live long enough to win.`,
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
    buttons: [["Male", "actionAndAdvanceTo(startGame(true),screens.newTurn)"],
              ["Female", "actionAndAdvanceTo(startGame(false),screens.newTurn)"]]
  },
  newTurn: {
    preprocess: "prepareBuySellGrain()",
    image: "./img/farm.svg",
    text: () => screenBuySellGrainText(),
    buttons: [["Buy grain", "advanceTo(screens.buyGrain)"], ["Sell grain", "advanceTo(screens.sellGrain)"], ["Buy land", "advanceTo(screens.buyLand)"], ["Sell land", "advanceTo(screens.sellLand)"], ["Continue", "advanceTo(screens.releaseGrain)"]]
  },
  buySellGrain: {
      image: "./img/farm.svg",
      text: () => screenBuySellGrainText(),
      buttons: [["Buy grain", "advanceTo(screens.buyGrain)"], ["Sell grain", "advanceTo(screens.sellGrain)"], ["Buy land", "advanceTo(screens.buyLand)"], ["Sell land", "advanceTo(screens.sellLand)"], ["Continue", "advanceTo(screens.releaseGrain)"]]
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
  releaseGrain: {
    image: "./img/tavern.svg",
    text: () => screenReleaseGrainText(),
    buttons: [["Minimum", "actionAndAdvanceTo(releaseMinGrain(),screens.population)"], ["Maximum", "actionAndAdvanceTo(releaseMaxGrain(),screens.population)"], ["Choose an amount", "advanceTo(screens.releaseGrainAmount)"]]
  },
  releaseGrainAmount: {
    image: "./img/tavern.svg",
    text: () => screenReleaseGrainText(),
    inputText: "releaseGrainAmount(input.value)"
  },
  population: {
    image: "./img/village.svg",
    text: () => screenPopulationText(),
    buttons: [["Continue", "checkBattle()"]]
  },
  battle: {
    preprocess: "attackRounds(player)",
    image: "./img/battle.svg",
    text: () => screenBattleText(),
    buttons: [["Continue", "advanceTo(screens.adjustTax)"]]
  },
  adjustTax: {
    preprocess: "GenerateIncome(player)",
    image: "./img/townhall_big.svg",
    text: () => screenAdjustTaxText(),
    buttons: [
        ["Customs Duty", "advanceTo(screens.customsDuty)"],
        ["Sales Tax", "advanceTo(screens.salesTax)"],
        ["Income Tax", "advanceTo(screens.incomeTax)"],
        ["Justice", "advanceTo(screens.justice)"],
        ["Continue", "checkBankruptcy(player)"]
    ]
  },
  customsDuty: {
    image: "./img/docks.svg",
    text: () => screenCustomsDutyText(),
    inputText: "actionAndAdvanceTo(adjustCustomsDuty(player,input.value),screens.adjustTax)"
  },
  salesTax: {
    image: "./img/inn.svg",
    text: () => screenSalesTaxText(),
    inputText: "actionAndAdvanceTo(adjustSalesTax(player,input.value),screens.adjustTax)"
  },
  incomeTax: {
    image: "./img/university.svg",
    text: () => screenIncomeTaxText(),
    inputText: "actionAndAdvanceTo(adjustIncomeTax(player,input.value),screens.adjustTax)"
  },
  justice: {
    image: "./img/gallows.svg",
    text: () => screenJusticeText(),
    buttons: [
        ["Very fair", "actionAndAdvanceTo(adjustJustice(player,1),screens.adjustTax)"],
        ["Moderate", "actionAndAdvanceTo(adjustJustice(player,2),screens.adjustTax)"],
        ["Harsh", "actionAndAdvanceTo(adjustJustice(player,3),screens.adjustTax)"],
        ["Outrageous", "actionAndAdvanceTo(adjustJustice(player,4),screens.adjustTax)"]
    ]
  },
  bankruptcy: {
    image: "./img/wreck.svg",
    text: () => screenBankruptcyText(),
    buttons: [["Oh, no!", "advanceTo(screens.statePurchases)"]]
  },
  stats: {
    image: "./img/round-tower-with-flag.svg",
    text: () => screenStatsText(),
    buttons: [["Continue", "advanceTo(screens.statePurchases)"]]
  },
  statePurchases: {
    preprocess: "drawMap(player)",
    image: null,
    text: () => screenStatePurchasesText(),
    buttons: [
        ["Buy Marketplace", "actionsAndAdvanceTo(hideMap(),BuyMarket(player),screens.statePurchases)"],
        ["Buy Woolen Mill", "actionsAndAdvanceTo(hideMap(),BuyMill(player),screens.statePurchases)"],
        ["Buy Palace (Partial)", "actionsAndAdvanceTo(hideMap(),BuyPalace(player),screens.statePurchases)"],
        ["Buy Cathedral (Partial)", "actionsAndAdvanceTo(hideMap(),BuyCathedral(player),screens.statePurchases)"],
        ["Equip Platoon", "actionsAndAdvanceTo(hideMap(),BuySoldiers(player),screens.statePurchases)"],
        ["Show Stats", "actionAndAdvanceTo(hideMap(),screens.stats)"],
        ["Continue", "checkForNewTitle()"]
    ]
  },
  newTitle: {
    image: "./img/throne.svg",
    text: () => screenNewTitleText(),
    buttons: [["Very well", "endTurn(player)"]]
  },
  death: {
    image: "./img/graveyard.svg",
    text: () => screenDeathText(),
    buttons: [["Let's try again...", "actionAndAdvanceTo(clearGame(),screens.start)"]]
  },
  victory: {
    image: "./img/sword-stone.svg",
    text: "Congratulations, you have been crowned Majesty and won the game!",
    buttons: [["Let's play again!", "actionAndAdvanceTo(clearGame(),screens.start)"]]
  },

};

// start game
inputArea.hidden = true;
map.hidden = true;
advanceTo(screens.start);