/**
 * Skilleze Technologies — Main JavaScript
 * Lightweight, vanilla JavaScript for interactive components, animations, and conversions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Dynamics
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen = document.querySelector('.mobile-menu-icon-open');
    const iconClose = document.querySelector('.mobile-menu-icon-close');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
            if (iconOpen && iconClose) {
                iconOpen.classList.toggle('hidden');
                iconClose.classList.toggle('hidden');
            }
        });
    }

    // 3. Smooth Scrolling for Internal Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    if (iconOpen && iconClose) {
                        iconOpen.classList.remove('hidden');
                        iconClose.classList.add('hidden');
                    }
                }
            }
        });
    });

    // 4. Back to Top Button
    let backToTopBtn = document.querySelector('.back-to-top-btn');
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top-btn';
        backToTopBtn.setAttribute('aria-label', 'Scroll back to top');
        backToTopBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 15-6-6-6 6"/>
            </svg>
        `;
        document.body.appendChild(backToTopBtn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 5. Floating WhatsApp Quick Widget (if not already present on page)
    if (!document.querySelector('.floating-whatsapp-widget')) {
        const waWidget = document.createElement('a');
        waWidget.className = 'floating-whatsapp-widget';
        waWidget.href = "https://wa.me/918805157074?text=Hi%20Skilleze%20Technologies%2C%20I'd%20like%20to%20talk%20to%20an%20advisor%20about%20course%20and%20internship%20options.";
        waWidget.target = "_blank";
        waWidget.rel = "noopener noreferrer";
        waWidget.setAttribute('aria-label', 'Chat with Technical Advisor on WhatsApp');
        waWidget.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.813 2.796.814 3.182 0 5.769-2.587 5.769-5.766.001-3.18-2.586-5.766-5.769-5.766zm6.862 5.766c-.001 3.784-3.078 6.862-6.863 6.862-1.189 0-2.308-.31-3.287-.852l-3.643.955.972-3.55c-.598-1.026-.913-2.204-.913-3.415.002-3.784 3.08-6.862 6.864-6.862 3.784 0 6.862 3.078 6.862 6.862z"/>
            </svg>
            <span>Chat with Advisor</span>
        `;
        document.body.appendChild(waWidget);
    }

    // 6. Interactive Form Handling -> deliver details to 88051 57074
    function showFormToast(message, type) {
        const existing = document.querySelector('.sk-form-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'sk-form-toast';
        toast.style.cssText = [
            'position:fixed',
            'bottom:24px',
            'left:50%',
            'transform:translateX(-50%)',
            'background:' + (type === 'success' ? '#065f46' : '#7f1d1d'),
            'color:#fff',
            'padding:14px 22px',
            'border-radius:12px',
            'font-size:14px',
            'font-weight:600',
            'z-index:99999',
            'box-shadow:0 8px 32px rgba(0,0,0,0.45)',
            'max-width:90vw',
            'text-align:center',
            'line-height:1.5',
            'transition:opacity 0.4s ease',
            'opacity:1'
        ].join(';');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const action = form.getAttribute('action');
            if (!action || action === '#' || action.startsWith('javascript:')) {
                e.preventDefault();

                // Check form validity
                if (form.checkValidity && !form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                // Extract all input values cleanly
                const formData = new FormData(form);
                const pageTitle = document.title ? document.title.split('|')[0].trim() : 'Website';

                let details = [`*New Application / Enquiry — Skilleze Technologies*`, `*Source:* ${pageTitle}`];

                // Helper to get field value
                const getField = (name) => {
                    const el = form.querySelector(`[name="${name}"]`) || form.querySelector(`#${name}`);
                    return el ? el.value.trim() : (formData.get(name) || '');
                };

                const name = getField('name') || getField('fullName') || '';
                const phone = getField('phone') || getField('mobile') || '';
                const email = getField('email') || '';
                const program = getField('program') || getField('track') || getField('course') || '';
                const college = getField('college') || '';
                const branch = getField('branch') || '';
                const year = getField('yearOfStudy') || getField('year') || '';
                const message = getField('message') || '';

                if (name) details.push(`*Name:* ${name}`);
                if (phone) details.push(`*Phone:* ${phone}`);
                if (email) details.push(`*Email:* ${email}`);
                if (program) details.push(`*Program/Track:* ${program}`);
                if (college) details.push(`*College:* ${college}`);
                if (branch) details.push(`*Branch:* ${branch}`);
                if (year) details.push(`*Year:* ${year}`);
                if (message) details.push(`*Message:* ${message}`);

                const waMessage = details.join('\n');
                const waUrl = `https://wa.me/918805157074?text=${encodeURIComponent(waMessage)}`;

                const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');
                const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<span>Delivering Details...</span>`;
                }

                // Deliver to WhatsApp 88051 57074
                setTimeout(() => {
                    window.open(waUrl, '_blank');
                    showFormToast('✅ Details submitted! Connecting you to our admissions desk via WhatsApp (+91 88051 57074).', 'success');
                    form.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                }, 300);
            }
        });
    });

    // 7. Scroll-Triggered Fade-In Animations (IntersectionObserver)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const animateTargets = document.querySelectorAll(
            'section, .rounded-2xl, .rounded-3xl, details, [data-animate], .sk-reveal, .sk-scale-in'
        );

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('sk-visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        animateTargets.forEach((el, i) => {
            // Only animate elements that aren't already visible
            const rect = el.getBoundingClientRect();
            if (rect.top > window.innerHeight) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`;
            }
            observer.observe(el);
        });
    }

    // 8. Page-Type Detection — sets data-page-type for category-specific CSS
    const path = window.location.pathname.toLowerCase();
    const body = document.body;

    if (path.includes('/internships/') || path.includes('/internship')) {
        body.setAttribute('data-page-type', 'internship');
    } else if (
        path.includes('generative-ai') ||
        path.includes('agentic-ai') ||
        path.includes('/ai')
    ) {
        body.setAttribute('data-page-type', 'ai');
    } else if (path.includes('career-accelerator')) {
        body.setAttribute('data-page-type', 'career');
    }

    // 9. Active Navigation Link Highlighting
    const navLinks = document.querySelectorAll('header nav a, #mobile-menu a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Normalize paths for comparison
        const linkPath = href.replace(/\/$/, '').replace(/\.html$/, '').replace(/\/index$/, '');
        const currentPath = path.replace(/\/$/, '').replace(/\.html$/, '').replace(/\/index$/, '');

        // Exact match or starts-with for section pages
        if (
            linkPath === currentPath ||
            (linkPath !== '' && linkPath !== '/' && currentPath.startsWith(linkPath + '/'))
        ) {
            link.style.color = 'var(--sk-cyan, #00E5FF)';
            link.classList.add('sk-nav-active');
        }
    });
});
