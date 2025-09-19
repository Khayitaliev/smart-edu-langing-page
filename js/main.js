
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


document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".mentor-card");
    const dotsContainer = document.querySelector(".mentors-dots");
    let currentIndex = 0;
    let interval;

    // create dots
    cards.forEach((_, i) => {
        const dot = document.createElement("span");
        if (i === 0) dot.classList.add("active");
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll("span");

    function showCard(index) {
        cards.forEach((card, i) => {
            card.classList.toggle("active", i === index);
            dots[i].classList.toggle("active", i === index);
        });
    }

    function nextCard() {
        currentIndex = (currentIndex + 1) % cards.length;
        showCard(currentIndex);
    }

    // autoplay
    function startAutoplay() {
        interval = setInterval(nextCard, 3000);
    }

    function stopAutoplay() {
        clearInterval(interval);
    }

    // dots click
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            currentIndex = i;
            showCard(currentIndex);
            stopAutoplay();
            startAutoplay();
        });
    });

    showCard(currentIndex);
    startAutoplay();
});