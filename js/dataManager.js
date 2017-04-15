//Expects firebase to be working

function dataManager (playerName, roomName){
//Public Functions
    this.getNumPlayers = function () {
        return activePlayers.length;
    }

    this.getPlayerName = function (index){
        return activePlayers[index].name;
    }

    this.getMyName = function () {
        return playerID;
    }

    this.removePlayerLocally = function (index) {
        activePlayers.splice(index,1);
        return true;
    }

    this.checkIfHost = function () {
        return hostStatus;
    }

    this.changeGameStatus = function (string) {
        roomRef.child("gameStatus").set(string);
        return string;
    }

    this.getRoleCount = function (role) {
        if (roleNum[role] === undefined)
            return false;
        else
            return roleNum[role];
    }

    this.incrementRoleCount = function (role, increment) {
        if (role === "villager")
            return false;
        else {
            roleNum[role] += increment;
            roleNum["villager"] -= increment;
            roomRef.child("roleSettings/" + role).transaction(function(currentVal){
                currentVal += increment;
                return currentVal;
            });
            return true;
        }
    }

    this.addPlayerWithRole = function (playerIndex, role) {
        roomRef.child("roles/" + activePlayers[playerIndex].key).set(role);
        return true;
    }

    this.getMyRole = function () {
        if (playerRoles !== null)
            return playerRoles[playerRef.key];
        else
            return null;
    }

    this.getPlayerRole = function (index) {
        return playerRoles[activePlayers[index].key];
    }

    this.waitForAll = function (refLocation, action, text){
        var playerReadyRef = roomRef.child(refLocation).push();
        if (text === undefined)
            playerReadyRef.set({name: playerID, text: "Waiting..."});
        else
            playerReadyRef.set({name: playerID, text: text});
        playerReadyRef.onDisconnect().remove();

        roomRef.child(refLocation).on("value", function(snapshot) {
            var numReadyPlayers = 0;
            for (var i in snapshot.val())
                numReadyPlayers += 1;

            console.log(numReadyPlayers + " ready players");
            if (numReadyPlayers === activePlayers.length){
                var data = snapshot.val();
                roomRef.child(refLocation).off();
                playerReadyRef.onDisconnect().cancel();
                playerReadyRef.remove();
                action(data);
            }
        }, function(error) {
            console.log("Error gettting the number of ready players: " + error.code);
        });

        return playerReadyRef;
    }

    this.removeWait = function (readyRef) {
        readyRef.parent.off();
        readyRef.onDisconnect().cancel();
        readyRef.remove();
        return true;
    }

    this.beginStartedGameSettings = function (){
        roomRef.child("roleSettings").off();
        playerRef.onDisconnect().cancel();

        return true;
    }

    this.readDatabase = function (refLocation) {
        var dataValue = null;
        roomRef.child(refLocation).once("value", function(snapshot){
            dataValue = snapshot.val();
        }, function (error) {
            console.log("Error reading database: " + error.code);
        });
        return dataValue;
    }

    this.leaveRoom = function () {
        roomRef.child("players").off();
        roomRef.child("roleSettings").off();
        roomRef.child("roles").off();
        return true;
    }

    this.leavePlayer = function () {
        addToLog("You have left the game");
        playerRef.onDisconnect().cancel();
        playerRef.remove();
        roomRef.child("roles/" + playerID).remove();
        return true;
    }
//Private Variables
    
    //Arguments
    var playerID = playerName;
    var roomID = roomName;

    //Room references
    var roomRef = firebase.database().ref(roomID);
    var playerRef = null; //Set later
    var hostStatus = false;

    //Information about roles
    var roleNum = {
        villager: 0,
        wolf: 0,
        seer: 0
    };
    var playerRoles = null;

    //Active Player Information
    function player (playername, playerkey){
        this.name = playername;
        this.key = playerkey;
    }
    var activePlayers = new Array();

    var firstPlayer = false;
//Start-up functionality...
    //Check to see if the game has already started in that room, if it has then do not join
    var firstLogin = true;
    roomRef.child("players").once("value", function(snapshot) {
        if (firstLogin) {
            var gameStarted = false;
            if (snapshot.val() === null || snapshot.val().length < 2 || Date.now() - snapshot.val().lastDate > 86400000){
                roomRef.remove();
                roomRef.child("players/lastDate").set(Date.now());
            }
            else {
                roomRef.child("gameStatus").once("value", function(statussnapshot) {
                    if (statussnapshot.val() === "started"){
                        document.getElementById("pregamescreen").style.display = "none";
                        document.getElementById("alreadyStarted").style.display = "block";
                        if (playerRef !== null)
                            playerRef.remove();
                        gameStarted = true;
                    } 
                    else {
                        roomRef.child("players/lastDate").set(Date.now());
                    }
                }, function(error){
                    console.log("Error getting the status of the room: " + error.code);
                });
            }

            if (!gameStarted){
                playerRef = roomRef.child("players").push();
                playerRef.set(playerID);
                playerRef.onDisconnect().remove(function(error){
                    if (error !== null){
                        console.log(error);
                        document.getElementById("pregamescreen").style.display = "none";
                        window.alert("An error occured and you could not be added to the game. Please refresh the page and try again");
                        playerRef.remove();
                    }
                });
            }

            firstLogin = false;
        }
    });

    //Listeners and connections to firebase
    roomRef.child("players").on("value", function(snapshot) {
        activePlayers = new Array();
            for (var i in snapshot.val()){
                if (i !== "lastDate")
                    activePlayers.push(new player (snapshot.val()[i], i));
                //activePlayers.push({name:snapshot.val()[i], key: i});
            }

            if (activePlayers[0] !== undefined && playerID === activePlayers[0].name)
                hostStatus = true;
        
        console.log("Numplayers = " + activePlayers.length);
        updateNames(activePlayers);
        roleNum.villager = activePlayers.length - roleNum.wolf - roleNum.seer;

        checkForValidRoleCounts();
    }, function(error) {
        console.log("Error gettting the names of the players: " + error.code);
    });
    
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
        roleNum.villager = activePlayers.length - roleNum.wolf - roleNum.seer;

        checkForValidRoleCounts();
    }, function(error) {
        console.log("Error gettting the role counts of the players: " + error.code);
    });

    function checkForValidRoleCounts() {
        var readyButton = document.getElementById("readyButton");
        if (roleNum.villager < 0){
            readyButton.setAttribute("disabled", "true");
            if (/holdActive/.test(readyButton.className))
                getReady(readyButton);
        }
        else {
            readyButton.removeAttribute("disabled");
        }
    }

    roomRef.child("roles").on("value", function(snapshot) {
        playerRoles = snapshot.val();
    }, function(error) {
        console.log("Error gettting the roles of the players: " + error.code);
    });


}
