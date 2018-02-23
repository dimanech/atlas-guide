'use strict';

(function() {
    const container = document.getElementById('js-guide-container');
    const main = document.getElementsByClassName('l-atlas-container__main')[0];
    const aside = document.getElementsByClassName('l-atlas-container__aside')[0];
    const control = document.getElementById('js-aside-toggle');
    const resizeEvent = new Event('resizeAside');

    function resizeTo(width) {
        aside.style.width = width + 'px';
        main.style.marginLeft = width + 'px';
        document.dispatchEvent(resizeEvent);
    }

    function changeSize(event) {
        if (event.pageX < 200) {
            return;
        }
        if (container.classList.contains('js-aside-panel-hidden')) {
            container.classList.remove('js-aside-panel-hidden');
        }
        resizeTo(event.pageX);
    }

    function asideToggle(event) {
        event.preventDefault();

        if (container.classList.contains('js-aside-panel-hidden')) {
            container.classList.remove('js-aside-panel-hidden');
            resizeTo(270);
        } else {
            container.classList.add('js-aside-panel-hidden');
            resizeTo(0);
        }
    }

    document.addEventListener('mousedown', function(event) {
        if (event.target === control) {
            document.addEventListener('mousemove', changeSize);
        }
    });
    document.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove', changeSize);
    });
    control.addEventListener('dblclick', asideToggle);
}());
