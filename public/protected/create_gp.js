
const formCard = document.querySelector('.form-card')


//Get user Info from server

async function readUser(){
    console.log("fetch")
    const res = await fetch('/userInfo')
    const userInfo = await res.json();
    console.log(userInfo)
  
    const nickName01 = document.querySelector('.nickName01') // nickName showed on Top(right side)
    nickName01.innerHTML = `${userInfo.nickname}`
  }
  readUser()


// Minimal Javascript (for Edge, IE and select box)
document.addEventListener("change", function(event) {
    let element = event.target;
    if (element && element.matches(".form-element-field")) {
      element.classList[element.value ? "add" : "remove"]("-hasvalue");
    }
  });

document.getElementById('field-ossnb5-6ffbtn-cdr7ya-z3ko11-59yu02').addEventListener('input', (evt) => {
    if (evt.target.value.length == 30) {
        const prompt = document.getElementById('name-length-prompt')
        prompt.style.opacity = "1";
    }
});

//Upload group proile image & Preview
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#imagePreview').css('background-image', 'url('+e.target.result +')');
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#imageUpload").change(function() {
    readURL(this);
});

formCard.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    let reqBody = new FormData(formCard);
    for (let entry of reqBody) {
        console.log(entry)
    }
    let res = await fetch('/chatroom', {
        method: "POST",
        body: reqBody
    })
    let resJSON = await res.json();
    alert(resJSON.message);
    if (resJSON.success) {
        window.location.href="island.html"
    }
})

