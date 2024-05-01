import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
const cwd = process.cwd();

import atlasGuideWithConfig from '../app/atlas-guide.mjs';

describe('All', function() {
    const guideDest = 'test/results/';
    let initialConfig = '';

    before(function(done) {
        initialConfig = fs.readFileSync('.atlasrc.json');
        fs.writeFileSync('.atlasrc.json', `
            {
                "guideSrc": "test/fixtures/atlas/",
                "guideDest": "${guideDest}",
                "cssSrc": "test/fixtures/atlas/css",
                "copyInternalAssets": "true",
                "excludedSassFiles": "^excluded",
                "excludedCssFiles": "^excluded",
                "partials": {
                  "assetsfooter": "test/fixtures/includes/assetsfooter.mustache",
                  "assetshead": "test/fixtures/includes/assetshead.mustache"
                },
                "templates": {
                    "guide": "test/fixtures/templates/guide.mustache"
                }
            }
        `, 'utf8');
        fs.unlinkSync(path.join(cwd, guideDest, '.gitkeep'));

        const atlas = atlasGuideWithConfig('./.atlasrc.json');
        atlas.buildAll().then(() => done());
    });
    after(function() {
        const deleteFolderRecursive = url => {
            if (fs.existsSync(url)) {
                fs.readdirSync(url).forEach(file => {
                    const curPath = path.join(url, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                        deleteFolderRecursive(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(url);
            }
        };
        deleteFolderRecursive(guideDest);
        fs.writeFileSync('.atlasrc.json', initialConfig, 'utf8');
        fs.mkdirSync(guideDest);
        fs.writeFileSync(path.join(cwd, guideDest, '.gitkeep'), '', 'utf8');
    });

    it('reports should be written', function() {
        const actual = fs.readdirSync(guideDest);
        const isHaveReports = !!(actual.includes('bundle.html') && actual.includes('insights.html'));
        assert.strictEqual(isHaveReports, true, 'folder contain needed files count');
    });
    it('assets should be copied', function() {
        const assets = fs.existsSync(path.join(guideDest, 'assets'));
        const assetsCSS = fs.existsSync(path.join(guideDest, 'assets', 'css'));
        const assetsJS = fs.existsSync(path.join(guideDest, 'assets', 'js'));
        assert.strictEqual((assets && assetsCSS && assetsJS), true, 'assets copied');
    });
    it('should not process excluded files', function() {
        const actual = fs.readdirSync(guideDest);
        const expected = [
            'assets',
            'bundle.html',
            'category-component-no-stat.html',
            'category-component.html',
            'category-doc-guide.html',
            'component-deprecated.html',
            'component.html',
            'doc-guide.html',
            'index.html',
            'insights.html'
        ];
        assert.deepStrictEqual(actual, expected, 'folder do not contain exclude files');
    });
    it('should process all files when no exclusion is declared');
    it('insights should be with data', function() {
        const fileContent = fs.readFileSync(guideDest + 'insights.html', 'utf8');
        const isContain =
            /data-chart='\[{"name":"stat-test.css","raw":7500,"zipped":5238,"view":{"raw":"7KB","zipped":/
                .test(fileContent);
        assert.strictEqual(isContain, true, 'contain right data');
    });
    it('insights should be with specificity chart', function() {
        const fileContent = fs.readFileSync(guideDest + 'insights.html', 'utf8');
        const isContain =
            /"data":10},{"selector":".class","data":10},{"selector":".class__item-empty:hover",/
                .test(fileContent);
        assert.strictEqual(isContain, true, 'contain right data');
    });
    it('insights should be with basic global stat', function() {
        const fileContent = fs.readFileSync(guideDest + 'insights.html', 'utf8');
        const isContain = /<p class="atlas-stat-digit__data">10</
            .test(fileContent);
        assert.strictEqual(isContain, true, 'contain right data');
    });
    it('insights should be with individual and global stat', function() {
        const fileContent = fs.readFileSync(guideDest + 'insights.html', 'utf8');
        const individualStat = /style.css/.test(fileContent);
        const projectContaminatedStat = /atlas-guide/.test(fileContent);
        assert.strictEqual(individualStat && projectContaminatedStat, true, 'contain right data');
    });
    it('bundle should be with imports graph', function() {
        const fileContent = fs.readFileSync(guideDest + 'bundle.html', 'utf8');
        const isContain =
            /window.bundleTree ={"atlas-guide":{"id":"atlas-guide","size":0},"atlas-guide/
                .test(fileContent);
        assert.strictEqual(isContain, true, 'contain right data');
    });
    it('bundle should be with cross deps graph', function() {
        const fileContent = fs.readFileSync(guideDest + 'bundle.html', 'utf8');
        const isContain =
            /window.importsData ={"nodes":\[{"id":"_component-deprecated","depth":0,"mass":0},{"id":"_component/
                .test(fileContent);
        assert.strictEqual(isContain, true, 'contain right data');
    });
    it('bundle should be with sizes chart', function() {
        const fileContent = fs.readFileSync(guideDest + 'bundle.html', 'utf8');
        const isContain1 = /<div class="atlas-stat-size-file__size">70B<\/div>/.test(fileContent);
        const isContain2 = /<div class="atlas-stat-size-file__size">200B<\/div>/.test(fileContent);
        assert.strictEqual(isContain1 && isContain2, true, 'contain right data');
    });
    it('should have subcategories files', function() {
        const guide = fs.existsSync(path.join(guideDest, 'category-doc-guide.html'));
        const component = fs.existsSync(path.join(guideDest, 'category-component.html'));
        assert.strictEqual(guide && component, true, 'subcategory guide and component files exist');
    });
    it('index should contain another components in navigation', function() {
        const index = fs.readFileSync(path.join(guideDest, 'index.html'));
        const categoryLink =
            /class="atlas-nav__ln _guide {2}js-atlas-nav-ln" href="category-doc-guide.html"/
                .test(index);
        const rootLink = /class="atlas-nav__ln _guide {2}js-atlas-nav-ln" href="doc-guide.html"/.test(index);
        assert.strictEqual(categoryLink && rootLink, true,
            'component contain another components in navigation');
    });
    it('should contain copy and version');
    it('should have deprecated component');
    it('should have internal templates');
    it('should not throw an error if no config is declared', function(done) {
        const atlasGuide = atlasGuideWithConfig('./.inexistentatlasrc.json');
        try {
            atlasGuide.buildAll().then(() => done());
        } catch (e) {
            done('failed');
        }
    });
});
