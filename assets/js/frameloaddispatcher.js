'use strict';
(function () {
    document.addEventListener('DOMContentLoaded', function() {
        console.log(parent.document)
        return parent.document.dispatchEvent(new Event('frameLoaded'));
    });
}());
