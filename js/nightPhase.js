//OK
function showNightPhase(){
    resetRadioButtons();
    console.log("Now performing role: " + dataStore.getMyRole());
    if (dataStore.getMyRole() === "villager")
        villagerAction();
    else if (dataStore.getMyRole() === "werewolf")
        werewolfAction();

    function villagerAction(){
//        dataStore.waitForAll("nightWait", dataStore.getNumPlayers(), postNightPhase, "$null");
    }

    function werewolfAction(){
        //show wolf things

        //dataStore.waitForAll("nightWait", dataStore.getNumPlayers(), postNightPhase);
        //for (var i in activePlayers){
        //    document.getElementById("nightBox").innerHTML += "<button id='wbutton-" + i +"' onclick='wereVote(this)'>" + activePlayers[i].name + "</button>";
        //}
    }
}

//Change to use radio buttons
function wereVote() {
    //var wereVoteRef = roomRef.child("wereVote/" + me.name);

    //wereVoteRef.set(button.id.slice(8));
    //wereVoteRef.onDisconnect().remove();

    dataStore.waitForAll("nightWait", dataStore.getNumPlayers(), postNightPhase, getRadioPlayerIndex());
}

function postNightPhase(voteData){ 
    var loserIndex = countVotes(voteData, true);
    
    addToLog("During the night " + dataStore.getPlayerName(loserIndex) + " disappeared.");

    var iLost = false;
    if (dataStore.getPlayerName(loserIndex) === dataStore.getMyName())
        iLost = true;

    dataStore.removePlayerLocally(loserIndex);

    if (iLost)
        dataStore.leaveGame();
    else
        showDayPhase();
};

function ppostNightPhase(){
    var loser = {index: null, count: 0};
    var fullWereVoteRef = roomRef.child("wereVote");

    fullWereVoteRef.once("value", function(snapshot) {
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
        if (me.amHost)
            fullWereVoteRef.remove();
        addToLog("The werewolves have struck. " + activePlayers[loser.index].name + " has disappeared.");

        var iLost = false;
        if (activePlayers[loser.index].name === me.name)
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
