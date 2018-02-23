'use strict';

(function() {
    const navigation = document.querySelector('.b-docs-nav');

    function menuCollapse(ev) {
        if (!ev.target.classList.contains('b-docs-nav__ln_category')) {
            return;
        }
        ev.preventDefault();

        if (ev.target.classList.contains('js-collapsed')) {
            ev.target.classList.remove('js-collapsed');
        } else {
            ev.target.classList.add('js-collapsed');
        }
    }

    function highlightCurrentPage() {
        const location = window.location.pathname;
        if (!location) {
            return;
        }
        const currentFile = location.replace('.html', '').replace('/', '');
        const linkCurrent = document.getElementById('nav-' + currentFile);
        if (!linkCurrent) {
            return;
        }
        const linkPosition = linkCurrent.getBoundingClientRect().top;

        linkCurrent.classList.add('js-current-page');
        document.querySelector('.b-docs-aside__content').scrollTo(0, linkPosition - (window.innerHeight / 2));
    }

    navigation.addEventListener('click', menuCollapse);

    highlightCurrentPage();
}());
