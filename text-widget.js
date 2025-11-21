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
            poweredBy: {
                show: false,
                text: 'Powered by',
                name: '',
                url: ''
            }
        },
        style: {
            primaryColor: '#B85C38',
            secondaryColor: '#B85C38',
            position: 'right',
            buttonText: 'Text us',
            buttonIcon: 'chat'
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

    // Styles
    const styles = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .chat-widget-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            position: fixed;
            bottom: 20px;
            ${config.style.position}: 20px;
            z-index: 999999;
        }

        /* Floating Button */
        .chat-widget-button {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 24px;
            background: ${config.style.primaryColor};
            color: white;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .chat-widget-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
        }

        .chat-widget-button svg {
            width: 22px;
            height: 22px;
            fill: currentColor;
        }

        .chat-widget-button.close-btn {
            padding: 14px;
            border-radius: 50%;
        }

        .chat-widget-button.close-btn svg {
            width: 24px;
            height: 24px;
        }

        /* Tooltip / Teaser */
        .chat-widget-teaser {
            position: absolute;
            bottom: 70px;
            ${config.style.position}: 0;
            background: white;
            border-radius: 16px;
            padding: 20px 24px;
            box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
            min-width: 280px;
            max-width: 320px;
            animation: slideUp 0.3s ease;
        }

        .chat-widget-teaser::after {
            content: '';
            position: absolute;
            bottom: -10px;
            ${config.style.position}: 30px;
            width: 20px;
            height: 20px;
            background: white;
            transform: rotate(45deg);
            box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.05);
        }

        .chat-widget-teaser-content {
            display: flex;
            align-items: center;
            gap: 14px;
            position: relative;
            z-index: 1;
        }

        .chat-widget-teaser-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid ${config.style.primaryColor}20;
            flex-shrink: 0;
        }

        .chat-widget-teaser-text {
            color: #1a1a1a;
            font-size: 17px;
            font-weight: 500;
            line-height: 1.4;
        }

        .chat-widget-teaser-close {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            border: none;
            background: #f0f0f0;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            transition: background 0.2s;
        }

        .chat-widget-teaser-close:hover {
            background: #e0e0e0;
        }

        .chat-widget-teaser-close svg {
            width: 14px;
            height: 14px;
        }

        /* Modal */
        .chat-widget-modal {
            position: fixed;
            bottom: 100px;
            ${config.style.position}: 20px;
            width: 380px;
            max-width: calc(100vw - 40px);
            max-height: calc(100vh - 140px);
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            animation: slideUp 0.3s ease;
            display: flex;
            flex-direction: column;
        }

        @media (max-width: 480px) {
            .chat-widget-modal {
                bottom: 0;
                ${config.style.position}: 0;
                width: 100%;
                max-width: 100%;
                max-height: 90vh;
                border-radius: 16px 16px 0 0;
            }
        }

        /* Modal Header */
        .chat-widget-header {
            background: ${config.style.primaryColor};
            color: white;
            padding: 24px 20px;
            text-align: center;
        }

        .chat-widget-header-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 0;
        }

        .chat-widget-header-title svg {
            width: 24px;
            height: 24px;
            opacity: 0.9;
        }

        /* Sub Header Bubble */
        .chat-widget-subheader {
            padding: 16px 20px 0;
        }

        .chat-widget-subheader-bubble {
            background: #E8F4FC;
            border-radius: 16px;
            padding: 16px 20px;
            color: #1a1a1a;
            font-size: 15px;
            line-height: 1.5;
        }

        /* Form Section */
        .chat-widget-form-container {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        }

        .chat-widget-form-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
        }

        .chat-widget-form-group {
            margin-bottom: 20px;
        }

        .chat-widget-form-group:last-child {
            margin-bottom: 0;
        }

        .chat-widget-label {
            display: block;
            color: ${config.style.primaryColor};
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 6px;
        }

        .chat-widget-input,
        .chat-widget-textarea {
            width: 100%;
            padding: 12px 0;
            border: none;
            border-bottom: 2px solid #e0e0e0;
            font-size: 16px;
            color: #1a1a1a;
            background: transparent;
            transition: border-color 0.2s;
            outline: none;
        }

        .chat-widget-input:focus,
        .chat-widget-textarea:focus {
            border-bottom-color: ${config.style.primaryColor};
        }

        .chat-widget-input::placeholder,
        .chat-widget-textarea::placeholder {
            color: #999;
        }

        .chat-widget-textarea {
            resize: none;
            min-height: 60px;
            font-family: inherit;
        }

        /* Consent Text */
        .chat-widget-consent {
            padding: 0 20px 16px;
            font-size: 12px;
            color: #666;
            line-height: 1.6;
        }

        .chat-widget-consent a {
            color: #1a1a1a;
            text-decoration: underline;
        }

        /* Submit Button */
        .chat-widget-submit-container {
            padding: 0 20px 20px;
            text-align: center;
        }

        .chat-widget-submit {
            background: ${config.style.primaryColor}40;
            color: ${config.style.primaryColor};
            border: none;
            padding: 14px 48px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, transform 0.2s;
        }

        .chat-widget-submit:hover:not(:disabled) {
            background: ${config.style.primaryColor}60;
            transform: translateY(-1px);
        }

        .chat-widget-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .chat-widget-submit.loading {
            position: relative;
            color: transparent;
        }

        .chat-widget-submit.loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid ${config.style.primaryColor};
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        /* Powered By Footer */
        .chat-widget-footer {
            padding: 12px 20px;
            text-align: center;
            border-top: 1px solid #f0f0f0;
            font-size: 13px;
            color: #666;
        }

        .chat-widget-footer a {
            color: #1a1a1a;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .chat-widget-footer a:hover {
            text-decoration: underline;
        }

        /* Success State */
        .chat-widget-success {
            padding: 60px 20px;
            text-align: center;
        }

        .chat-widget-success-icon {
            width: 80px;
            height: 80px;
            background: ${config.style.primaryColor}20;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }

        .chat-widget-success-icon svg {
            width: 40px;
            height: 40px;
            color: ${config.style.primaryColor};
        }

        .chat-widget-success-text {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
        }

        .chat-widget-success-subtext {
            font-size: 14px;
            color: #666;
        }

        /* Error State */
        .chat-widget-error {
            background: #FEE2E2;
            color: #DC2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
        }

        /* Animations */
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Hidden class */
        .chat-widget-hidden {
            display: none !important;
        }
    `;

    // Icons
    const icons = {
        chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
        chatFilled: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`,
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        message: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`
    };

    // Create Widget Class
    class TextWidget {
        constructor() {
            this.isOpen = false;
            this.isSubmitted = false;
            this.teaserDismissed = false;
            this.init();
        }

        init() {
            this.createStyles();
            this.createWidget();
            this.attachEventListeners();
            
            // Show teaser after delay if avatar is set
            if (config.branding.avatar) {
                setTimeout(() => {
                    if (!this.isOpen && !this.teaserDismissed) {
                        this.showTeaser();
                    }
                }, 2000);
            }
        }

        createStyles() {
            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        createWidget() {
            // Main container
            this.container = document.createElement('div');
            this.container.className = 'chat-widget-container';
            this.container.id = 'chat-widget-container';

            // Teaser bubble
            this.teaser = this.createTeaser();
            this.container.appendChild(this.teaser);

            // Floating button
            this.button = this.createButton();
            this.container.appendChild(this.button);

            // Modal
            this.modal = this.createModal();
            this.container.appendChild(this.modal);

            document.body.appendChild(this.container);
        }

        createTeaser() {
            const teaser = document.createElement('div');
            teaser.className = 'chat-widget-teaser chat-widget-hidden';
            teaser.innerHTML = `
                <button class="chat-widget-teaser-close" aria-label="Close">
                    ${icons.close}
                </button>
                <div class="chat-widget-teaser-content">
                    ${config.branding.avatar ? `<img src="${config.branding.avatar}" alt="" class="chat-widget-teaser-avatar">` : ''}
                    <div class="chat-widget-teaser-text">${config.branding.welcomeText}</div>
                </div>
            `;
            return teaser;
        }

        createButton() {
            const button = document.createElement('button');
            button.className = 'chat-widget-button';
            button.setAttribute('aria-label', 'Open chat');
            button.innerHTML = `
                ${icons.chat}
                <span>${config.style.buttonText}</span>
            `;
            return button;
        }

        createModal() {
            const modal = document.createElement('div');
            modal.className = 'chat-widget-modal chat-widget-hidden';
            modal.innerHTML = `
                <div class="chat-widget-header">
                    <div class="chat-widget-header-title">
                        ${icons.chatFilled}
                        <span>${config.branding.headerText}</span>
                    </div>
                </div>
                
                <div class="chat-widget-subheader">
                    <div class="chat-widget-subheader-bubble">
                        ${config.branding.subHeaderText}
                    </div>
                </div>

                <form class="chat-widget-form" id="chat-widget-form">
                    <div class="chat-widget-form-container">
                        <div class="chat-widget-form-card">
                            <div class="chat-widget-error chat-widget-hidden" id="chat-widget-error"></div>
                            
                            ${config.form.fields.name.show ? `
                            <div class="chat-widget-form-group">
                                <label class="chat-widget-label" for="chat-widget-name">${config.form.fields.name.label}</label>
                                <input 
                                    type="text" 
                                    class="chat-widget-input" 
                                    id="chat-widget-name" 
                                    name="name"
                                    placeholder="${config.form.fields.name.placeholder}"
                                    ${config.form.fields.name.required ? 'required' : ''}
                                >
                            </div>
                            ` : ''}

                            ${config.form.fields.phone.show ? `
                            <div class="chat-widget-form-group">
                                <label class="chat-widget-label" for="chat-widget-phone">${config.form.fields.phone.label}</label>
                                <input 
                                    type="tel" 
                                    class="chat-widget-input" 
                                    id="chat-widget-phone" 
                                    name="phone"
                                    placeholder="${config.form.fields.phone.placeholder}"
                                    ${config.form.fields.phone.required ? 'required' : ''}
                                >
                            </div>
                            ` : ''}

                            ${config.form.fields.email.show ? `
                            <div class="chat-widget-form-group">
                                <label class="chat-widget-label" for="chat-widget-email">${config.form.fields.email.label}</label>
                                <input 
                                    type="email" 
                                    class="chat-widget-input" 
                                    id="chat-widget-email" 
                                    name="email"
                                    placeholder="${config.form.fields.email.placeholder}"
                                    ${config.form.fields.email.required ? 'required' : ''}
                                >
                            </div>
                            ` : ''}

                            ${config.form.fields.message.show ? `
                            <div class="chat-widget-form-group">
                                <label class="chat-widget-label" for="chat-widget-message">${config.form.fields.message.label}</label>
                                <textarea 
                                    class="chat-widget-textarea" 
                                    id="chat-widget-message" 
                                    name="message"
                                    placeholder="${config.form.fields.message.placeholder}"
                                    rows="2"
                                    ${config.form.fields.message.required ? 'required' : ''}
                                ></textarea>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="chat-widget-consent">
                        ${config.branding.consentText}
                        ${config.branding.termsUrl ? ` <a href="${config.branding.termsUrl}" target="_blank" rel="noopener">See terms</a>.` : ''}
                    </div>

                    <div class="chat-widget-submit-container">
                        <button type="submit" class="chat-widget-submit" id="chat-widget-submit">
                            ${config.form.submitText}
                        </button>
                    </div>
                </form>

                <div class="chat-widget-success chat-widget-hidden" id="chat-widget-success">
                    <div class="chat-widget-success-icon">
                        ${icons.check}
                    </div>
                    <div class="chat-widget-success-text">${config.form.successMessage}</div>
                    <div class="chat-widget-success-subtext">We'll be in touch soon.</div>
                </div>

                ${config.branding.poweredBy.show ? `
                <div class="chat-widget-footer">
                    <a href="${config.branding.poweredBy.url}" target="_blank" rel="noopener">
                        ${config.branding.poweredBy.text} <strong>${config.branding.poweredBy.name}</strong>
                    </a>
                </div>
                ` : ''}
            `;
            return modal;
        }

        attachEventListeners() {
            // Main button click
            this.button.addEventListener('click', () => this.toggle());

            // Teaser click opens modal
            this.teaser.querySelector('.chat-widget-teaser-content').addEventListener('click', () => {
                this.hideTeaser();
                this.open();
            });

            // Teaser close button
            this.teaser.querySelector('.chat-widget-teaser-close').addEventListener('click', (e) => {
                e.stopPropagation();
                this.dismissTeaser();
            });

            // Form submission
            const form = this.modal.querySelector('#chat-widget-form');
            form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            // Close on click outside
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.container.contains(e.target)) {
                    this.close();
                }
            });
        }

        showTeaser() {
            this.teaser.classList.remove('chat-widget-hidden');
        }

        hideTeaser() {
            this.teaser.classList.add('chat-widget-hidden');
        }

        dismissTeaser() {
            this.hideTeaser();
            this.teaserDismissed = true;
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
            this.modal.classList.remove('chat-widget-hidden');
            this.button.innerHTML = icons.close;
            this.button.classList.add('close-btn');
            this.button.querySelector('span')?.remove();
            
            // Focus first input
            setTimeout(() => {
                const firstInput = this.modal.querySelector('input, textarea');
                if (firstInput) firstInput.focus();
            }, 100);
        }

        close() {
            this.isOpen = false;
            this.modal.classList.add('chat-widget-hidden');
            this.button.classList.remove('close-btn');
            this.button.innerHTML = `
                ${icons.chat}
                <span>${config.style.buttonText}</span>
            `;
        }

        async handleSubmit(e) {
            e.preventDefault();
            
            const form = e.target;
            const submitBtn = form.querySelector('#chat-widget-submit');
            const errorDiv = form.querySelector('#chat-widget-error');
            const successDiv = this.modal.querySelector('#chat-widget-success');
            
            // Get form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name') || '',
                phone: formData.get('phone') || '',
                email: formData.get('email') || '',
                message: formData.get('message') || '',
                route: config.webhook.route,
                source: window.location.href,
                timestamp: new Date().toISOString(),
                branding: {
                    name: config.branding.name
                }
            };

            // Validate phone
            if (config.form.fields.phone.required && data.phone) {
                const phoneClean = data.phone.replace(/\D/g, '');
                if (phoneClean.length < 10) {
                    errorDiv.textContent = 'Please enter a valid phone number.';
                    errorDiv.classList.remove('chat-widget-hidden');
                    return;
                }
            }

            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            errorDiv.classList.add('chat-widget-hidden');

            try {
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Show success
                form.classList.add('chat-widget-hidden');
                successDiv.classList.remove('chat-widget-hidden');
                this.isSubmitted = true;

                // Close after delay
                setTimeout(() => {
                    this.close();
                    // Reset form for next time
                    setTimeout(() => {
                        form.reset();
                        form.classList.remove('chat-widget-hidden');
                        successDiv.classList.add('chat-widget-hidden');
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    }, 500);
                }, 3000);

            } catch (error) {
                console.error('Chat widget submission error:', error);
                errorDiv.textContent = 'Something went wrong. Please try again.';
                errorDiv.classList.remove('chat-widget-hidden');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        }
    }

    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new TextWidget());
    } else {
        new TextWidget();
    }

    // Expose to window for external control
    window.TextWidget = TextWidget;
})();
