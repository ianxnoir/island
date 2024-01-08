//  global-StepFunctions.js
//  contains logout and dark mode functionality


//  Logout

document.getElementById('logout-button').addEventListener('click', clearLoginInfo)

function clearLoginInfo() {
    localStorage.clear()
    window.location.href = '/logout'
}



// Dark-Mode
const toggleButton = document.querySelector(".dark-light");

toggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (localStorage.getItem('darkmode') == "1") {
        localStorage.setItem('darkmode', "0")
    } else {
        localStorage.setItem('darkmode', "1")
    } 
});
//  Runs on load
if (localStorage.getItem('darkmode') == "1") {
    document.body.classList.toggle("dark-mode")
}