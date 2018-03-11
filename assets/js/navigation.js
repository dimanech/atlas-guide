'use strict';

(function() {
    const navigation = document.getElementById('js-atlas-navigation');
    const navigationLinks = document.querySelectorAll('.js-atlas-nav-ln');
    const body = document.body;
    const isLocalFile = window.location.protocol === 'file:';

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

    function setPage(target, name) {
        const location = window.location;
        document.getElementById('js-atlas-main').setAttribute('src', target);
        document.getElementById('js-page-title').innerText = 'Atlas - ' + name;
        location.hash = target;
    }

    function getPage(target) {
        document.getElementById('js-atlas-main').setAttribute('src', target);
    }

    highlightCurrentPage();

    navigation.addEventListener('click', menuCollapse);

    navigation.addEventListener('click', function(event) {
        const link = event.target;
        const href = link.getAttribute('href');
        if (href === null || link.classList.contains('_category')) {
            return;
        }
        event.preventDefault();
        setPage(href, link.getAttribute('data-name'));
        highlightCurrentPage();
        if (!isLocalFile) {
            body.classList.add('js-loading-frame');
        }
    });

    window.addEventListener('load', function() {
        if (window.location.hash !== '') {
            getPage(window.location.hash.replace(/#/, ''));
        } else {
            getPage('about.html');
        }
    });

    document.addEventListener('frameLoaded', function() {
        body.classList.remove('js-loading-frame');
    });
}());
