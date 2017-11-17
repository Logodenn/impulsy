
function selectTrack(element) {
    // document.querySelector("#selectedTrack").innerHTML = element.innerHTML;
    document.querySelector("#selectedTrack").value = element.innerHTML;
    // console.log(element.innerHTML);
}

function searchThroughYouTube() {

    var keywords = document.querySelector("#ytInput").value;
    var action = "/youtube/search/" + keywords;

    // ********** AJAX ********** //

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(this.responseText);

            for(var i = 0; i < jsonResponse.length; i++) {
                console.log(jsonResponse[i]);

                // ********** WRAPPER ********** //
                var trackWrapper = document.createElement("button");
                trackWrapper.classList.add("track");
                trackWrapper.classList.add("button");
                trackWrapper.classList.add("button-track");
                trackWrapper.classList.add("flex-col");
                trackWrapper.classList.add("blurred");
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

                // ********** ADD WRAPPER TO PAGE ********** //
                document.querySelector("#ytResult").appendChild(trackWrapper);
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