//Expects firebase to be working

function dataManager (playerName, roomName){
    //Public Functions
    
    //Returns the number of players playing the game
    this.getNumPlayers = function () {
        return activePlayers.length;
    }

    //Returns the name of a player associated with an index
    //Input is the index of a player in the activePlayers list used to display names
    this.getPlayerName = function (index){
        if (activePlayers[index] === undefined)
            return null
        else
            return activePlayers[index].name;
    }

    //Returns the unique key of a player associated with an index
    //Input is the index of a player in the activePlayers list used to display names
    this.getPlayerKey = function (index){
        if (activePlayers[index] === undefined)
            return null
        else
            return activePlayers[index].key;
    }

    //Returns player name
    this.getMyName = function () {
        return playerID;
    }

    //Returns player key
    this.getMyKey = function () {
        return playerRef.key;
    }

    //Returns true if one is the first name in the database, else returns false
    this.checkIfHost = function () {
        return hostStatus;
    }

    //Change the shared game status to the inputted string
    this.changeGameStatus = function (string) {
        roomRef.child("gameStatus").set(string);
        return string;
    }

    //Returns the number of players with an inputted role (all players, active or inactive)
    this.getRoleCount = function (role) {
        if (roleNum[role] === undefined)
            return false;
        else
            return roleNum[role];
    }

    //Increase/decrease the number of players to be assigned to a role
    //Inputs are a string containing the role name and a value to increment the count by
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

    //Records a player-role combination in the database
    //Should not be run by more than one player (host only)
    this.addPlayerWithRole = function (playerIndex, role) {
        roomRef.child("roles/" + activePlayers[playerIndex].key).set(role);
        return true;
    }

    //Returns player role
    this.getMyRole = function () {
        if (playerRoles !== null)
            return playerRoles[playerRef.key];
        else
            return null;
    }

    //Returns the role of a player
    //Input is the index of the player in the activePlayers array used to display player nemes
    this.getPlayerRole = function (index) {
        if (activePlayers[index] === undefined)
            return null;
        else
            return playerRoles[activePlayers[index].key];
    }

    //Performs an action when all players are ready
    //Inputs are:
    //  - a string containing the location to store the waiting references, links related 'waits' together
    //  - a function to perform once all players are ready. The function will be passed a snapshot of the database at refLocation
    //  - a string containing text to store in the reference (optional)
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

    //Stop waiting at the inputted reference 
    //Input is the wait reference that was passed to waitForAll
    this.removeWait = function (readyRef) {
        readyRef.parent.off();
        readyRef.onDisconnect().cancel();
        readyRef.remove();
        return true;
    }

    //Adjusts settings to remove pregame settings
    //Unnecessary listeneres are removed
    //onDisconnect is canceled to allow for easy reconnection (ex. screen turn off)
    this.beginStartedGameSettings = function (){
        roomRef.child("roleSettings").off();
        playerRef.onDisconnect().cancel();

        return true;
    }

    //Returns the data at a specified location
    //Input is a string that specifies a reference location that is a child of the room reference
    this.readDatabase = function (refLocation) {
        var dataValue = null;
        roomRef.child(refLocation).once("value", function(snapshot){
            dataValue = snapshot.val();
        }, function (error) {
            console.log("Error reading database: " + error.code);
        });
        return dataValue;
    }

    //Turn off listeners
    //The player will be disconnected from the room
    this.leaveRoom = function () {
        roomRef.child("players").off();
        roomRef.child("roleSettings").off();
        roomRef.child("roles").off();
        return true;
    }

    //Remove player references from the room
    //Other players will see that the player has left
    this.leavePlayer = function () {
        addToLog("You have left the game");
        playerRef.onDisconnect().cancel();
        playerRef.remove();
        return true;
    }

    //Private Variables
    
    //Arguments
    var playerID = playerName;
    var roomID = roomName;

    //Room references
    var roomRef = firebase.database().ref(roomID);
    var playerRef = null; //Is set later
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

    //Start-up functionality...
    
    //Check to see if the game has already started in that room, if it has then do not join
    var firstLogin = true;
    roomRef.child("players").once("value", function(snapshot) {
        if (firstLogin) {
            var gameStarted = false;

            //If there are no players or the game started over 24 hours ago, reset the room
            if (snapshot.val() === null || snapshot.val().playerNames === undefined || Date.now() - snapshot.val().lastDate > 86400000){
                roomRef.remove();
                roomRef.child("players/lastDate").set(Date.now());
            }
            else { //If  not resetting the room, check if the game has started. If so, block entry
                roomRef.child("gameStatus").once("value", function(statussnapshot) {
                    if (statussnapshot.val() === "started"){
                        document.getElementById("pregamescreen").style.display = "none";
                        document.getElementById("alreadyStarted").style.display = "block";
                        //If the playerRef code ran before this code, remove the playerReference
                        if (playerRef !== null)
                            playerRef.remove();
                        //Block the creation of the playerRef
                        gameStarted = true;
                    } 
                    else {
                        roomRef.child("players/lastDate").set(Date.now());
                    }
                }, function(error){
                    console.log("Error getting the status of the room: " + error.code);
                });
            }

            //Create the playerRef
            if (!gameStarted){
                playerRef = roomRef.child("players/playerNames").push();
                playerRef.set(playerID);

                //onDisconnect for players that disconnect in waiting screen
                playerRef.onDisconnect().remove(function(error){
                    if (error !== null){
                        console.log(error);
                        document.getElementById("pregamescreen").style.display = "none";
                        window.alert("An error occured and you could not be added to the game. Please refresh the page and try again");
                        playerRef.remove();
                    }
                });

                createListeners();
            }

            firstLogin = false;
        }
    });

    //Listeners and connections to firebase
    function createListeners() {
        roomRef.child("players/playerNames").on("value", function(snapshot) {

            //Build an array or all players
            activePlayers = new Array();
            for (var i in snapshot.val()){
                activePlayers.push(new player (snapshot.val()[i], i));
            }

            //If player if the first name, player is the host
            if (activePlayers[0] !== undefined && playerRef.key === activePlayers[0].key)
                hostStatus = true;

            updateNames(activePlayers);

            roleNum.villager = activePlayers.length - roleNum.wolf - roleNum.seer;

            checkForValidRoleCounts();
        }, function(error) {
            console.log("Error gettting the names of the players: " + error.code);
        });

        roomRef.child("roleSettings").on("value", function(snapshot) {
            for (var role in snapshot.val()){
                var checkRole = snapshot.val()[role]; 

                //Enable/disable +/- buttons appropriately
                if (checkRole <= 0)
                    document.getElementById(role + "minus").setAttribute("disabled", true);
                else
                    document.getElementById(role + "minus").removeAttribute("disabled");

                //Update rolecounts
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

        //Check if the settings proposed by the users are valid
        function checkForValidRoleCounts() {
            var readyButton = document.getElementById("readyButton");

            //If settings are invalid, disable the ready button
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

}
