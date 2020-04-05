'use strict';

(function() {
    function Copier(instance) {
        this.instance = instance;
        this.copyInput = this.instance.querySelector('.js-copier-text');
        this.copyButton = this.instance.querySelector('.js-copier-button') || this.instance;
        this.initListeners();
    }

    Copier.prototype.showMessage = function() {
        const message = 'Copied!';
        let messageBlock = document.createElement('div');
        messageBlock.setAttribute('class', 'atlas-copier__message');
        messageBlock.appendChild(document.createTextNode(message));
        this.instance.appendChild(messageBlock);
        setTimeout(function() {
            messageBlock.parentNode.removeChild(messageBlock);
        }, 400);
    };

    Copier.prototype.copyText = function() {
        let syntheticInput;
        if (this.copyInput.nodeName !== 'INPUT' && this.copyInput.nodeName !== 'TEXTAREA') {
            syntheticInput = this.createSyntheticInput();
        }
        syntheticInput ? syntheticInput.select() : this.copyInput.select();
        try {
            document.execCommand('copy');
            this.showMessage();
        } catch (e) {
            console.log(e);
        }
        if (syntheticInput) {
            syntheticInput.remove();
        }
    };

    Copier.prototype.createSyntheticInput = function() {
        const textarea = document.createElement('textarea');
        textarea.value = this.copyInput.textContent;
        this.instance.appendChild(textarea);

        return textarea;
    };

    Copier.prototype.initListeners = function() {
        this.copyButton.addEventListener('click', this.copyText.bind(this));
    };

    document.querySelectorAll('.js-copier').forEach(node => new Copier(node));
})();
