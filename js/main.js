document.addEventListener('DOMContentLoaded', () => {
    // Burger menu
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

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navList.classList.remove("show");
            burger.classList.remove("active");
        });
    });

    // Mentors slider
    const track = document.querySelector(".mentors-slider__track");
    let cards = document.querySelectorAll(".mentor-card");
    const prevBtn = document.querySelector(".slider-btn.prev");
    const nextBtn = document.querySelector(".slider-btn.next");
    const dotsContainer = document.querySelector(".slider-dots");
    let currentIndex = 0;

    function createDots() {
        dotsContainer.innerHTML = "";
        cards.forEach((_, i) => {
            const dot = document.createElement("span");
            if (i === currentIndex) dot.classList.add("active");
            dot.addEventListener("click", () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        cards.forEach(c => c.classList.remove("active"));
        cards[currentIndex].classList.add("active");

        const containerWidth = document.querySelector(".container-slider").offsetWidth;
        const cardWidth = cards[0].offsetWidth + 20;
        const offset = (containerWidth / 2) - (cardWidth / 2) - cardWidth * currentIndex;
        track.style.transform = `translateX(${offset}px)`;

        createDots();
    }

    nextBtn.addEventListener("click", () => goToSlide((currentIndex + 1) % cards.length));
    prevBtn.addEventListener("click", () => goToSlide((currentIndex - 1 + cards.length) % cards.length));
    goToSlide(currentIndex);

    // FAQ toggle
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

    // Contact form
    const form = document.getElementById('contact-form');
    const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"; // GAS URL ni qo'ying

    form.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(form);
        fetch(SCRIPT_URL, { method: 'POST', body: formData })
            .then(resp => resp.json())
            .then(result => {
                if (result.status === "success") {
                    alert("✅ Muvaffaqiyatli yuborildi!");
                    form.reset();
                } else {
                    alert("❌ Xatolik yuz berdi!");
                }
            })
            .catch(() => alert("❌ Xatolik yuz berdi!"));
    });
});