'use strict';
(function () {
    const loader = document.querySelector('.b-atlas-loader');

    if (!loader) {
        return;
    }

    document.addEventListener('DOMContentLoaded', function() {
        loader.classList.add('js-hide');
    });
}());
