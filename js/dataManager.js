//Expects firebase to be working
//TODO: Need to chekck if room was already created and create basic settings if it is empty
//      Create basic role settings if no buttons are set
function dataManager (playerName, roomName){
//Private Variables
    
    //Arguments
    var playerID = playerName;
    var roomID = roomName;

    //Room references
    var roomRef = firebase.database().ref(roomID);
    var playerRef = roomRef.child("players").push();
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
        roomRef.child("roles/" + activePlayers[playerIndex].name).set(role);
        return true;
    }

    this.getMyRole = function () {
        if (playerRoles !== null)
            return playerRoles[playerID];
        else
            return null;
    }

    this.getPlayerRole = function (index) {
        return playerRoles[activePlayers[index].name];
    }

    this.waitForAll = function (refLocation, action, text){
        var playerReadyRef = roomRef.child(refLocation + "/" + playerID);
        if (text === undefined)
            playerReadyRef.set("Waiting...");
        else
            playerReadyRef.set(text);
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
                //if (hostStatus)
                //    roomRef.child(refLocation).remove();
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
    }

    //this.getAliveWolfCount = function () {
    //    return aliveWolves;
    //}

    //this.endPregameSettings = function (){
    //    roomRef.child("roleSettings").off();
    //    aliveWolves = roleNum.wolf;
    //}

    this.readDatabase = function (refLocation) {
        var dataValue = null;
        roomRef.child(refLocation).once("value", function(snapshot){
            dataValue = snapshot.val();
        }, function (error) {
            console.log("Error reading database: " + error.code);
        });
        return dataValue;
    }

    this.leaveGame = function () {
        //change to dialog that shows
        addToLog("You have left the game");
        playerRef.onDisconnect().cancel();
        playerRef.remove();
        roomRef.child("roles/" + playerID).remove();
        return true;
    }

//Start-up functionality...
    //Listeners and connections to firebase
    roomRef.child("players").on("value", function(snapshot) {
        activePlayers = new Array();
            for (var i in snapshot.val()){
                activePlayers.push(new player (snapshot.val()[i], i));
                //activePlayers.push({name:snapshot.val()[i], key: i});
            }

            if (playerID === activePlayers[0].name)
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

    playerRef.set(playerID);
    playerRef.onDisconnect().remove();

    //Getters and Setters

    //Waiting function

}

