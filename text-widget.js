(function() {
    'use strict';

    // Default configuration
    const defaultConfig = {
        webhook: {
            url: '',
            route: 'general'
        },
        branding: {
            logo: '',
            avatar: '',
            name: 'Chat Support',
            welcomeText: 'Hi there, have a question? Text us here.',
            headerText: 'Get a quick response via text.',
            subHeaderText: 'Enter your information, and our team will text you shortly.',
            responseTimeText: '',
            consentText: 'By submitting, you authorize us to text/call the number above for informational messages, possibly using automated means and/or AI-generated calls/content. Msg/data rates apply, msg frequency varies. Consent is not a condition of purchase. Text HELP for help and STOP to unsubscribe.',
            termsUrl: '',
            termsLinkText: 'See terms'
        },
        style: {
            primaryColor: '#B85C38',
            gradientStart: '',
            gradientEnd: '',
            position: 'right',
            buttonText: 'Text us',
            buttonShape: 'pill',
            showPoweredBy: true
        },
        form: {
            fields: {
                name: { show: true, required: true, label: 'Name', placeholder: '' },
                phone: { show: true, required: true, label: 'Mobile Phone', placeholder: '' },
                email: { show: false, required: false, label: 'Email', placeholder: '' },
                message: { show: true, required: false, label: 'Message', placeholder: '' }
            },
            submitText: 'Send',
            successMessage: 'Thanks! We\'ll text you shortly.'
        }
    };

    // Merge configurations
    function mergeConfig(defaults, custom) {
        const result = { ...defaults };
        for (const key in custom) {
            if (custom[key] !== null && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
                result[key] = mergeConfig(defaults[key] || {}, custom[key]);
            } else {
                result[key] = custom[key];
            }
        }
        return result;
    }

    // Get config from window
    const config = mergeConfig(defaultConfig, window.ChatWidgetConfig || {});

    // Determine button background
    const hasGradient = config.style.gradientStart && config.style.gradientEnd;
    const buttonBg = hasGradient 
        ? `linear-gradient(135deg, ${config.style.gradientStart}, ${config.style.gradientEnd})`
        : config.style.primaryColor;

    // Styles - Compact version matching Podium
    const styles = `
        .tw-container * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .tw-container {
            position: fixed;
            bottom: 24px;
            ${config.style.position}: 24px;
            z-index: 999999;
            font-size: 14px;
            line-height: 1.4;
        }

        /* Floating Button */
        .tw-button {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 28px;
            background: ${buttonBg};
            color: white;
            border: none;
            border-radius: 999px !important;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .tw-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.25);
        }

        .tw-button svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
        }

        .tw-button.tw-close-mode {
            padding: 14px;
            border-radius: 50% !important;
        }

        .tw-button.tw-close-mode svg {
            width: 22px;
            height: 22px;
        }

        .tw-button.tw-close-mode span {
            display: none;
        }

        /* Teaser Bubble */
        .tw-teaser-wrap {
            position: absolute;
            bottom: 70px;
            ${config.style.position}: 0;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
        }

        .tw-teaser-wrap.tw-teaser-visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .tw-teaser-wrap.tw-teaser-hidden {
            opacity: 0 !important;
            visibility: hidden !important;
        }

        .tw-teaser-close {
            position: absolute;
            top: -6px;
            ${config.style.position}: -6px;
            width: 22px;
            height: 22px;
            padding: 0;
            border: none;
            background: #9ca3af;
            border-radius: 50%;
            cursor: pointer;
            color: white;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.15s ease, background 0.15s ease;
            z-index: 10;
        }

        .tw-teaser-wrap:hover .tw-teaser-close {
            opacity: 1;
        }

        .tw-teaser-close:hover {
            background: #6b7280;
        }

        .tw-teaser {
            background: white;
            border-radius: 16px;
            padding: 18px 22px;
            box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12);
            min-width: 280px;
            max-width: 320px;
            cursor: pointer;
            position: relative;
        }

        .tw-teaser::after {
            content: '';
            position: absolute;
            bottom: -10px;
            ${config.style.position}: 28px;
            width: 20px;
            height: 20px;
            background: white;
            transform: rotate(45deg);
            box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.05);
        }

        .tw-teaser-content {
            display: flex;
            align-items: center;
            gap: 14px;
            position: relative;
            z-index: 1;
            background: white;
        }

        .tw-teaser-avatar {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            object-fit: cover;
            border: 2px solid ${config.style.primaryColor}25;
            flex-shrink: 0;
        }

        .tw-teaser-text {
            color: #1a1a1a;
            font-size: 16px;
            font-weight: 500;
            line-height: 1.4;
        }

        /* Modal - Compact */
        .tw-modal {
            position: fixed;
            bottom: 100px;
            ${config.style.position}: 24px;
            width: 340px;
            max-width: calc(100vw - 48px);
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 50px rgba(0, 0, 0, 0.18);
            overflow: hidden;
            display: none;
            flex-direction: column;
        }

        .tw-modal.tw-open {
            display: flex;
            animation: twSlideUp 0.25s ease;
        }

        @media (max-width: 480px) {
            .tw-modal {
                bottom: 0;
                ${config.style.position}: 0;
                width: 100%;
                max-width: 100%;
                border-radius: 16px 16px 0 0;
            }
        }

        /* Modal Header - Compact */
        .tw-header {
            background: ${config.style.primaryColor};
            color: white;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tw-header svg {
            width: 18px;
            height: 18px;
            fill: currentColor;
            opacity: 0.9;
        }

        .tw-header-title {
            font-size: 14px;
            font-weight: 600;
        }

        /* Sub Header Bubble - Compact */
        .tw-subheader {
            padding: 12px 16px 0;
        }

        .tw-subheader-bubble {
            background: #E8F4FC;
            border-radius: 12px;
            border-bottom-left-radius: 4px;
            padding: 10px 14px;
            color: #1a1a1a;
            font-size: 13px;
            line-height: 1.4;
        }

        /* Form Section - Compact */
        .tw-form-wrapper {
            padding: 12px 16px;
        }

        .tw-form-card {
            background: white;
            border-radius: 12px;
            padding: 12px 14px;
            box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
        }

        .tw-form-group {
            margin-bottom: 12px;
            position: relative;
        }

        .tw-form-group:last-child {
            margin-bottom: 0;
        }

        /* Underline style inputs like Podium */
        .tw-label {
            display: block;
            color: #6b7280;
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 2px;
        }

        .tw-label.tw-active {
            color: ${config.style.primaryColor};
        }

        .tw-input-wrap {
            position: relative;
        }

        .tw-input {
            width: 100%;
            padding: 6px 30px 6px 0;
            border: none;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
            color: #1a1a1a;
            background: transparent;
            transition: border-color 0.2s;
            outline: none;
        }

        .tw-input:focus {
            border-bottom-color: ${config.style.primaryColor};
        }

        .tw-input.tw-valid {
            border-bottom-color: ${config.style.primaryColor};
        }

        .tw-input::placeholder {
            color: #9ca3af;
        }

        .tw-textarea {
            width: 100%;
            padding: 6px 0;
            border: none;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
            color: #1a1a1a;
            background: transparent;
            transition: border-color 0.2s;
            outline: none;
            resize: none;
            min-height: 50px;
            font-family: inherit;
        }

        .tw-textarea:focus {
            border-bottom-color: ${config.style.primaryColor};
        }

        /* Checkmark */
        .tw-check {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            color: #10b981;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .tw-check.tw-visible {
            opacity: 1;
        }

        /* Consent - Compact */
        .tw-consent {
            padding: 10px 16px;
            font-size: 10px;
            color: #6b7280;
            line-height: 1.5;
            text-align: justify;
        }

        .tw-consent a {
            color: #1a1a1a;
            text-decoration: underline;
        }

        /* Submit Button - Compact */
        .tw-submit-wrap {
            padding: 0 16px 12px;
            text-align: center;
        }

        .tw-submit {
            background: #d1d5db;
            color: white;
            border: none;
            padding: 10px 40px;
            border-radius: 999px;
            font-size: 14px;
            font-weight: 600;
            cursor: not-allowed;
            transition: background 0.3s;
        }

        .tw-submit.tw-enabled {
            cursor: pointer;
            background: ${buttonBg};
        }

        .tw-submit.tw-loading {
            position: relative;
            color: transparent;
        }

        .tw-submit.tw-loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 16px;
            height: 16px;
            margin: -8px 0 0 -8px;
            border: 2px solid white;
            border-top-color: transparent;
            border-radius: 50%;
            animation: twSpin 0.7s linear infinite;
        }

        /* Footer - Compact */
        .tw-footer {
            padding: 10px 16px;
            text-align: center;
            border-top: 1px solid #f3f4f6;
            font-size: 11px;
            color: #6b7280;
            background: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            flex-wrap: wrap;
        }

        .tw-footer a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
        }

        .tw-footer a:hover {
            text-decoration: underline;
        }

        .tw-footer-brand {
            color: #1a1a1a;
            font-weight: 700;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .tw-footer-brand:hover {
            text-decoration: underline;
        }

        .tw-footer-brand img {
            width: 14px;
            height: 14px;
            border-radius: 3px;
        }

        /* Success State */
        .tw-success {
            padding: 40px 20px;
            text-align: center;
            display: none;
        }

        .tw-success.tw-show {
            display: block;
        }

        .tw-success-icon {
            width: 50px;
            height: 50px;
            background: ${config.style.primaryColor}20;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
        }

        .tw-success-icon svg {
            width: 26px;
            height: 26px;
            stroke: ${config.style.primaryColor};
            fill: none;
        }

        .tw-success-text {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 4px;
        }

        .tw-success-subtext {
            font-size: 13px;
            color: #6b7280;
        }

        /* Error State */
        .tw-error {
            background: #FEE2E2;
            color: #DC2626;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 10px;
            font-size: 12px;
            display: none;
        }

        .tw-error.tw-show {
            display: block;
        }

        .tw-form.tw-hidden-form {
            display: none;
        }

        /* Animations */
        @keyframes twSlideUp {
            from {
                opacity: 0;
                transform: translateY(15px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes twSpin {
            to {
                transform: rotate(360deg);
            }
        }
    `;

    // Icons
    const icons = {
        chat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`,
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        checkSmall: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    };

    // Widget Class
    class TextWidget {
        constructor() {
            this.isOpen = false;
            this.isSubmitted = false;
            this.teaserHidden = false;
            this.teaserShown = false;
            this.init();
        }

        init() {
            this.injectStyles();
            this.createWidget();
            this.attachEvents();
            this.setupScrollTrigger();
        }

        injectStyles() {
            const style = document.createElement('style');
            style.id = 'tw-styles';
            style.textContent = styles;
            document.head.appendChild(style);
        }

        createWidget() {
            this.container = document.createElement('div');
            this.container.className = 'tw-container';

            this.container.innerHTML = `
                <div class="tw-teaser-wrap" id="tw-teaser-wrap">
                    <button class="tw-teaser-close" id="tw-teaser-close">×</button>
                    <div class="tw-teaser" id="tw-teaser">
                        <div class="tw-teaser-content">
                            ${config.branding.avatar ? `<img src="${config.branding.avatar}" alt="" class="tw-teaser-avatar">` : ''}
                            <div class="tw-teaser-text">${config.branding.welcomeText}</div>
                        </div>
                    </div>
                </div>

                <button class="tw-button" id="tw-button">
                    ${icons.chat}
                    <span>${config.style.buttonText}</span>
                </button>

                <div class="tw-modal" id="tw-modal">
                    <div class="tw-header">
                        ${icons.chat}
                        <span class="tw-header-title">${config.branding.headerText}</span>
                    </div>

                    <div class="tw-subheader">
                        <div class="tw-subheader-bubble">${config.branding.subHeaderText}</div>
                    </div>

                    <form class="tw-form" id="tw-form">
                        <div class="tw-form-wrapper">
                            <div class="tw-form-card">
                                <div class="tw-error" id="tw-error"></div>

                                ${config.form.fields.name.show ? `
                                <div class="tw-form-group">
                                    <label class="tw-label" for="tw-name" id="tw-name-label">${config.form.fields.name.label}</label>
                                    <div class="tw-input-wrap">
                                        <input type="text" class="tw-input" id="tw-name" name="name" 
                                            placeholder="${config.form.fields.name.placeholder}"
                                            data-required="${config.form.fields.name.required}">
                                        <span class="tw-check" id="tw-name-check">${icons.checkSmall}</span>
                                    </div>
                                </div>` : ''}

                                ${config.form.fields.phone.show ? `
                                <div class="tw-form-group">
                                    <label class="tw-label" for="tw-phone" id="tw-phone-label">${config.form.fields.phone.label}</label>
                                    <div class="tw-input-wrap">
                                        <input type="tel" class="tw-input" id="tw-phone" name="phone"
                                            placeholder="${config.form.fields.phone.placeholder}"
                                            data-required="${config.form.fields.phone.required}">
                                        <span class="tw-check" id="tw-phone-check">${icons.checkSmall}</span>
                                    </div>
                                </div>` : ''}

                                ${config.form.fields.email.show ? `
                                <div class="tw-form-group">
                                    <label class="tw-label" for="tw-email" id="tw-email-label">${config.form.fields.email.label}</label>
                                    <div class="tw-input-wrap">
                                        <input type="email" class="tw-input" id="tw-email" name="email"
                                            placeholder="${config.form.fields.email.placeholder}"
                                            data-required="${config.form.fields.email.required}">
                                        <span class="tw-check" id="tw-email-check">${icons.checkSmall}</span>
                                    </div>
                                </div>` : ''}

                                ${config.form.fields.message.show ? `
                                <div class="tw-form-group">
                                    <label class="tw-label" for="tw-message" id="tw-message-label">${config.form.fields.message.label}</label>
                                    <textarea class="tw-textarea" id="tw-message" name="message" rows="2"
                                        placeholder="${config.form.fields.message.placeholder}"
                                        data-required="${config.form.fields.message.required}"></textarea>
                                </div>` : ''}
                            </div>
                        </div>

                        <div class="tw-consent">
                            ${config.branding.consentText}${config.branding.termsUrl ? ` <a href="${config.branding.termsUrl}" target="_blank" rel="noopener">${config.branding.termsLinkText}</a>.` : ''}
                        </div>

                        <div class="tw-submit-wrap">
                            <button type="submit" class="tw-submit" id="tw-submit">${config.form.submitText}</button>
                        </div>
                    </form>

                    <div class="tw-success" id="tw-success">
                        <div class="tw-success-icon">${icons.check}</div>
                        <div class="tw-success-text">${config.form.successMessage}</div>
                        <div class="tw-success-subtext">We'll be in touch soon.</div>
                    </div>

                    ${config.style.showPoweredBy ? `
                    <div class="tw-footer">
                        <a href="https://automatelly.com" target="_blank" rel="noopener">Try website texting</a>
                        <span>powered by</span>
                        <a href="https://automatelly.com" target="_blank" rel="noopener" class="tw-footer-brand">
                            <img src="https://automatelly.com/wp-content/uploads/2025/11/Favicon-648X648.png" alt="">
                            Automatelly
                        </a>
                    </div>` : ''}
                </div>
            `;

            document.body.appendChild(this.container);

            this.button = this.container.querySelector('#tw-button');
            this.teaserWrap = this.container.querySelector('#tw-teaser-wrap');
            this.teaser = this.container.querySelector('#tw-teaser');
            this.teaserClose = this.container.querySelector('#tw-teaser-close');
            this.modal = this.container.querySelector('#tw-modal');
            this.form = this.container.querySelector('#tw-form');
            this.errorEl = this.container.querySelector('#tw-error');
            this.successEl = this.container.querySelector('#tw-success');
            this.submitBtn = this.container.querySelector('#tw-submit');
        }

        setupScrollTrigger() {
            let scrollTimeout;
            const handleScroll = () => {
                if (this.teaserHidden || this.teaserShown || this.isOpen) return;
                
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (window.scrollY > 100) {
                        this.showTeaser();
                    }
                }, 300);
            };

            window.addEventListener('scroll', handleScroll, { passive: true });

            setTimeout(() => {
                if (!this.teaserHidden && !this.teaserShown && !this.isOpen) {
                    this.showTeaser();
                }
            }, 3000);
        }

        showTeaser() {
            this.teaserShown = true;
            this.teaserWrap.classList.add('tw-teaser-visible');
        }

        attachEvents() {
            this.button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });

            this.teaser.addEventListener('click', (e) => {
                e.stopPropagation();
                this.open();
            });

            this.teaserClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideTeaser();
            });

            const nameInput = this.form.querySelector('#tw-name');
            const phoneInput = this.form.querySelector('#tw-phone');
            const emailInput = this.form.querySelector('#tw-email');
            const messageInput = this.form.querySelector('#tw-message');

            if (nameInput) {
                nameInput.addEventListener('input', () => this.validateField('name'));
                nameInput.addEventListener('focus', () => this.setLabelActive('name', true));
                nameInput.addEventListener('blur', () => this.setLabelActive('name', false));
            }

            if (phoneInput) {
                phoneInput.addEventListener('input', () => this.validateField('phone'));
                phoneInput.addEventListener('focus', () => this.setLabelActive('phone', true));
                phoneInput.addEventListener('blur', () => this.setLabelActive('phone', false));
            }

            if (emailInput) {
                emailInput.addEventListener('input', () => this.validateField('email'));
                emailInput.addEventListener('focus', () => this.setLabelActive('email', true));
                emailInput.addEventListener('blur', () => this.setLabelActive('email', false));
            }

            if (messageInput) {
                messageInput.addEventListener('input', () => this.checkFormValidity());
                messageInput.addEventListener('focus', () => this.setLabelActive('message', true));
                messageInput.addEventListener('blur', () => this.setLabelActive('message', false));
            }

            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.container.contains(e.target)) {
                    this.close();
                }
            });
        }

        setLabelActive(fieldName, active) {
            const label = this.form.querySelector(`#tw-${fieldName}-label`);
            if (label) {
                if (active) {
                    label.classList.add('tw-active');
                } else {
                    label.classList.remove('tw-active');
                }
            }
        }

        validateField(fieldName) {
            const input = this.form.querySelector(`#tw-${fieldName}`);
            const check = this.form.querySelector(`#tw-${fieldName}-check`);
            
            if (!input) return false;

            let isValid = false;
            const value = input.value.trim();

            if (fieldName === 'name') {
                isValid = value.length >= 1;
            } else if (fieldName === 'phone') {
                const phoneClean = value.replace(/\D/g, '');
                isValid = phoneClean.length >= 10;
            } else if (fieldName === 'email') {
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            }

            if (check) {
                if (isValid) {
                    check.classList.add('tw-visible');
                    input.classList.add('tw-valid');
                } else {
                    check.classList.remove('tw-visible');
                    input.classList.remove('tw-valid');
                }
            }

            this.checkFormValidity();
            return isValid;
        }

        checkFormValidity() {
            const nameInput = this.form.querySelector('#tw-name');
            const phoneInput = this.form.querySelector('#tw-phone');
            
            let nameValid = true;
            let phoneValid = true;

            if (nameInput && config.form.fields.name.required) {
                nameValid = nameInput.value.trim().length >= 1;
            }

            if (phoneInput && config.form.fields.phone.required) {
                const phoneClean = phoneInput.value.replace(/\D/g, '');
                phoneValid = phoneClean.length >= 10;
            }

            if (nameValid && phoneValid) {
                this.submitBtn.classList.add('tw-enabled');
            } else {
                this.submitBtn.classList.remove('tw-enabled');
            }
        }

        hideTeaser() {
            this.teaserHidden = true;
            this.teaserWrap.classList.remove('tw-teaser-visible');
            this.teaserWrap.classList.add('tw-teaser-hidden');
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        open() {
            this.isOpen = true;
            this.hideTeaser();
            this.modal.classList.add('tw-open');
            this.button.classList.add('tw-close-mode');
            this.button.innerHTML = `${icons.close}<span></span>`;

            setTimeout(() => {
                const firstInput = this.modal.querySelector('input, textarea');
                if (firstInput) firstInput.focus();
            }, 100);
        }

        close() {
            this.isOpen = false;
            this.modal.classList.remove('tw-open');
            this.button.classList.remove('tw-close-mode');
            this.button.innerHTML = `${icons.chat}<span>${config.style.buttonText}</span>`;
        }

        async handleSubmit(e) {
            e.preventDefault();

            if (!this.submitBtn.classList.contains('tw-enabled')) {
                return;
            }

            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name') || '',
                phone: formData.get('phone') || '',
                email: formData.get('email') || '',
                message: formData.get('message') || '',
                route: config.webhook.route,
                source: window.location.href,
                timestamp: new Date().toISOString(),
                branding: { name: config.branding.name }
            };

            if (config.form.fields.phone.required && data.phone) {
                const phoneClean = data.phone.replace(/\D/g, '');
                if (phoneClean.length < 10) {
                    this.showError('Please enter a valid phone number.');
                    return;
                }
            }

            this.submitBtn.classList.add('tw-loading');
            this.hideError();

            try {
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!response.ok) throw new Error('Request failed');

                this.form.classList.add('tw-hidden-form');
                this.successEl.classList.add('tw-show');
                this.isSubmitted = true;

                setTimeout(() => {
                    this.close();
                    setTimeout(() => {
                        this.form.reset();
                        this.form.classList.remove('tw-hidden-form');
                        this.successEl.classList.remove('tw-show');
                        this.submitBtn.classList.remove('tw-loading');
                        this.submitBtn.classList.remove('tw-enabled');
                        this.form.querySelectorAll('.tw-check').forEach(c => c.classList.remove('tw-visible'));
                        this.form.querySelectorAll('.tw-input').forEach(i => i.classList.remove('tw-valid'));
                    }, 400);
                }, 2500);

            } catch (error) {
                console.error('TextWidget error:', error);
                this.showError('Something went wrong. Please try again.');
                this.submitBtn.classList.remove('tw-loading');
            }
        }

        showError(msg) {
            this.errorEl.textContent = msg;
            this.errorEl.classList.add('tw-show');
        }

        hideError() {
            this.errorEl.classList.remove('tw-show');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new TextWidget());
    } else {
        new TextWidget();
    }

    window.TextWidget = TextWidget;
})();
