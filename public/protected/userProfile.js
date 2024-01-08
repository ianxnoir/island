// const { json } = require("express");
async function initPage() {

  readUser()
}


// const iconUpload= document.querySelector("#imageUpload")

// iconUpload.addEventListener('click', async function (e) {
//   e.preventDefault();

//   const res = await fetch('/userIcon', {
//       method: 'PUT'

//   })
//   console.log('hi')

//   const json = await res.json();

//   if (json.result) {
//       alert('User Info updated!')

//   }


// })
const editProfile = document.querySelector('#editPro')
editProfile.addEventListener('click', async function (e) {
  e.preventDefault();
  const res = await fetch('/userInfo02', {
    method: 'POST'
  })
  const userInfo = await res.json();
  console.log(userInfo)

  const showNames= document.querySelectorAll('.nickName')
  for (let showName of showNames){
    showName.innerHTML = `${userInfo.nickname}`
    console.log(showName.innerHTML)

  }

  const editB = document.querySelector('#editButton')
  editB.innerHTML = `<div style="margin-bottom:10px"><button form="edit-userForm" class="btn btn-info" for="submit-form" tabindex="0">Save</button>
  <a class="btn btn-info" style="margin-right:50px" id="cancel">Cancel</a> `


  const nickName03 = document.querySelector('.nickName03')
  nickName03.innerHTML = `<input type="text" name="nickname"
  class="form-control form-control-alternative"
  placeholder="Nickname">`

  const username01 = document.querySelector('.username01')
  username01.innerHTML = `<input type="text" name="username"
  class="form-control form-control-alternative"
  placeholder="Username" value="">`

  const email01 = document.querySelector('.email01') // 
  email01.innerHTML = `<input type="email" name="email"
  class="form-control form-control-alternative email01"
  placeholder="Example@example.com">`

  const bio01 = document.querySelector('.bio01') // 
  bio01.innerHTML = `<textarea name="bio" rows="4" class="form-control form-control-alternative"
  placeholder="A few words about you ..."></textarea>`

  const saveButtons = document.querySelector('#edit-userForm')
  saveButtons.addEventListener('submit', async function (e) {
    e.preventDefault();
    const res = await fetch('/userProfile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        email: saveButtons.querySelector("input[name=email]").value,
        username: saveButtons.querySelector("input[name=username]").value,
        nickname: saveButtons.querySelector("input[name=nickname]").value,
        bio: saveButtons.querySelector("textarea[name=bio]").value

      })
    })
    console.log('hi')

    const json = await res.json();

    if (json.result) {
      alert('User Info updated!')
      readUser()

    }
    


  })

  const cancelButton = document.querySelector("#cancel")
  cancelButton.addEventListener("click", async () => {

    const cancelB = document.querySelector('#buttons')

    cancelB.innerHTML = `<div id="buttons">
    <div id="editButton"></div><div class="cancel"></div>
    <a class="btn btn-info" id="editPro">Edit Profile</a>
    </div>`
    readUser()


  })


})









// const editUser = document.querySelector('#edit-userForm')
// editUser.addEventListener('submit', async function (e) {
//   e.preventDefault();

//   const res = await fetch('/userProfile', {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       'accept': 'application/json'
//     },
//     body: JSON.stringify({
//       email: editUser.querySelector("input[name=email]").value,
//       username: editUser.querySelector("input[name=username]").value,
//       nickname: editUser.querySelector("input[name=nickname]").value,
//       bio: editUser.querySelector("textarea[name=bio]").value
//     })
//   })


//   console.log('hi')

//   const json = await res.json();

//   if (json.result) {
//     alert('User Info updated!')

//   }


// })





async function readUser() {
  const res = await fetch('/userInfo02', {
    method: 'POST'
  })
  
  const userInfo = await res.json();
  console.log(userInfo)
  const showNames= document.querySelectorAll('.nickName')
  for (let showName of showNames){
    showName.innerHTML = `${userInfo.nickname}`
    console.log(showName.innerHTML)

  }
  const showName01= document.querySelector('.nickName03')
  showName01.innerHTML = `${userInfo.nickname}`

  const username01 = document.querySelector('.username01')
  username01.innerHTML = `${userInfo.username}`

  const email01 = document.querySelector('.email01') // 
  email01.innerHTML = `${userInfo.email}`

  const bio01 = document.querySelector('.bio01') // 
  bio01.innerHTML = `${userInfo.bio}`

  const userPreIcon = document.querySelector('#imagePreview')
  userPreIcon.outerHTML = ` <div id="imagePreview" style="background-image: url(uploadedIcon/${userInfo.islander_icon})"> `

}


readUser()

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');


    }
    reader.readAsDataURL(input.files[0]);
  }
}

$("#imageUpload").change(async function (e) {
  readURL(this);
  var formData = new FormData(document.getElementById('iconForm'))
  formData.append('image-upload', imageUpload.files)
  const res = await fetch('/userIcon', {
    method: 'PUT',
    body: formData
  })
  console.log('hi')

  const json = await res.json();

  if (json.result) {
    alert('User Info updated!')

  }


});
