'use strict';
(function () {
    const loader = document.querySelector('.b-loader');

    if (!loader) {
        return;
    }

    document.addEventListener('DOMContentLoaded', function() {
        loader.classList.add('js-hide');
    });
}());
