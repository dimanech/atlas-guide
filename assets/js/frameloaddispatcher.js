'use strict';
(function () {
    if (window.location.protocol !== 'file:') {
        document.addEventListener('DOMContentLoaded', function () {
            return parent.document.dispatchEvent(new Event('frameLoaded'));
        });
    }
}());
