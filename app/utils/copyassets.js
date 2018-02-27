'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Copy internal assets to specified Atlas destination directory, so they will be available in generated static files.
 * @private
 * @param assetsRoot {string} - abs path to internal assets directory
 * @param assetsSrc {string} - abs path to processed internal assets directory
 * @param assetsDest {string} - abs path to atlas directory in project space
 */
function copyAssetsFiles(assetsRoot, assetsSrc, assetsDest) {
    const dir = fs.readdirSync(assetsSrc);

    dir.forEach(item => {
        const name = item;
        const source = path.join(assetsSrc, name);
        const resource = fs.statSync(source);
        const assetRelSrc = path.relative(assetsRoot, source);

        if (resource.isFile()) {
            if (path.extname(name) === '.map' || /^\./.test(name)) {
                return;
            }
            fs.createReadStream(source).pipe(
                fs.createWriteStream(path.join(assetsDest, assetRelSrc))
            );
        }
        if (resource.isDirectory()) {
            if (name === 'src') {
                return;
            }
            const directory = path.join(assetsDest, assetRelSrc);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory);
            }
            copyAssetsFiles(assetsRoot, source, assetsDest);
        }
    });
}

function copyAssets(assetsSrc, assetsDest) {
    const dest = path.join(assetsDest, 'assets');
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }
    copyAssetsFiles(assetsSrc, assetsSrc, dest);
}

module.exports = copyAssets;
