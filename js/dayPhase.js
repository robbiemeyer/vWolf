function showDayPhase(){
    document.getElementById("pregamescreen").style.display = "none";
    document.getElementById("dayscreen").style.display = "block";
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
    dataStore.waitForAll("dayVote", dataStore.getNumPlayers(), postDayVote, getRadioPlayerIndex());
}

//TODO TIES
function postDayVote(voteData){
    var loserIndex = countVotes(voteData, false);
    
    addToLog("The town has spoken. " + dataStore.getPlayerName(loserIndex) + ", your time has come.");

    var iLost = false;
    if (dataStore.getPlayerName(loserIndex) === dataStore.getMyName())
        iLost = true;

    dataStore.removePlayerLocally(loserIndex);

    if (iLost)
        dataStore.leaveGame();
    else
        showNightPhase();
}

function countVotes (playerVotes, isSilent){
    var loser = {index: null, count: 0};
    var voteArray = [];

    for (var i in playerVotes){
        if ( playerVotes[i] !== "$null") {
            (voteArray[playerVotes[i]] === undefined ) ? voteArray[playerVotes[i]] = 1 : voteArray[playerVotes[i]]++;
            if (!isSilent)
                addToLog(i + " has voted for " + dataStore.getPlayerName(playerVotes[i]) + ".");
            if (voteArray[playerVotes[i]] > loser.count){
                loser.index = playerVotes[i];
                loser.count = voteArray[playerVotes[i]];
            }
            else if (voteArray[playerVotes[i]] === loser.count){
                loser.index = "tie";
            }
        }
    }

    return loser.index;
}

