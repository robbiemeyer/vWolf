// Initialize Firebase
var config = {
    apiKey: "AIzaSyBKNDatJSQinLUEpakV7R3fAn1P1NIUONQ",
    authDomain: "vwolf-4b90d.firebaseapp.com",
    databaseURL: "https://vwolf-4b90d.firebaseio.com"
};
firebase.initializeApp(config);

//Possibly create other function to hold html interactions

// IDs and References (Should be set by user)
var roomRef = null;
var playerRef = null;

var activePlayers = new Array();

var me = {
    name: null,
    role:  "unassigned",
    amHost: false
};

var roleNum = {
    villager: activePlayers.length,
    wolf: 0,
    seer: 0
};

function shuffle (array){
    var currentIndex = array.length;
    var randomIndex;
    var tempVal;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        tempVal = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempVal;
    }

    return array;
}

function updateNames(activePlayers) {
    activeBox = document.getElementById("activeList")
    radioBox = document.getElementById("radioBox");

    activeBox.innerHTML = null;
    radioBox.innerHTML = null;
    for (var i in activePlayers) {
        document.getElementById("activeList").innerHTML += "<div class='playername'>" + activePlayers[i].name + "</div>";
        radioBox.innerHTML += "<div class=playername><input type=radio class='voteRadio' name='target' id=" + i + "radio value=" + i +" ><label class=radiolabel for=" + i + "radio >" + activePlayers[i].name + "</label></div>";
    }
    //To clear the buttons, can change the hidden button to be active
    radioBox.innerHTML += "<input type=radio name='target' value='$null' id='noRadio'>";
}

function getRadioPlayerIndex(){
    var radioButtons = document.getElementsByClassName("voteRadio");
    var selected = "$null";
    for (var i = 0; i < radioButtons.length; i++){
        if (radioButtons[i].checked){
            selected = radioButtons[i].value;
            break;
        }
    }
    return selected;
}

function resetRadioButtons(){
    document.getElementById("noRadio").checked = true;
    return true;
}

function addToLog(item){
    var log = document.getElementById("gameLog");
    log.innerHTML += "<div class='logitem'>" + item + "</div>";
    return log.innerHTML;
}

