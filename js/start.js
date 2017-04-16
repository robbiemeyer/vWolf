var dataStore;

function enterRoom (){
    //Get IDs
    var roomID = document.getElementById("roomBox").value;
    var playerID = document.getElementById("userBox").value;

    if (/^\w{1,12}$/.test(playerID) && /^\w{1,12}$/.test(roomID)){

        firebase.auth().signInAnonymously().catch(function(error) {
            console.log("Could not sign in to database: " +  error.code);
        });

        firebase.auth().onAuthStateChanged(function(user) {
            if (user)
                dataStore = new dataManager(playerID, roomID);
        });

        //document.getElementById("currentRoom").innerHTML = "Playing as " + playerID + " in " + roomID;
        document.getElementById("currentRoom").innerHTML = "Room: "+ roomID;
        document.getElementById("currentUser").innerHTML = "Name: "+ playerID;
        document.getElementById("loginscreen").style.display = "none";
        document.getElementById("gamescreen").style.display = "block";
    }
    else {
        document.getElementById("invalidID").style.display = "block";
    }
}

function getReady(button){
    if (button.innerHTML == "Ready?"){
        button.innerHTML = "Waiting";

        button.className = 'actionButton holdActive';

        this.readyRef = dataStore.waitForAll("readyPlayers", playGame);

    } else if (button.innerHTML == "Waiting"){
        button.innerHTML = "Ready?";
        button.classList = "actionButton";

        dataStore.removeWait(this.readyRef);
    }
}


function changeRoleCountByButton (role, increment){
    if (dataStore.getRoleCount(role) === 0 )
        document.getElementById(role + "minus").removeAttribute("disabled");

    dataStore.incrementRoleCount(role, increment);
    document.getElementById(role + "NumDisplay").innerHTML = dataStore.getRoleCount(role);

    if (dataStore.getRoleCount(role) === 0 )
        document.getElementById(role + "minus").setAttribute("disabled", true);
}

function assignRoles(){

    var assignRoleArray = [];

    for (i = 0; i < dataStore.getRoleCount("wolf"); i++)
        assignRoleArray.push("werewolf");
    for (i = 0; i < dataStore.getRoleCount("villager"); i++)
        assignRoleArray.push("villager");

    assignRoleArray = shuffle(assignRoleArray);
    console.log(assignRoleArray);

    for (var i in assignRoleArray){
    //    roomRef.child("roles/" + activePlayers[i].name).set(assignRoleArray[i]);
        dataStore.addPlayerWithRole(i, assignRoleArray[i]);
        //console.log(activePlayers[i].name + ": " + assignRoleArray[i]);
    }
}

function playGame(){
    console.log("GAME HAS STARTED");

    //console.log("I am the host " + me.amHost);
    if (dataStore.checkIfHost()){
        assignRoles();
        dataStore.changeGameStatus("started");
    }

    dataStore.beginStartedGameSettings();
    document.getElementById("gameLog").innerHTML = "";

    ////Get Roles
    
    var myRole = null;
    var numChecked = 0;

    function waitToCheckForRole () {
        myRole = dataStore.getMyRole();
        if ( numChecked < 8 && myRole === null ) {
            setTimeout (waitToCheckForRole, 500);
        }
        else if ( numChecked >= 8 )
            console.log("Error: Could not get Role");
        else {
            //console.log(myRole);
            document.getElementById("currentRole").innerHTML = "Role: " + myRole;
            showDayPhase();
            window.alert("You are a " + myRole);
        }
    }

    waitToCheckForRole();

    ////This is temporary
    //roomRef.child("roles/" + me.name).once("value", function(snapshot) {
    //    me.role = snapshot.val();
    //    if (snapshot.val() !== null){
    //        clearTimeout(timer);
    //        console.log(me.role);
    //    }
    //}, function(error) {
    //    console.log("Error gettting role: " + error.code);
    //});

}
