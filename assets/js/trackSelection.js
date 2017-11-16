
function selectTrack(element) {
    // document.querySelector("#selectedTrack").innerHTML = element.innerHTML;
    document.querySelector("#selectedTrack").value = element.innerHTML;
    // console.log(element.innerHTML);
}

function setFormAction(input) {
    var keywords = input.value;
    var action = "/youtube/search/" + keywords;
    document.querySelector("#ytBrowser").setAttribute("action", action);
}

function searchThroughYouTube() {
    // var keywords = document.querySelector("#ytInput").value;
    // var action = "/youtube/search/" + keywords;
    
    // document.querySelector("#ytBrowser").setAttribute(action, action);
    
    // alert(document.querySelector("#ytBrowser").attributes.action.value);
    // console.log();
    //action="/youtube/search/{keywords}"
    // console.log(document.querySelector("#ytBrowser"));
    // TODO return the good path
    // document.querySelector("#ytBrowser")
    // return ;
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