const burger = document.querySelector("#desktop-burger"); // faqat mobil uchun
const navList = document.querySelector(".nav__list");
const navLinks = document.querySelectorAll(".nav__list a");

burger.addEventListener("click", () => {
    burger.classList.toggle("active");

    if (burger.classList.contains("active")) {
        setTimeout(() => {
            navList.classList.add("show");
        }, 400); // faqat animatsiya tugagach ochiladi
    } else {
        navList.classList.remove("show");
    }
});

// link bosilganda menyuni yopish
navLinks.forEach(link => {
    link.addEventListener("click", () => {
        navList.classList.remove("show");
        burger.classList.remove("active");
    });
});
