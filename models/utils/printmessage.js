'use strict';

function printMessage(type, message) {
    const colorizeYellow = str => '\x1b[33m' + str + '\x1b[0m';
    const colorizeRed = str => '\x1b[31m' + str + '\x1b[0m';

    switch (type) {
        case 'error': {
            console.error(colorizeRed('Error: ') + 'Atlas: ' + message);
            break;
        }
        case 'warn': {
            console.warn(colorizeYellow('Warn: ') + 'Atlas: ' + message);
            break;
        }
        default: {
            console.log('Atlas: ' + message);
        }
    }
}

module.exports = printMessage;
