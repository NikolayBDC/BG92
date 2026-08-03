(() => {
    const root = document.documentElement;
    const body = document.body;
    const header = document.getElementById('siteHeader');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const backTop = document.getElementById('backTop');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const closeMenu = (returnFocus = false) => {
        if (!navToggle || !navMenu) return;
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Открыть меню');
        navMenu.classList.remove('is-open');
        body.classList.remove('menu-open');
        if (returnFocus) navToggle.focus();
    };

    navToggle?.addEventListener('click', () => {
        const willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
        navToggle.setAttribute('aria-expanded', String(willOpen));
        navToggle.setAttribute('aria-label', willOpen ? 'Закрыть меню' : 'Открыть меню');
        navMenu?.classList.toggle('is-open', willOpen);
        body.classList.toggle('menu-open', willOpen);
    });

    navMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navMenu?.classList.contains('is-open')) closeMenu(true);
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1160) closeMenu();
    }, { passive: true });

    const updateScrollState = () => {
        const scrolled = window.scrollY > 30;
        header?.classList.toggle('is-scrolled', scrolled);
        backTop?.classList.toggle('is-visible', window.scrollY > 700);
    };
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    backTop?.addEventListener('click', () => window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
    }));

    const setupAccordion = (selector, openClass) => {
        document.querySelectorAll(selector).forEach((button, index) => {
            const item = button.parentElement;
            const answer = button.nextElementSibling;
            if (!item || !answer) return;

            const answerId = answer.id || `accordion-answer-${openClass}-${index + 1}`;
            answer.id = answerId;
            button.setAttribute('aria-controls', answerId);
            const initiallyOpen = item.classList.contains(openClass);
            button.setAttribute('aria-expanded', String(initiallyOpen));
            answer.setAttribute('aria-hidden', String(!initiallyOpen));

            button.addEventListener('click', () => {
                const open = item.classList.toggle(openClass);
                button.setAttribute('aria-expanded', String(open));
                answer.setAttribute('aria-hidden', String(!open));
            });
        });
    };
    setupAccordion('.faq-question', 'is-open');
    setupAccordion('.accordion-question', 'active');

    const revealItems = document.querySelectorAll('.reveal');
    if (!reduceMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -32px' });
        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('is-visible'));
    }

    if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
        window.addEventListener('pointermove', event => {
            root.style.setProperty('--mouse-x', `${event.clientX}px`);
            root.style.setProperty('--mouse-y', `${event.clientY}px`);
        }, { passive: true });

        document.querySelectorAll('.tilt').forEach(card => {
            card.addEventListener('pointermove', event => {
                const rect = card.getBoundingClientRect();
                const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -3;
                const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 3;
                card.style.setProperty('--rx', `${rx}deg`);
                card.style.setProperty('--ry', `${ry}deg`);
            });
            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });
    }

    const serviceNames = {
        diagnostic: 'Диагностика',
        coding: 'Кодинг',
        carplay: 'Активация CarPlay',
        chiptuning: 'Чип-тюнинг',
        retrofit: 'Ретрофит',
        remote: 'Выезд / удалённо'
    };
    const requestedService = new URLSearchParams(window.location.search).get('service');
    const serviceSelect = document.querySelector('select[name="service"]');
    if (serviceSelect && requestedService && serviceNames[requestedService]) {
        serviceSelect.value = serviceNames[requestedService];
    }

    const form = document.getElementById('leadForm');
    const message = document.getElementById('formMessage');
    form?.addEventListener('submit', async event => {
        event.preventDefault();
        const submit = form.querySelector('button[type="submit"]');
        const originalText = submit?.innerHTML;
        if (submit) {
            submit.disabled = true;
            submit.textContent = 'Отправляем…';
        }
        form.setAttribute('aria-busy', 'true');

        try {
            const data = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error('Form response was not successful');
            if (message) {
                message.className = 'form-message is-visible success';
                message.setAttribute('role', 'status');
                message.textContent = `Спасибо, ${data.get('name')}! Заявка отправлена — свяжусь с вами в ближайшее время.`;
                message.setAttribute('tabindex', '-1');
                message.focus({ preventScroll: true });
            }
            form.reset();
        } catch {
            if (message) {
                message.className = 'form-message is-visible error';
                message.setAttribute('role', 'alert');
                message.innerHTML = 'Не получилось отправить заявку. Позвоните: <a href="tel:+79786835691">+7 (978) 683-56-91</a>';
                message.setAttribute('tabindex', '-1');
                message.focus({ preventScroll: true });
            }
        } finally {
            form.setAttribute('aria-busy', 'false');
            if (submit) {
                submit.disabled = false;
                submit.innerHTML = originalText;
            }
        }
    });

    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
})();
