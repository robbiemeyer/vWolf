function enterRoom (){
    console.log("Entering Room");
    //Get IDs
    playerID = document.getElementById("userBox").value;
    roomID = document.getElementById("roomBox").value;

    if (/\w+/.test(playerID) && /\w+/.test(roomID)){

        //Create references
        roomRef = firebase.database().ref(roomID);
        playerRef = roomRef.child("players").push();

        //Set-up disconnect
        playerRef.onDisconnect().remove();

        //Listen for list of active players
        roomRef.child("players").on("value", function(snapshot) {
            activePlayers = [];
            if (snapshot.val() !== null) {
                for (var i in snapshot.val()){
                    activePlayers.push({name:snapshot.val()[i], key: i});
                }
                if (playerID === activePlayers[0].name)
                    amHost = true;
                numPlayers = activePlayers.length;
                console.log("Numplayers = " + numPlayers);
                updateNames(activePlayers);
            }
        }, function(error) {
            console.log("Error gettting the names of the players: " + error.code);
        });

        //Create current player
        playerRef.set(playerID);
        console.log(playerID + " : " + roomID);

        document.getElementById("currentRoom").innerHTML = "Room: " + roomID;
        document.getElementById("loginscreen").style.display = "none";
        document.getElementById("gamescreen").style.display = "block";
    }
    else {
        console.log("Invalid IDs");
    }
}

function becomeReady(button){
    if (button.innerHTML == "Ready?"){
        button.innerHTML = "Waiting";

        button.style.backgroundColor = "#552200";

        readyRef = waitForAll(roomRef.child("readyPlayers"),numPlayers, playGame);
        //roomRef.child("readyPlayers").on("value", function(snapshot) {
        //    numReadyPlayers = 0;
        //    for (var i in snapshot.val())
        //        numReadyPlayers += 1;

        //    console.log(numReadyPlayers + " ready players");
        //    if (numReadyPlayers === numPlayers){
        //        roomRef.child("readyPlayers").off();
        //        playerReadyRef.onDisconnect().cancel();
        //        playGame()
        //    }
        //}, function(error) {
        //    console.log("Error gettting the number of ready players: " + error.code);
        //});


    } else if (button.innerHTML == "Waiting"){
        button.innerHTML = "Ready?";
        button.style.backgroundColor = "#784421";

        roomRef.child("readyPlayers").off();
        readyRef.onDisconnect().cancel();
        readyRef.remove();
    }
}

function assignRoles(){
    var numVillagers = numPlayers - numWolf;

    var assignRoleArray = [];

    for (i = 0; i < numWolf; i++)
        assignRoleArray.push("werewolf");
    for (i = 0; i < numVillagers; i++)
        assignRoleArray.push("villager");
    console.log(assignRoleArray);

    assignRoleArray = shuffle(assignRoleArray);

    for (var i in assignRoleArray){
        firebase.database().ref(roomID + "/roles/" + activePlayers[i].name).set(assignRoleArray[i]);
        console.log(activePlayers[i].name + ": " + assignRoleArray[i]);
    }
}

function playGame(){

    console.log("GAME HAS STARTED");

    console.log("I am the host " + amHost);
    if (amHost) 
        assignRoles();

    //Get Roles
    var timer = setTimeout (function(){
        console.log("Could not get role... taking too long");
    }, 3000);

    roomRef.child("roles/" + playerID).on("value", function(snapshot) {
        myRole = snapshot.val();
        if (snapshot.val() !== null){
            clearTimeout(timer);
            console.log(myRole);
            roomRef.child("roles/" + playerID).off();
        }
    }, function(error) {
        console.log("Error gettting role: " + error.code);
    });

    showDayPhase();
}

