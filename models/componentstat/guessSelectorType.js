'use strict';

function guessSelectorType(name, componentPrefixRegExp) {
    let type;
    switch (true) {
        // parse prefix
        case /^include/.test(name):
            type = 'mixin';
            break;
        case /^extend/.test(name):
            type = 'extend';
            break;
        case /(^media)|(^supports)|(^if)/.test(name):
            type = 'condition';
            break;
        case /^&\./.test(name):
            type = 'modifier-adjacent';
            break;
        // parse suffixes
        case /([a-z&\d]_[a-z\d-]*$)|(--.*$)/.test(name): // move to config
            type = 'modifier';
            break;
        case /[a-z&\d]__[a-z\d]*$/.test(name):
            type = 'element';
            break;
        case /::.*$/.test(name):
            type = 'element-implicit';
            break;
        case /:.*$/.test(name):
            type = 'modifier-implicit';
            break;
        case /[a-z\d] &/.test(name):
            type = 'modifier-context';
            break;
        // parse prefix again
        case componentPrefixRegExp.test(name):
            // if no prefix defined we should mark first level selectors as component.
            // isRootImmediateChild arg could be used
            type = 'component';
            break;
        default:
            type = 'element';
            break;
    }
    // implement me - orphan element (element from another component or element without root)
    // context modification from another component - this should be warn
    // ".b-promo-box_top .b-promo-box__content" should be modifier
    return type;
}

module.exports = guessSelectorType;
