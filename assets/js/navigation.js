'use strict';

(function() {
    const navigation = document.getElementById('js-atlas-navigation');
    const navigationLinks = document.querySelectorAll('.js-atlas-nav-ln');

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
        const currentFile = window.location.hash.replace(/#/, '').replace('.html', '');
        const linkCurrent = document.getElementById('nav-' + currentFile);
        if (!linkCurrent) {
            return;
        }
        navigationLinks.forEach(link => link.classList.remove('js-current-page'));
        linkCurrent.classList.add('js-current-page');
    }

    function setPage(target) {
        const location = window.location;
        document.getElementById('js-atlas-main').setAttribute('src', target);
        document.getElementById('js-page-title').innerText = 'Atlas - ' + target;
        location.hash = target;
    }

    function getPage(target) {
        document.getElementById('js-atlas-main').setAttribute('src', target);
    }

    highlightCurrentPage();

    navigation.addEventListener('click', menuCollapse);

    navigation.addEventListener('click', function(event) {
        if (event.target.classList.contains('_category')) {
            return;
        }
        event.preventDefault();
        setPage(event.target.getAttribute('href'));
        highlightCurrentPage();
    });

    window.addEventListener('load', function() {
        getPage(window.location.hash.replace(/#/, ''));
    });
}());
