function showNightPhase(){
    console.log("Now performing role: " + myRole);
    if (myRole === "villager")
        villagerAction();
    else if (myRole === "werewolf")
        werewolfAction();

    function villagerAction(){
        document.getElementById("nightBox").innerHTML = "Waiting for dawn.";
        waitForAll(roomRef.child("nightWait"), numPlayers, postNightPhase);
    }

    function werewolfAction(){
        document.getElementById("nightBox").innerHTML = null;
        for (var i in activePlayers){
            document.getElementById("nightBox").innerHTML += "<button id='wbutton-" + i +"' onclick='wereVote(this)'>" + activePlayers[i].name + "</button>";
        }
    }
}

function wereVote(button) {
    var wereVoteRef = roomRef.child("wereVote/" + playerID);

    wereVoteRef.set(button.id.slice(8));
    //wereVoteRef.onDisconnect().remove();

    waitForAll(roomRef.child("nightWait"), numPlayers, postNightPhase);
}

function postNightPhase(){
    var loser = {index: null, count: 0};
    var fullWereVoteRef = roomRef.child("wereVote");

    fullWereVoteRef.once("value", function(snapshot) {
        document.getElementById("nightBox").innerHTML = null;
        var voteArray = [];
        for (var i in snapshot.val()){
            (voteArray[snapshot.val()[i]] === undefined ) ? voteArray[snapshot.val()[i]] = 1 : voteArray[snapshot.val()[i]]++;
            addToLog(i + " has voted for " + activePlayers[snapshot.val()[i]].name + ". (WOLF)");
            if (voteArray[snapshot.val()[i]] > loser.count){
                loser.index = snapshot.val()[i];
                loser.count = voteArray[snapshot.val()[i]];
            }
            else if (voteArray[snapshot.val()[i]] === loser.count){
                loser.index = "tie";
            }
        }
        if (amHost)
            fullWereVoteRef.remove();
        addToLog("The werewolves have struck. " + activePlayers[loser.index].name + " has disappeared.");
        numPlayers--;

        var iLost = false;
        if (activePlayers[loser.index].name === playerID)
            iLost = true;
        activePlayers.splice(loser.index,1);
        if (iLost)
            leaveGame();
        else
            showDayPhase();
    }, function(error) {
            console.log("Error getting the number of ready players: " + error.code);
    });
}
