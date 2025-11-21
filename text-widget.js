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
    const buttonRadius = config.style.buttonShape === 'square' ? '8px' : '50px';

    // Styles
    const styles = `
        .tw-container * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .tw-container {
            position: fixed;
            bottom: 20px;
            ${config.style.position}: 20px;
            z-index: 999999;
            font-size: 14px;
            line-height: 1.4;
        }

        /* Floating Button */
        .tw-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: ${buttonBg};
            color: white;
            border: none;
            border-radius: ${buttonRadius};
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .tw-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        .tw-button svg {
            width: 18px;
            height: 18px;
            fill: currentColor;
        }

        .tw-button.tw-close-mode {
            padding: 12px;
            border-radius: 50%;
        }

        .tw-button.tw-close-mode svg {
            width: 20px;
            height: 20px;
        }

        .tw-button.tw-close-mode span {
            display: none;
        }

        /* Teaser Bubble */
        .tw-teaser {
            position: absolute;
            bottom: 60px;
            ${config.style.position}: 0;
            background: white;
            border-radius: 12px;
            padding: 16px 18px;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.12);
            min-width: 220px;
            max-width: 260px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
            cursor: pointer;
        }

        .tw-teaser::after {
            content: '';
            position: absolute;
            bottom: -8px;
            ${config.style.position}: 24px;
            width: 16px;
            height: 16px;
            background: white;
            transform: rotate(45deg);
            box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
        }

        .tw-container:hover .tw-teaser:not(.tw-teaser-hidden),
        .tw-teaser:hover {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .tw-teaser-content {
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
            z-index: 1;
            background: white;
        }

        .tw-teaser-avatar {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            object-fit: cover;
            border: 2px solid ${config.style.primaryColor}30;
            flex-shrink: 0;
        }

        .tw-teaser-text {
            color: #1a1a1a;
            font-size: 15px;
            font-weight: 500;
            line-height: 1.35;
        }

        .tw-teaser-close {
            position: absolute;
            top: -8px;
            right: -8px;
            padding: 4px 10px;
            border: none;
            background: #374151;
            border-radius: 20px;
            cursor: pointer;
            color: white;
            font-size: 11px;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.15s ease;
            z-index: 10;
        }

        .tw-teaser:hover .tw-teaser-close {
            opacity: 1;
        }

        .tw-teaser-close:hover {
            background: #1f2937;
        }

        /* Modal */
        .tw-modal {
            position: fixed;
            bottom: 90px;
            ${config.style.position}: 20px;
            width: 340px;
            max-width: calc(100vw - 40px);
            max-height: calc(100vh - 120px);
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 40px rgba(0, 0, 0, 0.15);
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
                max-height: 85vh;
                border-radius: 12px 12px 0 0;
            }
        }

        /* Modal Header */
        .tw-header {
            background: ${config.style.primaryColor};
            color: white;
            padding: 16px 18px;
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
            font-size: 15px;
            font-weight: 600;
        }

        /* Sub Header Bubble */
        .tw-subheader {
            padding: 14px 16px 0;
        }

        .tw-subheader-bubble {
            background: #E8F4FC;
            border-radius: 10px;
            padding: 12px 14px;
            color: #1a1a1a;
            font-size: 13px;
            line-height: 1.45;
        }

        /* Form Section */
        .tw-form-wrapper {
            padding: 14px 16px;
            overflow-y: auto;
            flex: 1;
        }

        .tw-form-card {
            background: white;
            border-radius: 10px;
            padding: 14px 16px;
            border: 1px solid #e5e7eb;
        }

        .tw-form-group {
            margin-bottom: 14px;
        }

        .tw-form-group:last-child {
            margin-bottom: 0;
        }

        .tw-label {
            display: block;
            color: #374151;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 6px;
        }

        .tw-input,
        .tw-textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            color: #1a1a1a;
            background: white;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
        }

        .tw-input:focus,
        .tw-textarea:focus {
            border-color: ${config.style.primaryColor};
            box-shadow: 0 0 0 3px ${config.style.primaryColor}15;
        }

        .tw-input::placeholder,
        .tw-textarea::placeholder {
            color: #9ca3af;
        }

        .tw-textarea {
            resize: none;
            min-height: 70px;
            font-family: inherit;
        }

        /* Consent Text */
        .tw-consent {
            padding: 0 16px 10px;
            font-size: 11px;
            color: #6b7280;
            line-height: 1.5;
        }

        .tw-consent a {
            color: #1a1a1a;
            text-decoration: underline;
        }

        .tw-consent a:hover {
            color: ${config.style.primaryColor};
        }

        /* Submit Button */
        .tw-submit-wrap {
            padding: 0 16px 14px;
            text-align: center;
        }

        .tw-submit {
            background: ${config.style.primaryColor}25;
            color: ${config.style.primaryColor};
            border: none;
            padding: 11px 36px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
        }

        .tw-submit:hover:not(:disabled) {
            background: ${config.style.primaryColor}40;
        }

        .tw-submit:active:not(:disabled) {
            transform: scale(0.98);
        }

        .tw-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
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
            border: 2px solid ${config.style.primaryColor};
            border-top-color: transparent;
            border-radius: 50%;
            animation: twSpin 0.7s linear infinite;
        }

        /* Powered By Footer */
        .tw-footer {
            padding: 10px 16px;
            text-align: center;
            border-top: 1px solid #f3f4f6;
            font-size: 12px;
            color: #6b7280;
            background: #fafafa;
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
            width: 16px;
            height: 16px;
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
            width: 56px;
            height: 56px;
            background: ${config.style.primaryColor}20;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 14px;
        }

        .tw-success-icon svg {
            width: 28px;
            height: 28px;
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
            padding: 10px 12px;
            border-radius: 6px;
            margin-bottom: 12px;
            font-size: 13px;
            display: none;
        }

        .tw-error.tw-show {
            display: block;
        }

        /* Form hidden state */
        .tw-form.tw-hidden {
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
        check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    };

    // Create Widget Class
    class TextWidget {
        constructor() {
            this.isOpen = false;
            this.isSubmitted = false;
            this.teaserHidden = false;
            this.init();
        }

        init() {
            this.injectStyles();
            this.createWidget();
            this.attachEvents();
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

            // Build HTML
            this.container.innerHTML = `
                <!-- Teaser -->
                <div class="tw-teaser" id="tw-teaser">
                    <button class="tw-teaser-close" id="tw-teaser-close">close</button>
                    <div class="tw-teaser-content">
                        ${config.branding.avatar ? `<img src="${config.branding.avatar}" alt="" class="tw-teaser-avatar">` : ''}
                        <div class="tw-teaser-text">${config.branding.welcomeText}</div>
                    </div>
                </div>

                <!-- Main Button -->
                <button class="tw-button" id="tw-button">
                    ${icons.chat}
                    <span>${config.style.buttonText}</span>
                </button>

                <!-- Modal -->
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
                                    <label class="tw-label" for="tw-name">${config.form.fields.name.label}</label>
                                    <input type="text" class="tw-input" id="tw-name" name="name" 
                                        placeholder="${config.form.fields.name.placeholder}"
                                        ${config.form.fields.name.required ? 'required' : ''}>
                                </div>` : ''}

                                ${config.form.fields.phone.show ? `
                                <div class="tw-form-group">
                                    <label class="tw-label" for="tw-phone">${config.form.fields.phone.label}</label>
                                    <input type="tel" class="tw-input" id="tw-phone" name="phone"
                                        placeholder="${config.form.fields.phone.placeholder}"
                                        ${config.form.fields.phone.required ? 'required' : ''}>
                                </div>` : ''}

                                ${config.form.fields.email.show ? `
                                <div class="tw-form-group">
                                    <label class="tw-label" for="tw-email">${config.form.fields.email.label}</label>
                                    <input type="email" class="tw-input" id="tw-email" name="email"
                                        placeholder="${config.form.fields.email.placeholder}"
                                        ${config.form.fields.email.required ? 'required' : ''}>
                                </div>` : ''}

                                ${config.form.fields.message.show ? `
                                <div class="tw-form-group">
                                    <label class="tw-label" for="tw-message">${config.form.fields.message.label}</label>
                                    <textarea class="tw-textarea" id="tw-message" name="message" rows="3"
                                        placeholder="${config.form.fields.message.placeholder}"
                                        ${config.form.fields.message.required ? 'required' : ''}></textarea>
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
                        powered by
                        <a href="https://automatelly.com" target="_blank" rel="noopener" class="tw-footer-brand">
                            <img src="https://automatelly.com/wp-content/uploads/2025/11/Favicon-648X648.png" alt="">
                            Automatelly
                        </a>
                    </div>` : ''}
                </div>
            `;

            document.body.appendChild(this.container);

            // Cache elements
            this.button = this.container.querySelector('#tw-button');
            this.teaser = this.container.querySelector('#tw-teaser');
            this.teaserClose = this.container.querySelector('#tw-teaser-close');
            this.modal = this.container.querySelector('#tw-modal');
            this.form = this.container.querySelector('#tw-form');
            this.errorEl = this.container.querySelector('#tw-error');
            this.successEl = this.container.querySelector('#tw-success');
            this.submitBtn = this.container.querySelector('#tw-submit');
        }

        attachEvents() {
            // Main button click - opens/closes modal
            this.button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });

            // Teaser click - opens modal
            this.teaser.addEventListener('click', (e) => {
                if (e.target !== this.teaserClose) {
                    this.open();
                }
            });

            // Teaser close button
            this.teaserClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideTeaser();
            });

            // Form submit
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.container.contains(e.target)) {
                    this.close();
                }
            });
        }

        hideTeaser() {
            this.teaserHidden = true;
            this.teaser.classList.add('tw-teaser-hidden');
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

            // Focus first input
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

            // Validate phone
            if (config.form.fields.phone.required && data.phone) {
                const phoneClean = data.phone.replace(/\D/g, '');
                if (phoneClean.length < 10) {
                    this.showError('Please enter a valid phone number.');
                    return;
                }
            }

            // Loading state
            this.submitBtn.classList.add('tw-loading');
            this.submitBtn.disabled = true;
            this.hideError();

            try {
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!response.ok) throw new Error('Request failed');

                // Success
                this.form.classList.add('tw-hidden');
                this.successEl.classList.add('tw-show');
                this.isSubmitted = true;

                // Close after delay
                setTimeout(() => {
                    this.close();
                    setTimeout(() => {
                        this.form.reset();
                        this.form.classList.remove('tw-hidden');
                        this.successEl.classList.remove('tw-show');
                        this.submitBtn.classList.remove('tw-loading');
                        this.submitBtn.disabled = false;
                    }, 400);
                }, 2500);

            } catch (error) {
                console.error('TextWidget error:', error);
                this.showError('Something went wrong. Please try again.');
                this.submitBtn.classList.remove('tw-loading');
                this.submitBtn.disabled = false;
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

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new TextWidget());
    } else {
        new TextWidget();
    }

    window.TextWidget = TextWidget;
})();
