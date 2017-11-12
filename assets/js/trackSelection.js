
function selectTrack(element) {
    // document.querySelector("#selectedTrack").innerHTML = element.innerHTML;
    document.querySelector("#selectedTrack").value = element.innerHTML;
    // console.log(element.innerHTML);
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