
function displayForm(form) {

    if(form == "login") {

        // Handle state
        document.querySelector("#displayLoginForm").attributes.state.value = "active";
        document.querySelector("#displaySignupForm").attributes.state.value = "passive";

        // Display login form
        if(document.querySelector("#loginForm").classList.contains("hidden")) {
            document.querySelector("#loginForm").classList.remove("hidden");
        }

        // Hide signup form
        if(!document.querySelector("#signupForm").classList.contains("hidden")) {
            document.querySelector("#signupForm").classList.add("hidden");
        }

    } else if (form == "signup") {

        // Handle state
        document.querySelector("#displayLoginForm").attributes.state.value = "passive";
        document.querySelector("#displaySignupForm").attributes.state.value = "active";

        // Display signup form
        if(document.querySelector("#signupForm").classList.contains("hidden")) {
            document.querySelector("#signupForm").classList.remove("hidden");
        }

        // Hide login form
        if(!document.querySelector("#loginForm").classList.contains("hidden")) {
            document.querySelector("#loginForm").classList.add("hidden");
        }

    } else {

    }
}

function validateMail() {
    
    var mail = document.querySelector("#mail").value;
    var regex = /^(([^<>()[\]\\.,;:\s@\“]+(\.[^<>()[\]\\.,;:\s@\“]+)*)|(\“.+\“))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regex.test(mail);
}