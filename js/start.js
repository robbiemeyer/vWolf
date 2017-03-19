function enterRoom (){
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
                for (var i in snapshot.val()){
                    activePlayers.push({name:snapshot.val()[i], key: i});
                }
                if (playerID === activePlayers[0].name)
                    amHost = true;
                numPlayers = activePlayers.length;
                console.log("Numplayers = " + numPlayers);
                updateNames(activePlayers);
            roleNum.villager = numPlayers - roleNum.wolf - roleNum.seer;
            var readyButton = document.getElementById("readyButton");
            if (roleNum.villager < 0){
                readyButton.setAttribute("disabled", "true");
                if (readyRef)
                    getReady(readyButton);
            }
            else
                readyButton.removeAttribute("disabled");
        }, function(error) {
            console.log("Error gettting the names of the players: " + error.code);
        });

        //Listen for number of each role
        roomRef.child("roleSettings").on("value", function(snapshot) {
            for (var role in snapshot.val()){
                var checkRole = snapshot.val()[role]; 
                if (checkRole <= 0)
                    document.getElementById(role + "minus").setAttribute("disabled", true);
                else
                    document.getElementById(role + "minus").removeAttribute("disabled");

                if (checkRole !== null){
                    roleNum[role] = checkRole;
                    document.getElementById(role + "NumDisplay").innerHTML = roleNum[role];
                }
            }
            roleNum.villager = numPlayers - roleNum.wolf - roleNum.seer;
            if (roleNum.villager < 0){
                var readyButton = document.getElementById("readyButton");
                readyButton.setAttribute("disabled", "true");
                if (readyRef)
                    getReady(readyButton);
            }
            else {
                document.getElementById("readyButton").removeAttribute("disabled");
            }
        }, function(error) {
            console.log("Error gettting the roles of the players: " + error.code);
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

function getReady(button){
    if (button.innerHTML == "Ready?"){
        button.innerHTML = "Waiting";

        button.classList.add("holdActive");

        readyRef = waitForAll(roomRef.child("readyPlayers"),numPlayers, playGame);

    } else if (button.innerHTML == "Waiting"){
        //Need to catch exception here
        button.innerHTML = "Ready?";
        button.classList.remove("holdActive");

        roomRef.child("readyPlayers").off();
        readyRef.onDisconnect().cancel();
        readyRef.remove();
        readyRef = false;
    }
}

function changeRoleCount(increment, role){
    if (roleNum[role] === 0 )
        document.getElementById(role + "minus").removeAttribute("disabled");
    roleNum[role] += increment; 
    document.getElementById(role + "NumDisplay").innerHTML = roleNum[role];
    roleNum.villager -= increment;
    roomRef.child("roleSettings/" + role).transaction(function(currentVal){
        currentVal += increment;
        return currentVal;
    });
    if (roleNum[role] === 0 )
        document.getElementById(role + "minus").setAttribute("disabled", true);
}

function assignRoles(){
    var numVillagers = numPlayers - roleNum.wolf - roleNum.seer;

    var assignRoleArray = [];

    for (i = 0; i < roleNum.wolf; i++)
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

