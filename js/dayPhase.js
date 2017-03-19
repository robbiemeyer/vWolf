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

function selectVote(radioButton){
    console.log(radioButton.value);
}

function dayVote(){
    var loser = {index: null, count: 0};

    var dayVoteRef = roomRef.child("dayVote/" + playerID);

    roomRef.child("dayVote").on("value", function(snapshot) {
        var numReadyPlayers = 0;
        for (var i in snapshot.val())
            numReadyPlayers += 1;

        console.log(numReadyPlayers + " ready players");
        if (numReadyPlayers === numPlayers){
            roomRef.child("dayVote").off();
            dayVoteRef.onDisconnect().cancel();
            //button.parentElement.innerHTML = "";
            var voteArray = [];
            for (var i in snapshot.val()){
                (voteArray[snapshot.val()[i]] === undefined ) ? voteArray[snapshot.val()[i]] = 1 : voteArray[snapshot.val()[i]]++;
                addToLog(i + " has voted for " + activePlayers[snapshot.val()[i]].name + ".");
                if (voteArray[snapshot.val()[i]] > loser.count){
                    loser.index = snapshot.val()[i];
                    loser.count = voteArray[snapshot.val()[i]];
                }
                else if (voteArray[snapshot.val()[i]] === loser.count){
                    loser.index = "tie";
                }
            }
            if (amHost)
                roomRef.child("dayVote").remove();
            addToLog("The town has spoken. " + activePlayers[loser.index].name + ", your time has come.");
            numPlayers--;

            var iLost = false;
            if (activePlayers[loser.index].name === playerID)
                iLost = true;
            activePlayers.splice(loser.index,1);
            if (iLost)
                leaveGame();
            else
                showNightPhase();
        }
    }, function(error) {
            console.log("Error gettting the number of ready players: " + error.code);
    });

//    console.log(document.getElementsByName();
//    dayVoteRef.set(button.id.slice(7));
    dayVoteRef.set(getRadioPlayerIndex());
    dayVoteRef.onDisconnect().remove();

}


