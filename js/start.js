//Manages data. Connects with the firebase database
var dataStore;

//Run when the playerID and roomID are entered. Connects to the game room.
function enterRoom (){
    //Get IDs
    var roomID = document.getElementById("roomBox").value;
    var playerID = document.getElementById("userBox").value;

    //Verification double-check. Names an only contain numbers, letters
    //and underscores. Permitted length ranges from 1 to 12.
    if (/^\w{1,12}$/.test(playerID) && /^\w{1,12}$/.test(roomID)){

        //Sign in anonymously to be able to write to the database
        firebase.auth().signInAnonymously().catch(function(error) {
            console.log("Could not sign in to database: " +  error.code);
        });

        //If that was successful, create dataStore to access the database
        firebase.auth().onAuthStateChanged(function(user) {
            if (user)
                dataStore = new dataManager(playerID, roomID);
        });

        //Show correct elements
        document.getElementById("currentRoom").innerHTML = "Room: "+ roomID;
        document.getElementById("currentUser").innerHTML = "Name: "+ playerID;
        document.getElementById("loginscreen").style.display = "none";
        document.getElementById("gamescreen").style.display = "block";
    }
    else {
        document.getElementById("invalidID").style.display = "block";
    }
}

//Run when ready button is clicked. When all players are ready game will start.
function getReady(button){
    if (button.innerHTML == "Ready?"){
        //Change button text
        button.innerHTML = "Waiting";
        
        //Change button styling
        button.className = 'actionButton holdActive';

        //Wait for all players
        this.readyRef = dataStore.waitForAll("readyPlayers", playGame);

    } else if (button.innerHTML == "Waiting"){
        //Undo waiting actions
        button.innerHTML = "Ready?";
        button.classList = "actionButton";
        dataStore.removeWait(this.readyRef);
    }
}

//Run when a -/+ role button is clicked. Changes a role count.
function changeRoleCountByButton (role, increment){
    //If the count was zero, we must be moving up away from zero and can go down again
    if (dataStore.getRoleCount(role) === 0 )
        document.getElementById(role + "minus").removeAttribute("disabled");

    //Increment role
    dataStore.incrementRoleCount(role, increment);
    //Immediately display changes locally for responsiveness
    document.getElementById(role + "NumDisplay").innerHTML = dataStore.getRoleCount(role);

    //Prevent negative values 
    if (dataStore.getRoleCount(role) === 0 )
        document.getElementById(role + "minus").setAttribute("disabled", true);
}

//Run only by host during startup
function assignRoles(){

    //Create an array. Fill the array with the currect number of roles. Then
    //shuffle the array and assign each player a role based on each sequential 
    //element of the array.
    var assignRoleArray = [];

    for (var i = 0; i < dataStore.getRoleCount("wolf"); i++)
        assignRoleArray.push("werewolf");
    for (var i = 0; i < dataStore.getRoleCount("villager"); i++)
        assignRoleArray.push("villager");

    assignRoleArray = shuffle(assignRoleArray);

    //Push roles to database
    for (var i in assignRoleArray){
        dataStore.addPlayerWithRole(i, assignRoleArray[i]);
    }
}

//Run when all players are ready
function playGame(){

    //Only one player needs to assign noles
    if (dataStore.checkIfHost()){
        assignRoles();
        dataStore.changeGameStatus("started");
    }

    dataStore.beginStartedGameSettings();
    document.getElementById("gameLog").innerHTML = "";

    //Get Roles
    
    var myRole = null;
    var numChecked = 0;

    //To get role. Get role, if it is taking too long, wait and then try again.
    //The role must be set before the game is started.
    function waitToCheckForRole () {
        myRole = dataStore.getMyRole();
        if ( numChecked < 8 && myRole === null ) {
            setTimeout (waitToCheckForRole, 500);
        }
        else if ( numChecked >= 8 )
            console.log("Error: Could not get Role");
        else {
            document.getElementById("currentRole").innerHTML = "Role: " + myRole;
            showDayPhase();
            window.alert("You are a " + myRole);
        }
    }

    waitToCheckForRole();

}
