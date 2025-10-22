/*
    script.js
    Ejemplo de script pensado para integrarse con un index.html típico.
    - Toggle de menú (id="menuToggle", id="mainNav")
    - Toggle de tema oscuro (id="themeToggle")
    - Validación simple de formulario (id="contactForm")
    - Smooth scroll para enlaces con data-scroll
    - Carga de contenido dinámico en #features (intenta /data/features.json, usa fallback)
*/

(() => {
    'use strict';

    // Helpers
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

    // DOMContentLoaded
    on(document, 'DOMContentLoaded', () => {
        initMenuToggle();
        initTheme();
        initSmoothScroll();
        initContactForm();
        loadFeatures();
    });

    // 1) Menu mobile toggle
    function initMenuToggle() {
        const toggle = $('#menuToggle');
        const nav = $('#mainNav');
        if (!toggle || !nav) return;
        on(toggle, 'click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            nav.classList.toggle('open');
        });
    }

    // 2) Theme toggle with localStorage
    function initTheme() {
        const key = 'site-theme';
        const toggle = $('#themeToggle');
        const apply = (theme) => {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'dark'));
        };
        const stored = localStorage.getItem(key) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        apply(stored);
        if (!toggle) return;
        on(toggle, 'click', () => {
            const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem(key, next);
            apply(next);
        });
    }

    // 3) Smooth scroll for anchors with data-scroll
    function initSmoothScroll() {
        on(document, 'click', (e) => {
            const a = e.target.closest && e.target.closest('a[data-scroll]');
            if (!a) return;
            const href = a.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // update hash without jump
            history.replaceState(null, '', href);
        });
    }

    // 4) Contact form simple validation and fake submit
    function initContactForm() {
        const form = $('#contactForm');
        if (!form) return;
        const feedback = $('#formFeedback');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors(form);
            const data = new FormData(form);
            const name = (data.get('name') || '').trim();
            const email = (data.get('email') || '').trim();
            const message = (data.get('message') || '').trim();

            const errors = {};
            if (!name) errors.name = 'Ingresa tu nombre';
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Ingresa un correo válido';
            if (!message || message.length < 10) errors.message = 'Mensaje demasiado corto';

            if (Object.keys(errors).length) {
                showErrors(form, errors);
                showFeedback('Corrige los errores del formulario.', 'error', feedback);
                return;
            }

            // Simula envío (reemplazar con fetch real si se necesita)
            showFeedback('Enviando...', 'info', feedback);
            form.querySelector('button[type="submit"]').disabled = true;
            setTimeout(() => {
                form.reset();
                form.querySelector('button[type="submit"]').disabled = false;
                showFeedback('Mensaje enviado. Gracias.', 'success', feedback);
            }, 900);
        });
    }

    function showErrors(form, errors) {
        Object.keys(errors).forEach((name) => {
            const el = form.querySelector(`[name="${name}"]`);
            if (!el) return;
            el.classList.add('invalid');
            let span = el.parentElement && el.parentElement.querySelector('.field-error');
            if (!span) {
                span = document.createElement('div');
                span.className = 'field-error';
                el.parentElement && el.parentElement.appendChild(span);
            }
            span.textContent = errors[name];
        });
    }

    function clearErrors(form) {
        $$('.field-error', form).forEach(n => n.remove());
        $$('.invalid', form).forEach(n => n.classList.remove('invalid'));
    }

    function showFeedback(text, type = 'info', container) {
        if (!container) return;
        container.textContent = text;
        container.className = `feedback ${type}`; // permitir estilos .feedback.success/.error/.info
        // Desaparece después de 4s si es success
        if (type === 'success') setTimeout(() => container.textContent = '', 4000);
    }

    // 5) Carga dinámica de "features"
    function loadFeatures() {
        const dest = $('#features');
        if (!dest) return;
        fetch('/data/features.json')
            .then(res => {
                if (!res.ok) throw new Error('no-json');
                return res.json();
            })
            .then(list => renderFeatures(list, dest))
            .catch(() => {
                // Fallback local
                const fallback = [
                    { title: 'Rápido', desc: 'Carga y respuesta ágil para usuarios.' },
                    { title: 'Accesible', desc: 'Controles pensados para teclado y lectores.' },
                    { title: 'Modular', desc: 'Código sencillo de adaptar a tu proyecto.' }
                ];
                renderFeatures(fallback, dest);
            });
    }

    function renderFeatures(list, dest) {
        dest.innerHTML = '';
        list.forEach(item => {
            const card = document.createElement('article');
            card.className = 'feature';
            card.innerHTML = `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.desc)}</p>`;
            dest.appendChild(card);
        });
    }

    function escapeHtml(s = '') {
        return String(s).replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    }

})();