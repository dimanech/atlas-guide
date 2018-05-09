'use strict';

const fs = require('fs');
const path = require('path');
const d3fmt = require('d3-format');
const size = require('./utils/fileSize');

// This is approximation. We could not get real scss component size without compilation. Mind the case where component
// will have only includes - the size would be minimal, but after compilation it could be huge.
function prepareComponentsFileSizesStat(guideSrc) {
    let sizes = [];

    function findComponents(url) {
        const dir = fs.readdirSync(url);

        for (let i = 0; i < dir.length; i++) {
            const name = dir[i];
            const target = path.join(url, name);
            const stats = fs.statSync(target);

            if (stats.isFile()) {
                if (path.extname(name) === '.scss') {
                    const fileSize = size.getFileSizeWithoutComments(target);
                    sizes.push({
                        filename: path.basename(name),
                        size: fileSize,
                        view: {
                            size: d3fmt.format('.2s')(fileSize) + 'B'
                        },
                        svg: {
                            radius: '',
                            width: ''
                        }
                    });
                }
            } else if (stats.isDirectory()) {
                findComponents(target);
            }
        }
    }

    findComponents(guideSrc);

    return sizes;
}

module.exports = prepareComponentsFileSizesStat;
