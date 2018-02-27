'use strict';

const fs = require('fs');
const path = require('path');

const assetsSrc = path.join(__dirname, '../../assets');
const rootRegExp = new RegExp(path.resolve(__dirname, '../../').replace(/\\/g, '\\\\'));

/**
 * Copy internal assets to specified Atlas destination directory, so they will be available in generated static files.
 * @private
 * @param assetsSrc {string} - path to atlas assets directory
 * @param assetsDest {string} - path to atlas directory in project space
 */
function copyAssetsFiles(assetsSrc, assetsDest) {
    const dir = fs.readdirSync(assetsSrc);

    for (let i = 0; i < dir.length; i++) {
        const name = dir[i];
        const source = path.join(assetsSrc, name);
        const resource = fs.statSync(source);
        const sourceRelative = source.replace(rootRegExp, ''); // assetsRoot

        if (resource.isFile()) {
            if (path.extname(name) === '.map') {
                continue;
            }
            fs.createReadStream(source).pipe(
                fs.createWriteStream(path.join(assetsDest, sourceRelative))
            );
        } else if (resource.isDirectory()) {
            if (name === 'src') {
                continue;
            }
            const directory = path.join(assetsDest, sourceRelative);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory);
            }
            copyAssetsFiles(source, assetsDest);
        }
    }
}

function copyAssets(assetsDest) {
    if (!fs.existsSync(path.join(assetsDest, 'assets'))) {
        fs.mkdirSync(path.join(assetsDest, 'assets'));
    }
    copyAssetsFiles(assetsSrc, assetsDest);
}

module.exports = copyAssets;
