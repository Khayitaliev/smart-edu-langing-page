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

//Mentor Slider Uchun 
const track = document.querySelector(".mentors-slider__track");
let cards = document.querySelectorAll(".mentor-card");
const prevBtn = document.querySelector(".slider-btn.prev");
const nextBtn = document.querySelector(".slider-btn.next");
const dotsContainer = document.querySelector(".slider-dots");
let currentIndex = 0;

// Dots yaratish
function createDots() {
    dotsContainer.innerHTML = "";
    cards.forEach((_, i) => {
        const dot = document.createElement("span");
        if (i === currentIndex) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
}

// Sliderni yangilash
function goToSlide(index) {
    currentIndex = index;
    cards.forEach(c => c.classList.remove("active"));
    cards[currentIndex].classList.add("active");

    const containerWidth = document.querySelector(".mentors-slider").offsetWidth;
    const cardWidth = cards[0].offsetWidth + 20; // margin
    const offset = (containerWidth - cardWidth) / 2 - cardWidth * currentIndex;
    track.style.transform = `translateX(${offset}px)`;

    createDots();
}

// Tugmalar funksiyasi
nextBtn.addEventListener("click", () => {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) nextIndex = 0;
    goToSlide(nextIndex);
});
prevBtn.addEventListener("click", () => {
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = cards.length - 1;
    goToSlide(prevIndex);
});

// Dynamic card qo'shish funksiyasi (misol)
function addMentorCard(img, name, subject) {
    const card = document.createElement("div");
    card.classList.add("mentor-card");
    card.innerHTML = `<img src="${img}" alt=""><h3>${name}</h3><p>${subject}</p>`;
    track.appendChild(card);
    cards = document.querySelectorAll(".mentor-card");
    createDots();
}

// Boshlang'ich
goToSlide(currentIndex);