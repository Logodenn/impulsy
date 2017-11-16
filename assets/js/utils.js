
function toggleElement(element, action) {

    var id = "#" + element;
    var element = document.querySelector(id);

    if(action == "open" && element.attributes.state.value != "open") {
        // Open element
        element.attributes.state.value = "open";
    } else if (action == "close" && element.attributes.state.value != "closed") {
        // Close element
        element.attributes.state.value = "closed";
    }
}