// const burgerBtn = document.getElementById("burger-menu");
// burgerBtn.onclick = function () {
//     burgerBtn.classList.toggle("active")
// }

// const menu = document.querySelector(".nav");
// const burgerBtn = document.querySelector(".burger-menu")
// burgerBtn.addEventListener('click', function () {
//     menu.classList.toggle("active__nav")
// })


const burgerBtn = document.getElementById("burger-menu");
const nav = document.querySelector(".nav");

burgerBtn.onclick = function () {
    burgerBtn.classList.toggle("active");
    nav.classList.toggle("active");
};
