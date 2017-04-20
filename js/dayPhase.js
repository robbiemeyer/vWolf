//Change display elements for the day phase
function showDayPhase(){
    document.getElementById("pregamescreen").style.display = "none";
    document.getElementById("banner").style.display = "block";
    document.getElementById("logHeader").style.display = "block";
    document.getElementById("gameLog").style.display = "block";
    document.getElementById("dayHeader").style.display = "block";
    document.getElementById("radioBox").style.display = "block";
    document.getElementById("dayVoteButton").style.display = "block";
}

//Change display elements for post-vote and wait for all players to vote
function dayVote(){
    document.getElementById("dayHeader").style.display = "none";
    document.getElementById("radioBox").style.display = "none";
    document.getElementById("dayVoteButton").style.display = "none";

    dataStore.waitForAll("dayVote", postDayVote, getRadioPlayerIndex());
    document.getElementById("notice").innerHTML = "Waiting...";
    document.getElementById("notice").style.display = "block";
}

//Count votes, remove player and check for win
//Votedata is an object passed by waitForAll and contains all voting data
function postDayVote(voteData){
    var loserIndex = countVotes(voteData, false); //-1 if tie
    var loserRole = dataStore.getPlayerRole(loserIndex);
    var gameEnded = false;
    var iLost = false;

    //Store the number of wolves that have lost
    if (this.losingWolf === undefined)
        this.losingWolf = 0;
    
    console.log(dataStore.getRoleCount("wolf") );
    console.log(this.losingWolf);

    //If it was't a tie
    if (loserIndex >= 0){
        addToLog("The town has spoken. " + dataStore.getPlayerName(loserIndex) + " the " + loserRole + ", your time has come.");

        if (loserRole === "werewolf")
            this.losingWolf += 1;
    }
    else 
        addToLog("The vote was tied, all shall survive.");

    //Check endgame conditions
    if (dataStore.getRoleCount("wolf") - this.losingWolf === 0)
        gameEnded = "villager";
    else if (dataStore.getRoleCount("wolf") - this.losingWolf >= (dataStore.getNumPlayers() - 1)/ 2)
        gameEnded = "wolf";

    if (dataStore.getPlayerKey(loserIndex) === dataStore.getMyKey())
            iLost = true;

    //Complete appropriate actions based on endgame/losing results
    document.getElementById("notice").style.display = "block";
    if (gameEnded === "villager"){
        addToLog("The werewolf threat is no more. Villagers win!");
        document.getElementById("notice").innerHTML = "Villagers Win";
        dataStore.leaveRoom();
        dataStore.leavePlayer();
    }
    else if (gameEnded === "wolf"){
        addToLog("There are too few surviving villagers. Werewolves win!");
        document.getElementById("notice").innerHTML = "Werewolves Win";
        dataStore.leaveRoom();
        dataStore.leavePlayer();
    }
    else if (iLost){
        document.getElementById("notice").style.display = "none";
        dataStore.leavePlayer();
    }
    else{
        document.getElementById("notice").style.display = "none";
        showNightPhase();
    }
}

//Count the vote results
//Inputs are an object stroing all player votes and a boolean that determines if function should output to the log
//Returns the index in the vote array of the player with the most votes or -1 if it is a tie
function countVotes (playerVotes, isSilent){
    var loser = {index: null, count: 0};
    var voteArray = [];

    for (var i in playerVotes){
        if ( playerVotes[i].text !== "$null") {
            (voteArray[playerVotes[i].text] === undefined ) ? voteArray[playerVotes[i].text] = 1 : voteArray[playerVotes[i].text]++;
            if (!isSilent)
                addToLog(playerVotes[i].name + " has voted for " + dataStore.getPlayerName(playerVotes[i].text) + ".");
            if (voteArray[playerVotes[i].text] > loser.count){
                loser.index = playerVotes[i].text;
                loser.count = voteArray[playerVotes[i].text];
            }
            else if (voteArray[playerVotes[i].text] === loser.count){
                loser.index = -1;
            }
        }
    }

    return loser.index;
}
