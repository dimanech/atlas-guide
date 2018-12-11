'use strict';

function warnConstants(valuesList, constantsList) {
    let notUsed = [];
    let notUsedCount = 0;
    let used = [];
    let couldBeChanged = [];
    let all = 0;

    valuesList.forEach(value => {
        let isConstantAlreadyFound = false;
        all++;

        constantsList.forEach(constant => {
            if (isConstantAlreadyFound) {
                return;
            }
            // push defined and used constant
            // interpolation and operators could be used with variable so we need a regexp for this
            if (new RegExp('\\' + constant.name + '|auto|inherit|initial', 'g').test(value)) {
                used.push(value);
                isConstantAlreadyFound = true;
            }
            // push suggestion that could be changed
            if (value === constant.value) {
                used.push(value);
                isConstantAlreadyFound = true;

                let alreadyExist = false;
                couldBeChanged.forEach(warn => {
                    if (warn.from === value && warn.to === constant.name) {
                        warn.count++;
                        alreadyExist = true;
                    }
                });
                if (!alreadyExist) {
                    couldBeChanged.push({
                        from: value,
                        to: constant.name,
                        count: 1
                    });
                }
            }
            // if (/\$/.test(value)) {// if var used should be warn
            //     defined.push(value);
            //     warn.push({
            //         from: value
            //     });
            //     isConstantFound = true;
            // }
        });
        if (!isConstantAlreadyFound) {
            let alreadyExist = false;

            notUsed.forEach(error => {
                if (error.value === value) {
                    error.count++;
                    notUsedCount++;
                    alreadyExist = true;
                }
            });
            if (!alreadyExist) {
                notUsed.push({
                    value: value,
                    count: 1
                });
                notUsedCount++;
            }
        }
    });

    return {
        'notInConstants': {
            count: notUsedCount,
            values: notUsed
        },
        'allOk': all === used.length,
        'consider': couldBeChanged
    };
}

function getConstantsUsage(name, valuesList, constants) {
    const constantsMap = {
        scale: ['fontSize'],
        font: ['fontFamily'],
        space: ['margin', 'padding'],
        color: ['color', 'backgroundColor'],
        breakpoint: ['mediaQuery'],
        depth: ['boxShadow']
    };
    let constantsList = [];

    Object.keys(constantsMap).forEach(key => {
        constantsMap[key].forEach(prop => {
            if (prop === name) {
                constantsList = constants[key];
            }
        });
    });

    if (constantsList.length > 0 && valuesList.length > 0) {
        return warnConstants(valuesList, constantsList);
    } else {
        return undefined;
    }
}

module.exports = getConstantsUsage;
