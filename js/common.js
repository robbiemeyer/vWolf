// Initialize Firebase
var config = {
    apiKey: "AIzaSyBKNDatJSQinLUEpakV7R3fAn1P1NIUONQ",
    authDomain: "vwolf-4b90d.firebaseapp.com",
    databaseURL: "https://vwolf-4b90d.firebaseio.com"
};
firebase.initializeApp(config);

// IDs and References (Should be set by user)
var roomID;
var playerID;
var roomRef;
var playerRef;
var readyRef = false;

//var lettersandnumbers = /\w+/;
var activePlayers;
var numPlayers = 1;

var myRole;
var amHost = false;

//var pendingFunction = function(){};

var roleNum = {
    villager: numPlayers,
    wolf: 0,
    seer: 0
};

function waitForAll (reference, num, action){
    var playerReadyRef;
    reference.on("value", function(snapshot) {
        var numReadyPlayers = 0;
        for (var i in snapshot.val())
            numReadyPlayers += 1;

        console.log(numReadyPlayers + " ready players");
        if (numReadyPlayers === num){
            reference.off();
            playerReadyRef.onDisconnect().cancel();
            if (amHost)
                reference.remove();
            action()
        }
    }, function(error) {
        console.log("Error gettting the number of ready players: " + error.code);
    });

    playerReadyRef = reference.push();
    playerReadyRef.onDisconnect().remove();
    playerReadyRef.set(playerID);

    return playerReadyRef
}

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
    radioBox.innerHTML += "<input type=radio name='target' value='none' id='noRadio'>";
}

function getRadioPlayerIndex(){
    var radioButtons = document.getElementsByClassName("voteRadio");
    var selected = "none";
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

function leaveGame () {
    //change to dialog that shows
    addToLog("You have left the game");
    playerRef.onDisconnect().cancel();
    playerRef.remove();
    return true;
}

//function destroyRoom (){
//    roomRef.child("players").set({Status: {name: "no names yet"}});
//    roomRef.remove();
//}

