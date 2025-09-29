document.addEventListener("DOMContentLoaded", () => {
    /* ---------------- MENU ---------------- */
    const mobileBurger = document.getElementById("mobile-burger");
    const desktopBurger = document.getElementById("desktop-burger");
    const navList = document.querySelector(".nav__list");
    const navLinks = document.querySelectorAll(".nav__list a");

    const toggleMenu = (b) => {
        b.classList.toggle("active");
        navList.classList.toggle("show");
    };

    mobileBurger && mobileBurger.addEventListener("click", () => toggleMenu(mobileBurger));
    desktopBurger && desktopBurger.addEventListener("click", () => toggleMenu(desktopBurger));

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navList.classList.remove("show");
            mobileBurger?.classList.remove("active");
            desktopBurger?.classList.remove("active");
        });
    });

    /* ---------------- FAQ ---------------- */
    document.querySelectorAll(".faq-item").forEach(item => {
        const q = item.querySelector(".faq-question");
        const a = item.querySelector(".faq-answer");
        if (!q || !a) return;
        q.addEventListener("click", () => {
            document.querySelectorAll(".faq-item").forEach(i => {
                if (i !== item) {
                    i.querySelector(".faq-answer").style.maxHeight = null;
                    i.classList.remove("active");
                }
            });
            if (a.style.maxHeight) {
                a.style.maxHeight = null;
                item.classList.remove("active");
            } else {
                a.style.maxHeight = a.scrollHeight + "px";
                item.classList.add("active");
            }
        });
    });

    /* ---------------- CONTACT FORM ---------------- */
    const form = document.forms['contact-form'];
    const statusEl = document.getElementById("form-status");

    // BU YERGA O'Z SCRIPT URL'NI QO'YING (Web App URL)
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwBVQ9-HjckGA11gF-H7eEYyHzKowb_Jfnpx_OObVwyeNitn2sPUjw-mh6Tl8990Sw0Yw/exec"; // ---> o'zgartiring

    // Yordamchi: status ko'rsatish
    const showStatus = ({ text = '', type = 'info', autoHide = true, timeout = 4000 }) => {
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.style.display = 'block';
        statusEl.style.padding = '10px 12px';
        statusEl.style.borderRadius = '6px';
        statusEl.style.marginTop = '8px';
        statusEl.style.boxSizing = 'border-box';
        if (type === 'success') {
            statusEl.style.background = '#e6ffed';
            statusEl.style.color = '#07632a';
            statusEl.style.border = '1px solid #c8f0d1';
        } else if (type === 'error') {
            statusEl.style.background = '#ffe6e6';
            statusEl.style.color = '#6b0b0b';
            statusEl.style.border = '1px solid #f0c8c8';
        } else { // info / loading
            statusEl.style.background = '#fff7e6';
            statusEl.style.color = '#5a3b00';
            statusEl.style.border = '1px solid #f0e1bf';
        }

        if (autoHide) {
            clearTimeout(showStatus._timeout);
            showStatus._timeout = setTimeout(() => {
                statusEl.style.display = 'none';
            }, timeout);
        }
    };

    // Qumsoat icon bilan loading ko'rsatish
    const showLoading = (text = 'Yuborilmoqda...') => {
        showStatus({ text: '⏳ ' + text, type: 'info', autoHide: false });
    };

    const hideLoading = () => {
        statusEl && (statusEl.style.display = 'none');
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Basic validation (optional)
            const name = form.querySelector('[name="Ism"]')?.value?.trim();
            const email = form.querySelector('[name="Email"]')?.value?.trim();
            const phone = form.querySelector('[name="Telefon"]')?.value?.trim();
            const kurs = form.querySelector('[name="Kurs"]')?.value?.trim();

            if (!name || !email || !phone || !kurs) {
                showStatus({ text: 'Iltimos, barcha maydonlarni to‘ldiring.', type: 'error', autoHide: true });
                return;
            }

            showLoading('Yuborilmoqda...');

            try {
                // FormData -> URLSearchParams (apps script bilan mos)
                const fd = new FormData(form);
                const params = new URLSearchParams();
                for (const pair of fd) params.append(pair[0], pair[1]);

                const res = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    body: params.toString()
                });

                // GAS ba'zan TEXT qaytaradi, ba'zan JSON — har ikkisiga moslashamiz
                let dataText = await res.text();
                let data = null;
                try { data = JSON.parse(dataText); } catch (err) { /* text */ }

                if (res.ok && (data && data.result === 'success' || res.status === 200)) {
                    hideLoading();
                    showStatus({ text: '✅ Rahmat! Maʼlumot yuborildi.', type: 'success' });
                    form.reset();
                } else {
                    hideLoading();
                    // agar data.error bo'lsa chiqaramiz
                    const errMsg = data && data.error ? data.error : (dataText || 'Serverdan noaniq xato');
                    showStatus({ text: '❌ Xato: ' + errMsg, type: 'error', autoHide: false });
                    console.error('Server error:', errMsg);
                }
            } catch (err) {
                hideLoading();
                showStatus({ text: '❌ Tarmoq yoki server xatosi. Iltimos qayta urinib ko‘ring.', type: 'error', autoHide: false });
                console.error('Fetch error:', err);
            }
        });
    }
});
