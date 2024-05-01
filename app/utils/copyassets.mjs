import fs from 'node:fs';
import path from 'node:path';
const excludedDir = 'src';

// Helper function to test if the path is an excluded directory
function isExcludedDirectory(name) {
    return name === excludedDir;
}

// Helper function to write file
function writeFile(target, source) {
    try {
        fs.writeFileSync(target, fs.readFileSync(source));
    } catch (e) {
        console.error(e);
    }
}

// Helper function to create directory
function createDirectory(directory) {
    if (!fs.existsSync(directory)) {
        try {
            fs.mkdirSync(directory);
        } catch (e) {
            console.error(e);
        }
    }
}

// Copy assets function
function copyAssetsFiles(assetsRoot, assetsSrc, assetsDest) {
    const dir = fs.readdirSync(assetsSrc);
    dir.forEach(item => {
        const source = path.join(assetsSrc, item);
        const resource = fs.statSync(source);
        const assetRelSrc = path.relative(assetsRoot, source);

        if (resource.isFile()) {
            if (path.extname(item) === '.map' || /^\./.test(item)) {
                return;
            }
            const target = path.join(assetsDest, assetRelSrc);
            writeFile(target, source);
        }

        if (resource.isDirectory() && !isExcludedDirectory(item)) {
            const directory = path.join(assetsDest, assetRelSrc);
            createDirectory(directory);
            copyAssetsFiles(assetsRoot, source, assetsDest);
        }
    });
}

export default function copyAssets(assetsSrc, assetsDest) {
    const dest = path.join(assetsDest, 'assets');
    createDirectory(dest);
    copyAssetsFiles(assetsSrc, assetsSrc, dest);
}
