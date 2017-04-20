// Initialize Firebase
var config = {
    apiKey: "AIzaSyBKNDatJSQinLUEpakV7R3fAn1P1NIUONQ",
    authDomain: "vwolf-4b90d.firebaseapp.com",
    databaseURL: "https://vwolf-4b90d.firebaseio.com"
};
firebase.initializeApp(config);

//Shuffles an array
//Input is an array of any length
//Returns an array of the same length with a random order
function shuffle (array){
    var currentIndex = array.length;
    var randomIndex;
    var tempVal;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        tempVal = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempVal;
    }

    return array;
}

//Updates the lists of playernames 
//Input is an array containing all activePlayer names
//The radioBox and activeBox elements will be changed 
function updateNames(activePlayers) {
    activeBox = document.getElementById("activeList")
    radioBox = document.getElementById("radioBox");

    activeBox.innerHTML = null;
    radioBox.innerHTML = null;
    for (var i in activePlayers) {
        document.getElementById("activeList").innerHTML += "<div class='playername'>" + activePlayers[i].name + "</div>";
        radioBox.innerHTML += "<div class=playername><input type=radio class='voteRadio' name='target' id=" + i + "radio value=" + i +" ><label class=radiolabel for=" + i + "radio >" + activePlayers[i].name + "</label></div>";
    }
    radioBox.innerHTML += "<input type=radio name='target' value='$null' id='noRadio'>";
}

//Returns the currently selected radio button
function getRadioPlayerIndex(){
    var radioButtons = document.getElementsByClassName("voteRadio");
    var selected = "$null";
    for (var i = 0; i < radioButtons.length; i++){
        if (radioButtons[i].checked){
            selected = radioButtons[i].value;
            break;
        }
    }
    return selected;
}

//Resets the radio buttons to '$null'
function resetRadioButtons(){
    document.getElementById("noRadio").checked = true;
    return true;
}

//Adds text to the gamelog and scrolls the log to the bottom
//Input is a strong to add to the log
//The gameLog element is modified
function addToLog(item){
    var log = document.getElementById("gameLog");
    log.innerHTML += "<div class='logitem'>" + item + "</div>";
    log.scrollTop = log.scrollHeight - log.clientHeight;
}

//Opens and closes the game menu
//If the menu is open it will be closed
//If the menu is closed it will be opened
function toggleSettingsMenu(){
    var dropdown = document.getElementById("currentSettingsDropdown");
    if (dropdown.style.display === "none"){
        dropdown.style.display = "block";
        document.getElementById("currentSettingsButton").style.backgroundColor= "white";
        document.getElementById("currentSettingsButton").style.color= "black";
        window.onclick = function(event){ 
            if ( event.target.parentElement === null || (event.target.id !== "currentSettingsButton" && event.target.parentElement.id !== "currentSettingsDropdown")){
                dropdown.style.display = "none";
                document.getElementById("currentSettingsButton").style.backgroundColor = null;
                document.getElementById("currentSettingsButton").style.color= null;
                window.onclick = null;
            }
        };
    }
    else {
        window.onclick = null;
        dropdown.style.display = "none";
        document.getElementById("currentSettingsButton").style.backgroundColor = null;
        document.getElementById("currentSettingsButton").style.color= null;
    }
}

//Leaves the game
//All player and room references will be deleted. The page will be reloaded to reset the page.
function leaveGameRoom (){
    dataStore.leavePlayer();
    dataStore.leaveRoom();
    location.reload();
    return true;
}
