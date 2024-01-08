//$(document).ready(function() {
//$('.search-box').focus();
//});

//Get user Info from server

async function readUser(){
  // console.log("fetch")
  const res = await fetch('/userInfo')
  const userInfo = await res.json();
  app.userInfo = userInfo;

  const nickName01 = document.querySelector('.nickName01') // nickName showed on Top(right side)
  nickName01.innerHTML = `${userInfo.nickname}`
}
readUser()

const wrapper = document.querySelector(".wrapper");
const header = document.querySelector(".header");

wrapper.addEventListener("scroll", (e) => {
 e.target.scrollTop > 30
  ? header.classList.add("header-shadow")
  : header.classList.remove("header-shadow");
});





