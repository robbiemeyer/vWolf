//Display appropriate elements as determined by role
function showNightPhase(){
    resetRadioButtons();
    document.getElementById("dayHeader").style.display = "none";
    document.getElementById("radioBox").style.display = "none";
    document.getElementById("dayVoteButton").style.display = "none";

    if (dataStore.getMyRole() === "villager")
        villagerAction();
    else if (dataStore.getMyRole() === "werewolf")
        werewolfAction();

    //The villager just waits for the night to end
    function villagerAction(){
        dataStore.waitForAll("nightWait", postNightPhase, "$null");
        document.getElementById("notice").innerHTML = "Waiting for night to end...";
        document.getElementById("notice").style.display = "block";
    }

    //Werewolves need to vote
    function werewolfAction(){
        document.getElementById("wolfHeader").style.display = "block";
        document.getElementById("radioBox").style.display = "block";
        document.getElementById("nightWolfButton").style.display = "block";
    }
}

//Vote for player and wait for all other players to finish
function wereVote() {
    document.getElementById("wolfHeader").style.display = "none";
    document.getElementById("radioBox").style.display = "none";
    document.getElementById("nightWolfButton").style.display = "none";

    dataStore.waitForAll("nightWait", postNightPhase, getRadioPlayerIndex());
    document.getElementById("notice").innerHTML = "Waiting for night to end...";
    document.getElementById("notice").style.display = "block";
}

//Count votes and remove player who was removed by the werewolves
function postNightPhase(voteData){ 
    var loserIndex = countVotes(voteData, true);
    
    addToLog("During the night " + dataStore.getPlayerName(loserIndex) + " disappeared.");

    var iLost = false;
    if (dataStore.getPlayerKey(loserIndex) === dataStore.getMyKey())
        iLost = true;

    document.getElementById("notice").style.display = "none";
    if (iLost)
        dataStore.leavePlayer();
    else
        showDayPhase();
};
