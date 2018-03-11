'use strict';

(function () {
    const navigation = document.getElementById('js-atlas-navigation');

    function menuCollapse(ev) {
        if (!ev.target.classList.contains('_category')) {
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
        document.getElementById('js-atlas-aside-content').scrollTo(0, linkPosition - (window.innerHeight / 2));
    }

    navigation.addEventListener('click', menuCollapse);

    highlightCurrentPage();
}());
