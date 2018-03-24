'use strict';

(function () {
    const navigation = document.getElementById('js-atlas-navigation');
    const navigationContent = document.getElementById('js-atlas-aside-content');

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
        linkCurrent.classList.add('js-current-page');

        const storedValue = window.sessionStorage ? window.sessionStorage.getItem('navigationScroll') : null;
        if (storedValue === null) {
            const linkPosition = linkCurrent.getBoundingClientRect().top;
            navigationContent.scrollTo && navigationContent.scrollTo(0, linkPosition - (window.innerHeight / 2));
        }
    }

    function populateStorage() {
        window.sessionStorage.setItem('navigationScroll', navigationContent.scrollTop);
    }

    navigation.addEventListener('click', menuCollapse);

    window.addEventListener('beforeunload', populateStorage);

    highlightCurrentPage();
}());
