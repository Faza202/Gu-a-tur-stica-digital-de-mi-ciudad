/*
    script.js
    Estructura moderna, modular y clara.
    - Menú móvil accesible
    - Tema oscuro con preferencia de usuario
    - Scroll suave para anclas
    - Validación y feedback de formulario de contacto
    - Carga dinámica de "features"
*/

(() => {
    'use strict';

    // === Helpers ===
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

    // === Inicialización global ===
    document.addEventListener('DOMContentLoaded', () => {
        Menu.init();
        Theme.init();
        SmoothScroll.init();
        ContactForm.init();
        Features.init();
    });

    // === Menú móvil accesible ===
    const Menu = {
        init() {
            const toggle = $('#menuToggle');
            const nav = $('#mainNav');
            if (!toggle || !nav) return;
            on(toggle, 'click', () => {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', String(!expanded));
                nav.classList.toggle('open');
                nav.setAttribute('aria-hidden', expanded ? 'true' : 'false');
            });
        }
    };

    // === Tema oscuro con preferencia de usuario ===
    const Theme = {
        key: 'site-theme',
        init() {
            const toggle = $('#themeToggle');
            const stored = localStorage.getItem(this.key) ||
                (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            this.apply(stored, toggle);
            if (!toggle) return;
            on(toggle, 'click', () => {
                const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                localStorage.setItem(this.key, next);
                this.apply(next, toggle);
            });
        },
        apply(theme, toggle) {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'dark'));
        }
    };

    // === Scroll suave para anclas con data-scroll ===
    const SmoothScroll = {
        init() {
            on(document, 'click', (e) => {
                const a = e.target.closest && e.target.closest('a[data-scroll]');
                if (!a) return;
                const href = a.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', href);
            });
        }
    };

    // === Validación y feedback de formulario de contacto ===
    const ContactForm = {
        init() {
            const form = $('#contactForm');
            if (!form) return;
            let feedback = $('#formFeedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.id = 'formFeedback';
                feedback.setAttribute('role', 'alert');
                feedback.className = 'feedback';
                form.appendChild(feedback);
            }
            on(form, 'submit', (e) => this.handleSubmit(e, form, feedback));
        },
        handleSubmit(e, form, feedback) {
            e.preventDefault();
            this.clearErrors(form);
            const data = new FormData(form);
            const nombre = (data.get('nombre') || '').trim();
            const email = (data.get('email') || '').trim();
            const mensaje = (data.get('mensaje') || '').trim();

            const errors = {};
            if (!nombre) errors.nombre = 'Ingresa tu nombre';
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Ingresa un correo válido';
            if (!mensaje || mensaje.length < 10) errors.mensaje = 'El mensaje debe tener al menos 10 caracteres';

            if (Object.keys(errors).length) {
                this.showErrors(form, errors);
                this.showFeedback('Corrige los errores del formulario.', 'error', feedback);
                return;
            }

            this.showFeedback('Enviando...', 'info', feedback);
            form.querySelector('button[type="submit"]').disabled = true;
            setTimeout(() => {
                form.reset();
                form.querySelector('button[type="submit"]').disabled = false;
                this.showFeedback('Mensaje enviado. ¡Gracias!', 'success', feedback);
            }, 900);
        },
        showErrors(form, errors) {
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
                el.setAttribute('aria-invalid', 'true');
            });
        },
        clearErrors(form) {
            $$('.field-error', form).forEach(n => n.remove());
            $$('.invalid', form).forEach(n => {
                n.classList.remove('invalid');
                n.removeAttribute('aria-invalid');
            });
        },
        showFeedback(text, type = 'info', container) {
            if (!container) return;
            container.textContent = text;
            container.className = `feedback ${type}`;
            if (type === 'success') setTimeout(() => container.textContent = '', 4000);
        }
    };

    // === Carga dinámica de "features" ===
    const Features = {
        init() {
            const dest = $('#features');
            if (!dest) return;
            fetch('/data/features.json')
                .then(res => {
                    if (!res.ok) throw new Error('no-json');
                    return res.json();
                })
                .then(list => this.render(list, dest))
                .catch(() => {
                    // Fallback local
                    const fallback = [
                        { title: 'Rápido', desc: 'Carga y respuesta ágil para usuarios.' },
                        { title: 'Accesible', desc: 'Controles pensados para teclado y lectores.' },
                        { title: 'Modular', desc: 'Código sencillo de adaptar a tu proyecto.' }
                    ];
                    this.render(fallback, dest);
                });
        },
        render(list, dest) {
            dest.innerHTML = '';
            list.forEach(item => {
                const card = document.createElement('article');
                card.className = 'feature';
                card.innerHTML = `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.desc)}</p>`;
                dest.appendChild(card);
            });
        }
    };

    // === Utilidad para escapar HTML ===
    function escapeHtml(s = '') {
        return String(s).replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

})();