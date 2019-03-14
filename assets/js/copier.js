'use strict';

(function() {
    function Copier(instance) {
        this.instance = instance;
        this.copyInput = this.instance.querySelector('.js-copier-text');
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
        this.copyInput.select();
        try {
            document.execCommand('copy');
            this.showMessage();
        } catch (e) {
            console.log(e);
        }
    };

    Copier.prototype.initListeners = function() {
        this.instance.addEventListener('click', this.copyText.bind(this));
    };

    document.querySelectorAll('.js-copier').forEach(node => new Copier(node));
})();
