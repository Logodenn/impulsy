
function selectTrack(element) {
    document.querySelector("#selectedTrack").value = element.getAttribute('data-trackId');
    document.querySelector("#selectedTrackDisplay").innerHTML = element.innerHTML;
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