
function selectTrack(element) {
    document.querySelector("#selectedTrack").value = element.innerHTML;
    // dirty way, we should use values, not innerHTML text...
    // console.log(element.innerHTML);
}

function searchThroughYouTubeBis(e) {
    if (e.keyCode == 13) {
        searchThroughYouTube();
        return false;
    }
}

function searchThroughYouTube() {

    // Flush the previous result for animation
    var ytResult = document.querySelector("#ytResult");
    ytResult.innerHTML = "";

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
                console.log(jsonResponse[i]);

                // ********** WRAPPER ********** //
                var trackWrapper = document.createElement("button");
                trackWrapper.classList.add("track");
                trackWrapper.classList.add("button");
                trackWrapper.classList.add("button-track");
                trackWrapper.classList.add("flex-col");
                // trackWrapper.classList.add("blurred");
                trackWrapper.style.backgroundImage = "url(" + jsonResponse[i].thumbnailUrl + ")";

                // TODO href
                
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
                    toggleElement('difficulty','open');
                    // console.log(titleSpan.innerHTML);
                    selectTrack(titleSpan);
                };

                // ********** ADD WRAPPER TO PAGE ********** //
                ytResult.appendChild(trackWrapper);
            }
        }
    };

    xhttp.open("GET", action, true);
    xhttp.send();
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