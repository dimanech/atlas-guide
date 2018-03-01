'use strict';

(function() {
    const navigation = document.querySelector('.b-atlas-nav');

    function menuCollapse(ev) {
        if (!ev.target.classList.contains('b-atlas-nav__ln_category')) {
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
        const location = window.location.href;
        const currentFile = location.split('/').pop().replace('.html', '');
        const linkCurrent = document.getElementById('nav-' + currentFile);
        if (!linkCurrent) {
            return;
        }
        const linkPosition = linkCurrent.getBoundingClientRect().top;

        linkCurrent.classList.add('js-current-page');
        document.querySelector('.b-atlas-aside__content').scrollTo(0, linkPosition - (window.innerHeight / 2));
    }

    navigation.addEventListener('click', menuCollapse);

    highlightCurrentPage();
}());
