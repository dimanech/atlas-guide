'use strict';

function getFontStat(value) {
    const declList = value
        .replace(/ ,/g, ',')
        .replace(/ \/ ?/g, '/')
        .split(' ');
    const fontFamily = declList.pop(); // mandatory. always last in list
    const fontSize = declList.pop().split('/'); // mandatory. before family. optional list

    return {
        fontSize: fontSize[0],
        fontFamily: fontFamily
    };
}

module.exports = getFontStat;
