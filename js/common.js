// Initialize Firebase
var config = {
    apiKey: "AIzaSyBKNDatJSQinLUEpakV7R3fAn1P1NIUONQ",
    authDomain: "vwolf-4b90d.firebaseapp.com",
    databaseURL: "https://vwolf-4b90d.firebaseio.com"
};
firebase.initializeApp(config);

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

function resetRadioButtons(){
    document.getElementById("noRadio").checked = true;
    return true;
}

function addToLog(item){
    var log = document.getElementById("gameLog");
    log.innerHTML += "<div class='logitem'>" + item + "</div>";
    log.scrollTop = log.scrollHeight - log.clientHeight;
    return log.innerHTML;
}

function toggleSettingsMenu(){
    var dropdown = document.getElementById("currentSettingsDropdown");
    if (dropdown.style.display === "none"){
        dropdown.style.display = "block";
        document.getElementById("currentSettingsButton").style.backgroundColor= "white";
        document.getElementById("currentSettingsButton").style.color= "black";
        window.onclick = function(event){ 
            //TODO Better wat to detect null
            if ( event.target.parentElement === null || (event.target.id !== "currentSettingsButton" && event.target.parentElement.id !== "currentSettingsDropdown")){
                dropdown.style.display = "none";
                document.getElementById("currentSettingsButton").style.backgroundColor = null;
                document.getElementById("currentSettingsButton").style.color= null;
                window.onclick = null;
            }
        };
    }
    else{
        window.onclick = null;
        dropdown.style.display = "none";
        document.getElementById("currentSettingsButton").style.backgroundColor = null;
        document.getElementById("currentSettingsButton").style.color= null;
    }
}

