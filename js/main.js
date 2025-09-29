document.addEventListener("DOMContentLoaded", () => {
    /* ------------------------ BURGER MENU ------------------------ */
    const mobileBurger = document.querySelector("#mobile-burger");
    const desktopBurger = document.querySelector("#desktop-burger");
    const navList = document.querySelector(".nav__list");
    const navLinks = document.querySelectorAll(".nav__list a");

    function toggleMenu(burger) {
        burger.classList.toggle("active");
        navList.classList.toggle("show");
    }

    mobileBurger?.addEventListener("click", () => toggleMenu(mobileBurger));
    desktopBurger?.addEventListener("click", () => toggleMenu(desktopBurger));

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navList.classList.remove("show");
            mobileBurger?.classList.remove("active");
            desktopBurger?.classList.remove("active");
        });
    });

    /* ------------------------ FAQ ACCORDION ------------------------ */
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        question?.addEventListener("click", () => {
            faqItems.forEach(i => {
                if (i !== item) {
                    i.querySelector(".faq-answer").style.maxHeight = null;
                    i.classList.remove("active");
                }
            });

            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                item.classList.remove("active");
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                item.classList.add("active");
            }
        });
    });

    /* ------------------------ CONTACT FORM ------------------------ */
    const form = document.querySelector(".contact-form");
    const status = document.getElementById("form-status");

    // BU YERGA O'ZINGIZNING GOOGLE SCRIPT URLINGIZNI QO'YING:
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQzMNG-PQvUrfd3kBvYACuA6fL8ApGB5RziE6FLpd36Z0PJyQMj33kqczQhXADI2Xc/exec";

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        status.textContent = "⏳ Yuborilmoqda...";
        status.style.color = "blue";

        try {
            const formData = new FormData(form);

            const response = await fetch(SCRIPT_URL, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                status.textContent = "✅ Ma'lumot muvaffaqiyatli yuborildi!";
                status.style.color = "green";
                form.reset();

                // Agar sahifani yangilamoqchi bo‘lsangiz:
                // setTimeout(() => window.location.reload(), 2000);
            } else {
                status.textContent = "❌ Yuborishda xatolik yuz berdi.";
                status.style.color = "red";
            }
        } catch (error) {
            console.error("Xatolik:", error);
            status.textContent = "❌ Server bilan bog‘lanib bo‘lmadi. Qayta urinib ko‘ring.";
            status.style.color = "red";
        }
    });
});
