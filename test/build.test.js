'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const cwd = process.cwd();

describe('Build', function() {
    const guideDest = 'test/results/';
    let initialConfig = '';

    before(function() {
        initialConfig = fs.readFileSync('.atlasrc.json');
        fs.writeFileSync('.atlasrc.json', `
                {
                    "guideSrc": "test/fixtures/atlas/",
                    "guideDest": "${guideDest}",
                    "cssSrc": "test/fixtures/atlas/css",
                    "copyInternalAssets": false,
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
    });

    after(function() {
        fs.writeFileSync('.atlasrc.json', initialConfig, 'utf8');
        fs.writeFileSync(path.join(cwd, guideDest, '.gitkeep'), '', 'utf8');
    });

    describe('Single component', function() {
        const expectedFile = path.join(cwd, guideDest, 'component.html');

        describe('Existed absolute path', function() {
            before(function(done) {
                const atlas = require(cwd + '/app/atlas-guide');
                atlas.build(path.join(cwd, '/test/fixtures/atlas/_component.scss')).then(() => done()); // eslint-disable-line
            });

            after(function() {
                fs.unlinkSync(expectedFile);
            });

            it('should be written', function() {
                const generatedFile = fs.existsSync(expectedFile);
                assert.strictEqual(generatedFile, true, 'component file exist');
            });

            it('only one file should be written', function() {
                const actualFiles = fs.readdirSync(guideDest);
                assert.deepEqual(actualFiles, ['component.html']);
            });

            it('should be with content', function() {
                const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
                const result = /h1-b-component-test/.test(expectedFileContent);
                assert.strictEqual(result, true, 'component file have expected content');
            });

            it('should have overloaded partials', function() {
                const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
                const head = /project.css/.test(expectedFileContent);
                const footer = /project.js/.test(expectedFileContent);
                assert.strictEqual(footer && head, true, 'component file have overloaded template');
            });
        });

        describe('Existed relative path', function() {
            before(function(done) {
                const atlas = require(cwd + '/app/atlas-guide');
                atlas.build('./test/fixtures/atlas/_component.scss').then(() => done()); // eslint-disable-line
            });

            after(function() {
                fs.unlinkSync(expectedFile);
            });

            it('should be written', function() {
                const generatedFile = fs.existsSync(expectedFile);
                assert.strictEqual(generatedFile, true, 'component file exist');
            });

            it('should be with content', function() {
                const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
                const result = /h1-b-component-test/.test(expectedFileContent);
                assert.strictEqual(result, true, 'component file have expected content');
            });
        });

        describe('Wrong path', function() {
            it('should not trow an error on unexisted file with relative path', function(done) {
                try {
                    const atlas = require(cwd + '/app/atlas-guide');
                    atlas.build('./test/fixtures/atlas_component.scss').then(() => done()); // eslint-disable-line
                } catch (e) {
                    done('failed');
                }
            });
            it('should not trow an error on unexisted file with absolute path', function(done) {
                try {
                    const atlas = require(cwd + '/app/atlas-guide');
                    atlas.build(path.join(cwd, '/test/fixtures/atlas/_some.scss')).then(() => done()); // eslint-disable-line
                } catch (e) {
                    done('failed');
                }
            });
            it('should not trow an error on directory path', function(done) {
                try {
                    const atlas = require(cwd + '/app/atlas-guide');
                    atlas.build('./test/fixtures/atlas/').then(() => done()); // eslint-disable-line
                } catch (e) {
                    done('failed');
                }
            });
        });
    });

    describe('Single guideline', function() {
        const expectedFile = path.join(cwd, guideDest, 'doc-guide.html');

        before(function(done) {
            const atlas = require(cwd + '/app/atlas-guide');
            atlas.build(path.join(cwd, '/test/fixtures/atlas/guide.md')).then(() => done());
        });

        it('only one file should be written', function() {
            const actual = fs.readdirSync(guideDest);
            const expected = ['doc-guide.html'];
            assert.deepEqual(actual, expected);
        });

        it('should be written', function() {
            const generatedFile = fs.existsSync(expectedFile);
            assert.strictEqual(generatedFile, true, 'guide file exist');
        });

        it('should be with content', function() {
            const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
            const result = /h1-title/.test(expectedFileContent);
            assert.strictEqual(result, true, 'guide file have expected content');
        });

        it('should have overloaded template', function() {
            const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
            const result = /overloaded-template/.test(expectedFileContent);
            assert.strictEqual(result, true, 'guide file have overloaded template');
        });

        it('should contain toc', function() {
            const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
            const result = /class="atlas-toc__ln atlas-toc__ln_1"/.test(expectedFileContent);
            assert.strictEqual(result, true, 'contain Table of content');
        });

        it('should have permalinks on titles', function() {
            const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
            const result = /href="#h1-title"/.test(expectedFileContent);
            assert.strictEqual(result, true, 'titles have permalinks');
        });

        after(function() {
            fs.unlinkSync(expectedFile);
        });
    });

    describe('Components pages', function() {
        before(function(done) {
            const atlas = require(cwd + '/app/atlas-guide');
            atlas.build().then(() => done());
        });

        it('should generate all components pages', function() {
            const actualFiles = fs.readdirSync(guideDest);
            const expected = [
                'category-component-no-stat.html',
                'category-component.html',
                'category-doc-guide.html',
                'component-deprecated.html',
                'component.html',
                'doc-guide.html',
                'index.html'
            ];
            assert.deepEqual(actualFiles, expected);
        });
    });

    describe('All', function() {
        before(function(done) {
            const atlas = require(cwd + '/app/atlas-guide');
            atlas.buildAll().then(() => done());
        });

        it('reports should be written', function() { // FIXME: dumb test
            const fileCount = fs.readdirSync(guideDest).length;
            assert.strictEqual(fileCount, 9, 'folder contain needed files count');
        });
        it('should not process excluded files', function() {
            const actual = fs.readdirSync(guideDest);
            const expected = [
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
            assert.deepEqual(actual, expected, 'folder do not contain exclude files');
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
        it('should have deprecated component');
        it('should have internal templates');

        after(function() {
            fs.readdirSync(guideDest).forEach(item => {
                fs.unlinkSync(path.join(cwd, guideDest, item));
            });
        });
    });
});
