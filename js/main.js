
const burgerBtn = document.getElementById("burger-menu");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a"); // nav ichidagi linklar

// Burger tugmasi bosilganda nav ochiladi/yopiladi
burgerBtn.onclick = function () {
    burgerBtn.classList.toggle("active");
    nav.classList.toggle("active");
};

// Har bir link bosilganda nav yopiladi
navLinks.forEach(link => {
    link.addEventListener("click", () => {
        burgerBtn.classList.remove("active");
        nav.classList.remove("active");
    });
});
