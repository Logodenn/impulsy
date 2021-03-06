/**
 * Select a track from the index page to play
 * @function
 * @param {*} data 
 */
function selectTrack(element) {
    document.querySelector("#selectedTrack").value = element.getAttribute('data-id');

    if (element.childNodes.length >= 2) {
        document.querySelector("#selectedTrackDisplay").innerHTML = element.childNodes[0].innerHTML;
    } else {
        document.querySelector("#selectedTrackDisplay").innerHTML = element.innerHTML;
    }
}

/**
 * Search tracks through YouTube with the Enter key
 * @function
 * @param {*} e 
 */
function searchThroughYouTubeBis(e) {
    if (e.keyCode == 13) {
        searchThroughYouTube();
        return false;
    }
}

/**
 * Search tracks through YouTube
 * @function
 */
function searchThroughYouTube() {

    // Flush the previous result for animation
    var ytResult = document.querySelector("#ytResult");
    ytResult.innerHTML = "";
    
    // Animate the search
    var imgLoading = new Image();
    imgLoading.src = "../img/loading.svg";
    imgLoading.classList.add("loading");
    ytResult.appendChild(imgLoading);

    var keywords = document.querySelector("#ytInput").value;
    var action = "/youtube/search/" + keywords;

    // ********** AJAX ********** //

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(this.responseText);

            // Flush the previous result for new result
            ytResult.innerHTML = "";

            for(var i = 0; i < jsonResponse.length; i++) {
                // console.log(jsonResponse[i]);

                // ********** WRAPPER ********** //
                var trackWrapper = document.createElement("button");
                trackWrapper.classList.add("track");
                trackWrapper.classList.add("button");
                trackWrapper.classList.add("button-track");
                trackWrapper.classList.add("flex-col");
                // trackWrapper.classList.add("blurred");
                trackWrapper.style.backgroundImage = "url(" + jsonResponse[i].thumbnailUrl + ")";
                trackWrapper.setAttribute('data-id', jsonResponse[i].id);
                
                // ********** TITLE ********** //
                var titleSpan = document.createElement("span");
                titleSpan.classList.add("thumb");
                titleSpan.innerHTML = jsonResponse[i].title;
                trackWrapper.appendChild(titleSpan);
                
                // ********** DURATION ********** //
                var durationSpan = document.createElement("span");
                durationSpan.classList.add("thumb");
                durationSpan.innerHTML = jsonResponse[i].duration;
                trackWrapper.appendChild(durationSpan);

                // ********** ADD CLICK EVENT ********** //
                trackWrapper.onclick = function() {
                    // console.log(this)
                    // console.log(titleSpan.innerHTML);
                    selectTrack(this);
                    toggleElement('difficulty','open');
                };

                // ********** ADD WRAPPER TO PAGE ********** //
                ytResult.appendChild(trackWrapper);
            }
        }
    };

    xhttp.open("GET", action, true);
    xhttp.send();
}

/**
 * Set the game difficulty
 * @function
 * @param {*} difficulty 
 */
function setDifficulty(difficulty) {
    // Reset state
    document.querySelector("#lazy").attributes.state.value = "passive";
    document.querySelector("#easy").attributes.state.value = "passive";
    document.querySelector("#crazy").attributes.state.value = "passive";
    console.log(difficulty);
    // Active state
    document.querySelector("#"+difficulty).attributes.state.value = "active";
    // Set the value
    document.querySelector("#selectedDifficulty").value = difficulty;

    // Handle mode
    if(difficulty == "crazy") {
        if(document.querySelector("#mode").classList.contains("hidden")) {
            // Display mode
            document.querySelector("#mode").classList.remove("hidden");
        }
    } else {
        if(!document.querySelector("#mode").classList.contains("hidden")) {
            // Hide mode
            document.querySelector("#mode").classList.add("hidden");
        }
        // Reset mode to solo
        setMode("solo");
    }
}

/**
 * Set the game mode (solo or coop)
 * @function
 * @param {*} mode 
 */
function setMode(mode) {
    // Reset state
    document.querySelector("#solo").attributes.state.value = "passive";
    document.querySelector("#coop").attributes.state.value = "passive";
    console.log(mode);
    // Active state
    document.querySelector("#"+mode).attributes.state.value = "active";
    // Set the value
    document.querySelector("#selectedMode").value = mode;
}