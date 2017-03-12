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
var readyRef;

var lettersandnumbers = /\w+/;
var activePlayers;
var numPlayers = 1;

var myRole;
var amHost = false;

var pendingFunction = function(){};

var numWolf = 1

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

function addToLog(item){
    var log = document.getElementById("gameLog");
    log.innerHTML += "<div class='logitem'>" + item + "</div>";
}

function leaveGame () {
    //change to dialog that shows
    addToLog("You have left the game");
    playerRef.onDisconnect().cancel();
    playerRef.remove();
}

function destroyRoom (){
    roomRef.child("players").set({Status: {name: "no names yet"}});
    roomRef.remove();
}

function updateNames(activePlayers) {
    document.getElementById("activeList").innerHTML = null;
    for (var i in activePlayers) {
        document.getElementById("activeList").innerHTML += "<span class='playername'>" + activePlayers[i].name + "</span>";
    }
}
