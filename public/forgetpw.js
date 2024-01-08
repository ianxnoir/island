// async function forgetPw(){
//     const res= await fetch('forgetpw.html')
//     const forgetPW1 = document.querySelector('#forget')
//     forgetPW1.innerHTML ='';



// }

const checkEmail = document.querySelector('#forget')
checkEmail.addEventListener('submit', async function (e) {
    e.preventDefault();
    var findEmailCheck = document.getElementById("fEmail").value;
    if (findEmailCheck != "") {
        alert('Sent email!')
        const forgetPW1 = document.querySelector('#forget')
        forgetPW1.innerHTML = `<h3>Email submitted!</h3><br><p>We will be in touch soon.</p>`
    } else {
        alert("This field is required!");
    }

    const res = await fetch('/forget', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify({
            email: checkEmail.querySelector("input[name=findEmail]").value
        })
    })
    
    console.log('hi')

    const json = await res.json();

    if (json.result) {
        
        
    }


})