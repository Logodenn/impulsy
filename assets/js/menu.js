
function slideMenu(action) {

    var menu = document.querySelector("#menu");

    if(action == "open" && menu.attributes.state.value != "open") {
        // Open menu
        menu.attributes.state.value = "open";
    } else if (action == "close" && menu.attributes.state.value != "closed") {
        // Close menu
        menu.attributes.state.value = "closed";
    }
}