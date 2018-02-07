
/**
 * Toggle a specified element's (modal) display
 * @function
 * @param {*} element
 * @param {*} action
 */
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

/**
 * Apply a regex to check the validity of the mail
 * @function
 */
function validateMail() {
    
    var mail = document.querySelector("#mail").value;
    var regex = /^(([^<>()[\]\\.,;:\s@\“]+(\.[^<>()[\]\\.,;:\s@\“]+)*)|(\“.+\“))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regex.test(mail);
}