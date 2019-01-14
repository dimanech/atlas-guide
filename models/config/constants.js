'use strict';

const fs = require('fs');
const path = require('path');
const projectRoot = process.cwd();
const printMessage = require('../utils/printmessage');

function getDeclaredConstants(config) {
    const constantsList = [
        'colorPrefix',
        'fontPrefix',
        'scalePrefix',
        'spacePrefix',
        'motionPrefix',
        'depthPrefix',
        'breakpointPrefix'
    ];
    let projectConstants = {
        'isDefined': false,
        'constantsList': []
    };

    if (config.projectConstants !== undefined && config.projectConstants.constantsSrc !== undefined) {
        const constantsSrc = path.join(projectRoot, config.projectConstants.constantsSrc);
        // check if constantsSrc exist
        if (fs.existsSync(constantsSrc)) {
            projectConstants.isDefined = true;
            projectConstants.constantsSrc = constantsSrc;
            projectConstants.constantsFile = fs.readFileSync(constantsSrc, 'utf8');
        } else {
            printMessage('warn', '"projectConstants" is declared, but constants file not found (' + constantsSrc +
                '). Constants could not be fetched.');
        }
    } else {
        return projectConstants;
    }

    constantsList.forEach(constant => {
        const internalConstantName = constant.replace(/Prefix/g, ''); // remove "Prefix" from "colorPrefix" string
        const declaredConstantName = config.projectConstants[constant];

        return projectConstants.constantsList.push({
            'name': internalConstantName,
            'regex': new RegExp(declaredConstantName !== undefined ? '(\\$|--)' + declaredConstantName : '.^')
        });
    });

    return projectConstants;
}

module.exports = getDeclaredConstants;
