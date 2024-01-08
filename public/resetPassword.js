




const resetPW = document.querySelector('#reset')

 
resetPW.addEventListener('submit', async function (e) {
    e.preventDefault();
    var newP = document.getElementById("newPasswordR").value;
        var confirmP = document.getElementById("confirmPasswordR").value;
        if (newP != "" && confirmP != "") {
            
            if (newP == confirmP) {
                alert('Password reset!')
                
            }else if(newP != confirmP){
                alert("Confirm password is not same as you new password.");
                 
            }else {
                alert("Please fill the fields!");
            }
        }


    const res = await fetch('/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify({

            password: resetPW.querySelector("input[name=newPasswordR]").value,
            confirmPassword: resetPW.querySelector("input[name=confirmPasswordR]").value
        })
    })
    console.log("hi")
    const json = await res.json();
    if (json.result) {
        location.href = 'login.html';

    }


})
