
function selectTrack(element) {
    document.querySelector("#selectedTrack").value = element.innerHTML;
    document.querySelector("#selectedTrackDisplay").innerHTML   = element.innerHTML;
    // Force the onchange event so that the server is aware of the new value
    document.querySelector("#selectedTrack").onchange();
}

function checkSelectedTrack() {
    console.log("input a été changed");
}

function setDifficulty(difficulty) {
    // Reset state
    document.querySelector("#lazy").attributes.state.value = "passive";
    document.querySelector("#easy").attributes.state.value = "passive";
    document.querySelector("#crazy").attributes.state.value = "passive";
    console.log(difficulty);
    // Active state
    document.querySelector("#"+difficulty).attributes.state.value = "active";
}