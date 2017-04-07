//OK
function showNightPhase(){
    resetRadioButtons();
    document.getElementById("dayHeader").style.display = "none";
    document.getElementById("radioBox").style.display = "none";
    document.getElementById("dayVoteButton").style.display = "none";

    console.log("Now performing role: " + dataStore.getMyRole());
    if (dataStore.getMyRole() === "villager")
        villagerAction();
    else if (dataStore.getMyRole() === "werewolf")
        werewolfAction();

    function villagerAction(){
        dataStore.waitForAll("nightWait", postNightPhase, "$null");
    }

    function werewolfAction(){
        document.getElementById("wolfHeader").style.display = "block";
        document.getElementById("radioBox").style.display = "block";
        document.getElementById("nightWolfButton").style.display = "block";
        //show wolf things

        //dataStore.waitForAll("nightWait", dataStore.getNumPlayers(), postNightPhase);
        //for (var i in activePlayers){
        //    document.getElementById("nightBox").innerHTML += "<button id='wbutton-" + i +"' onclick='wereVote(this)'>" + activePlayers[i].name + "</button>";
        //}
    }
}

//Change to use radio buttons
function wereVote() {
    document.getElementById("wolfHeader").style.display = "none";
    document.getElementById("radioBox").style.display = "none";
    document.getElementById("nightWolfButton").style.display = "none";

    dataStore.waitForAll("nightWait", postNightPhase, getRadioPlayerIndex());
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
