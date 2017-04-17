function showDayPhase(){
    document.getElementById("pregamescreen").style.display = "none";
    document.getElementById("banner").style.display = "block";
    document.getElementById("logHeader").style.display = "block";
    document.getElementById("gameLog").style.display = "block";
    document.getElementById("dayHeader").style.display = "block";
    document.getElementById("radioBox").style.display = "block";
    document.getElementById("dayVoteButton").style.display = "block";
    //checkGameEnd();
    //var buttonBox = document.getElementById("dayVoteBoxes");
    //buttonBox.innerHTML = null;

    //for (var i in activePlayers){
    //    buttonBox.innerHTML += "<button id='button-" + i +"' onclick='dayVote(this)'>" + activePlayers[i].name + "</button>";
    //}
    //show voting buttons
}
//???
//function selectVote(radioButton){
//    console.log(radioButton.value);
//}

//Create generic activateListener(child, action) and deactivateListener(child)

function dayVote(){
    document.getElementById("dayHeader").style.display = "none";
    document.getElementById("radioBox").style.display = "none";
    document.getElementById("dayVoteButton").style.display = "none";

    dataStore.waitForAll("dayVote", postDayVote, getRadioPlayerIndex());
    document.getElementById("notice").innerHTML = "Waiting...";
    document.getElementById("notice").style.display = "block";
}

function postDayVote(voteData){
    var loserIndex = countVotes(voteData, false);
    var loserRole = dataStore.getPlayerRole(loserIndex);
    var gameEnded = false;
    var iLost = false;
    if (this.losingWolf === undefined)
        this.losingWolf = 0;
    
    console.log(dataStore.getRoleCount("wolf") );
    console.log(this.losingWolf);

    if (loserIndex >= 0){
        addToLog("The town has spoken. " + dataStore.getPlayerName(loserIndex) + " the " + loserRole + ", your time has come.");

        if (loserRole === "werewolf")
            this.losingWolf += 1;
    }
    else 
        addToLog("The vote was tied, all shall survive.");

    if (dataStore.getRoleCount("wolf") - this.losingWolf === 0)
        gameEnded = "villager";
    else if (dataStore.getRoleCount("wolf") - this.losingWolf >= (dataStore.getNumPlayers() - 1)/ 2)
        gameEnded = "wolf";

    if (dataStore.getPlayerName(loserIndex) === dataStore.getMyName())
            iLost = true;

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
