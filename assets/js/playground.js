'use strict';

(function() {
    function Playground(instance) {
        this.instance = instance;
        this.toggle = this.instance.querySelector('[aria-controls]');
        this.togglecontent = document.getElementById(this.toggle.getAttribute('aria-controls'));
        this.notifier = this.instance.getElementsByClassName('js-playground__notifier')[0];
        this.editor = this.instance.querySelector('[contenteditable]');
        this.example = this.instance.getElementsByClassName('js-playground__example-rubicon')[0];
        this.lastKnownEditableString = '';
        this.toggleOpen = false;
        this.initListeners();
    }

    Playground.prototype.codeShow = function () {
        this.instance.classList.add('js-opened');
        this.toggle.setAttribute('aria-expanded', 'true');
        this.togglecontent.setAttribute('aria-hidden', 'false');
        this.togglecontent.setAttribute('tabindex', '0');
        this.toggleOpen = true;
    };

    Playground.prototype.codeHide = function () {
        this.instance.classList.remove('js-opened');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.togglecontent.setAttribute('aria-hidden', 'true');
        this.togglecontent.setAttribute('tabindex', '-1');
        this.toggleOpen = false;
    };

    Playground.prototype.codeToggle = function () {
        if (this.toggleOpen) {
            this.codeHide();
        } else {
            this.codeShow();
        }
    };

    Playground.prototype.resize = function () {
        window.clearTimeout(this.hideNotifier);
        this.notifier.classList.add('js-show');
        this.notifier.textContent = this.instance.offsetWidth + 'px';
        this.hideNotifier = window.setTimeout(() => {
            this.notifier.classList.remove('js-show');
        }, 1200);
    };

    Playground.prototype.contentEdit = function () {
        const editedStr = this.editor.innerText;
        if (editedStr !== this.lastKnownEditableString) { // simplest throttling
            this.example.innerHTML = editedStr;
            this.lastKnownEditableString = editedStr;
        }
    };

    Playground.prototype.xray = function () {

    };

    Playground.prototype.initListeners = function () {
        this.toggle.addEventListener('click', this.codeToggle.bind(this));
        this.editor.addEventListener('keyup', this.contentEdit.bind(this));
        window.addEventListener('resize', this.resize.bind(this));
    };

    document.querySelectorAll('.js-playground').forEach(node => new Playground(node));
}());
