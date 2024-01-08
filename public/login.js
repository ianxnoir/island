const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

const loginForm = document.querySelector('#login-form')

let loggedIn = false;
let rememberMe = false;

const params = new URLSearchParams(location.search)

function initPage() {
  if (localStorage.getItem("username") != "null" 
    && localStorage.getItem("username") != null 
    && localStorage.getItem("password") != "null"
    && localStorage.getItem("password") != null) {
    rememberMe = true;
    login(localStorage.getItem("username"), localStorage.getItem("password"))
  }
  if(params.get('error')=='no_such_user'){
    alert('Register before using Google Login.')
  }   
}

document.onload = initPage()

signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

function togglePassword() {
  var x = document.getElementById("showPassword");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}


async function login(username, password) {
  const res = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify({
      username:loginForm.querySelector("input[name=loginID]").value,
      email:loginForm.querySelector("input[name=loginID]").value,
      password:loginForm.querySelector("input[name=loginPassword]").value
    })
  })
  const json = await res.json();
  if (json.result) {
    loggedIn = true;
    if (document.getElementById('remember-me').checked) {
      rememberMe = true;
    }
    if (rememberMe) {
      localStorage.setItem("username", loginForm.querySelector("input[name=loginID]").value);
      localStorage.setItem("password", json.token);
    } else {
      localStorage.removeItem("username")
      localStorage.removeItem("password");
    }
    if (params.get('redirect') == null) {
      window.location.href="/homepage.html"
    } else {
      window.location.href=params.get('redirect')
    }
  } else {
    alert('Incorrect Password!')
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  login(loginForm.querySelector("input[name=loginID]").value,
    loginForm.querySelector("input[name=loginPassword]").value)
})




// $(function () {
//   $("form").validate();
// });




// var frm = $('#forget');


//$("#forget").submit(function(){
  // var dataString = $(this).serialize();
  // $.ajax({

  // url: "forgetpw.html",
  // data: dataString,

 // $("#forget").html("<body style='background-image:url('background.jpg'); background-repeat: no-repeat; background-attachment: fixed; background-size: cover;'<div class='container' id='container'><div id='message'><h1>Email submitted!</h1></div></div>");
  // $("#message")
   
  //   .append("<p>We will be in touch soon.</p>")
  //   .hide()
  //   .fadeIn(1500, function () {
  //     $("#message").append(
  //       "<img id='checkmark' src='images/check.png' />"
  //     );
  //   });

//});


// async function readCurrentUser(){
//   const res =await fetch('/currentUser')
//   const json = await res.json()
//   if(json.result){
//     loggedIn =true

//   }
// }
// async function readCurrentGoogleUser(){
//   const res =await fetch('/currentGoogleUser')
//   const json = await res.json()
//   if(json.result){
//     loggedIn =true

//   }
// }
// readCurrentGoogleUser()
// readCurrentUser()


// window.onload = function(){
//   const searchParams = new URLSearchParams(window.location.search);
//   const errMessage = searchParams.get('error');

//   if(errMessage){
//       const alertBox = document.createElement('div');
//       alertBox.classList.add('alert','alert-danger');
//       alertBox.textContent = errMessage;
//       document.querySelector('#error-message').appendChild(alertBox);
//   }else{
//       document.querySelector('#error-message').innerHTML = "";
//   }
// }

// $forgot_password_link.on('click', function(event){
//   event.preventDefault();
//   forgot_password_selected();
// });

// $back_to_login_link.on('click', function(event){
//   event.preventDefault();
//   login_selected();
// });

// function login_selected(){
//   $form_login.addClass('is-selected');
//   $form_signup.removeClass('is-selected');
//   $form_forgot_password.removeClass('is-selected');
//   $tab_login.addClass('selected');
//   $tab_signup.removeClass('selected');
// }

// function forgot_password_selected(){
//   $form_login.removeClass('is-selected');
//   $form_signup.removeClass('is-selected');
//   $form_forgot_password.addClass('is-selected');
// }

