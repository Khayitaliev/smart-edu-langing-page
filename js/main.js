// ===== Burger Menu =====
const burger = document.querySelector("#desktop-burger");
const navList = document.querySelector(".nav__list");
const navLinks = document.querySelectorAll(".nav__list a");

burger.addEventListener("click", () => {
    burger.classList.toggle("active");
    if (burger.classList.contains("active")) {
        setTimeout(() => navList.classList.add("show"), 400);
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

// ===== Mentors Slider =====
const track = document.querySelector(".mentors-slider__track");
let cards = document.querySelectorAll(".mentor-card");
const prevBtn = document.querySelector(".slider-btn.prev");
const nextBtn = document.querySelector(".slider-btn.next");
const dotsContainer = document.querySelector(".slider-dots");
let currentIndex = 0;

// Slider dots yaratish
function createDots() {
    dotsContainer.innerHTML = "";
    cards.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.classList.toggle("active", i === currentIndex);
        dot.addEventListener("click", () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
}

// Slide markazlashgan harakat
function goToSlide(index) {
    currentIndex = index;
    cards.forEach(c => c.classList.remove("active"));
    cards[currentIndex].classList.add("active");

    const containerWidth = document.querySelector(".container-slider").offsetWidth;
    const cardWidth = cards[0].offsetWidth + 20; // margin
    const offset = (containerWidth / 2) - (cardWidth / 2) - cardWidth * currentIndex;
    track.style.transform = `translateX(${offset}px)`;

    createDots();
}

// Slider tugmalar
nextBtn.addEventListener("click", () => goToSlide((currentIndex + 1) % cards.length));
prevBtn.addEventListener("click", () => goToSlide((currentIndex - 1 + cards.length) % cards.length));

// Dynamic card qo'shish
function addMentorCard(img, name, subject) {
    const card = document.createElement("div");
    card.classList.add("mentor-card");
    card.innerHTML = `<img src="${img}" alt="${name}"><h3>${name}</h3><p>${subject}</p>`;
    track.appendChild(card);
    cards = document.querySelectorAll(".mentor-card");
    createDots();
}

goToSlide(currentIndex);

// ===== FAQ Toggle =====
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    question.addEventListener('click', () => {
        faqItems.forEach(i => {
            if (i !== item) {
                i.querySelector('.faq-answer').style.maxHeight = null;
                i.classList.remove('active');
            }
        });
        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
            item.classList.remove('active');
        } else {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            item.classList.add('active');
        }
    });
});

// ===== Contact Form =====
const form = document.querySelector('.contact-form');
const status = document.createElement('p');
status.id = 'form-status';
form.appendChild(status);
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxxekudj2qk1j3jhWedvkMoR1YX93G909BAq64iFWxuNfk27wKnlZi5wZG0VWcCGUEpLw/exec";

form.addEventListener('submit', e => {
    e.preventDefault();

    // Alert tezkor ko‘rsatish
    status.innerText = "✅ Muvaffaqiyatli yuborildi!";
    status.style.color = "green";
    form.reset();

    // Serverga yuborish
    const formData = new FormData(form);
    fetch(SCRIPT_URL, { method: 'POST', body: formData })
        .then(resp => resp.text())
        .then(result => {
            let data;
            try { data = JSON.parse(result); } catch (e) { data = { status: "success" }; }
            if (data.status !== "success") {
                status.innerText = "❌ Xatolik yuz berdi!";
                status.style.color = "red";
            }
        })
        .catch(err => {
            status.innerText = "❌ Xatolik yuz berdi!";
            status.style.color = "red";
        });
});

// ===== Responsive resize =====
window.addEventListener('resize', () => goToSlide(currentIndex));
