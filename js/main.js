document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------ BURGER MENU ------------------------ */
    const mobileBurger = document.querySelector("#mobile-burger");
    const desktopBurger = document.querySelector("#desktop-burger");
    const navList = document.querySelector(".nav__list");
    const navLinks = document.querySelectorAll(".nav__list a");

    function toggleMenu(burger) {
        burger.classList.toggle("active");
        if (burger.classList.contains("active")) {
            setTimeout(() => navList.classList.add("show"), 300);
        } else {
            navList.classList.remove("show");
        }
    }

    if (mobileBurger) mobileBurger.addEventListener("click", () => toggleMenu(mobileBurger));
    if (desktopBurger) desktopBurger.addEventListener("click", () => toggleMenu(desktopBurger));

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navList.classList.remove("show");
            mobileBurger?.classList.remove("active");
            desktopBurger?.classList.remove("active");
        });
    });

    /* ------------------------ MENTOR SLIDER ------------------------ */
    const track = document.querySelector(".mentors-slider__track");
    let cards = document.querySelectorAll(".mentor-card");
    const prevBtn = document.querySelector(".slider-btn.prev");
    const nextBtn = document.querySelector(".slider-btn.next");
    const dotsContainer = document.querySelector(".slider-dots");
    let currentIndex = 0;

    function createDots() {
        if (!dotsContainer) return;
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
        const cardWidth = cards[0].offsetWidth + 20; // margin qo‘shildi
        const offset = (containerWidth / 2) - (cardWidth / 2) - cardWidth * currentIndex;
        track.style.transform = `translateX(${offset}px)`;

        createDots();
    }

    nextBtn?.addEventListener("click", () => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= cards.length) nextIndex = 0;
        goToSlide(nextIndex);
    });

    prevBtn?.addEventListener("click", () => {
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = cards.length - 1;
        goToSlide(prevIndex);
    });

    goToSlide(currentIndex);

    /* ------------------------ FAQ ACCORDION ------------------------ */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question?.addEventListener('click', () => {
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

    /* ------------------------ CONTACT FORM ------------------------ */
    const form = document.querySelector('.contact-form');
    const status = document.getElementById('form-status');

    // Shu yerga o'zingiz deploy qilgan Google Apps Script URL sini qo'ying
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxxekudj2qk1j3jhWedvkMoR1YX93G909BAq64iFWxuNfk27wKnlZi5wZG0VWcCGUEpLw/exec";

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const formData = new FormData(form);

            fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        status.innerText = "✅ Muvaffaqiyatli yuborildi!";
                        status.style.color = "green";
                        form.reset();
                        setTimeout(() => status.innerText = "", 4000);
                    } else {
                        status.innerText = "❌ Xatolik yuz berdi!";
                        status.style.color = "red";
                    }
                })
                .catch(err => {
                    console.error(err);
                    status.innerText = "❌ Xatolik yuz berdi!";
                    status.style.color = "red";
                });
        });
    }

});
