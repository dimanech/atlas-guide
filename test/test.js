'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const cwd = process.cwd();

describe('Atlas', function() {
    let initialConfig = '';
    before(function() {
        return initialConfig = fs.readFileSync('.atlasrc.json');
    });
    after(function() {
        fs.writeFileSync('.atlasrc.json', initialConfig, 'utf8');
    });

    describe('Build', function() {
        const guideDest = 'test/results/';

        before(function() {
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

        describe('Single component', function() {
            const expectedFile = path.join(cwd, guideDest, 'component.html');

            before(function(done) {
                const atlas = require(cwd + '/app/atlas-guide');
                atlas.build(path.join(cwd, '/test/fixtures/atlas/_component.scss')).then(() => done());
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

            it('should have overloaded partials', function() {
                const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
                const head = /project.css/.test(expectedFileContent);
                const footer = /project.js/.test(expectedFileContent);
                assert.strictEqual(footer && head, true, 'component file have overloaded template');
            });

            it('should process all files when no exclusion is declared');
            it('should contain imports');
            it('should contain variables');
            it('should contain imported by');
            it('should contain component structure');

            after(function() {
                fs.unlinkSync(expectedFile);
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
                assert.deepEqual(actual, expected, 'folder contain other files');
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

        describe('All', function() {
            before(function(done) {
                const atlas = require(cwd + '/app/atlas-guide');
                atlas.buildAll().then(() => done());
            });

            it('reports should be written', function() {
                const fileCount = fs.readdirSync(guideDest).length;
                assert.strictEqual(fileCount, 7, 'folder contain needed files count');
            });
            it('should not process excluded files', function() {
                const actual = fs.readdirSync(guideDest);
                const expected = [
                    'bundle.html',
                    'category-component.html',
                    'category-doc-guide.html',
                    'component.html',
                    'doc-guide.html',
                    'index.html',
                    'insights.html'
                ];
                assert.deepEqual(actual, expected, 'folder do not contain exclude files');
            });
            it('insights should be with data', function() {
                const fileContent = fs.readFileSync(guideDest + 'insights.html', 'utf8');
                const isContain =
                    /data-chart='\[{"name":"style.css","raw":388,"zipped":263,"view":{"raw":"388B","zipped":"263B"}}]'/
                        .test(fileContent);
                assert.strictEqual(isContain, true, 'contain right data');
            });
            it('insights should be with specificity chart', function() {
                const fileContent = fs.readFileSync(guideDest + 'insights.html', 'utf8');
                const isContain =
                    /"specificity":10},{"selector":".class","specificity":10},{"selector":".class__item-empty:hover",/
                        .test(fileContent);
                assert.strictEqual(isContain, true, 'contain right data');
            });
            it('insights should be with basic global stat', function() {
                const fileContent = fs.readFileSync(guideDest + 'insights.html', 'utf8');
                const isContain = /<p class="atlas-stat-digit__data">10</
                    .test(fileContent);
                assert.strictEqual(isContain, true, 'contain right data');
            });
            it('insights should be individual and global stat', function() {
                const fileContent = fs.readFileSync(guideDest + 'insights.html', 'utf8');
                const individualStat = /style.css/.test(fileContent);
                const projectContaminatedStat = /atlas-guide/.test(fileContent);
                assert.strictEqual(individualStat && projectContaminatedStat, true, 'contain right data');
            });
            it('bundle should be with imports', function() {
                const fileContent = fs.readFileSync(guideDest + 'bundle.html', 'utf8');
                const isContain = /"id":"css\/style.css","depth":1,"mass":0},{"id":"style","depth":1,"mass":2}/
                    .test(fileContent);
                assert.strictEqual(isContain, true, 'contain right data');
            });
            it('bundle should be with sizes chart', function() {
                const fileContent = fs.readFileSync(guideDest + 'bundle.html', 'utf8');
                const isContain = /<p class="atlas-stat-size-file__size">70B<\/p>/
                    .test(fileContent);
                assert.strictEqual(isContain, true, 'contain right data');
            });
            it('should have subcategories files', function() {
                const guide = fs.existsSync(path.join(guideDest, 'category-doc-guide.html'));
                const component = fs.existsSync(path.join(guideDest, 'category-component.html'));
                assert.strictEqual(guide && component, true, 'subcategory guide and component files exist');
            });
            it('index should contain another components in navigation', function() {
                const index = fs.readFileSync(path.join(guideDest, 'index.html'));
                const categoryLink =
                    /class="atlas-nav__ln _guide js-atlas-nav-ln" href="category-doc-guide.html"/
                        .test(index);
                const rootLink = /class="atlas-nav__ln _guide js-atlas-nav-ln" href="doc-guide.html"/.test(index);
                assert.strictEqual(categoryLink && rootLink, true,
                    'component contain another components in navigation');
            });
            it('should have internal templates');

            after(function() {
                fs.readdirSync(guideDest).forEach(item => {
                    fs.unlinkSync(path.join(cwd, guideDest, item));
                });
            });
        });

        after(function() {
            fs.unlinkSync('.atlasrc.json');
            fs.writeFileSync(path.join(cwd, guideDest, '.gitkeep'), '', 'utf8');
        });
    });

    describe('Config', function() {
        const config = require(cwd + '/models/atlasconfig.js');

        context('when config not defined', function() {
            it('should fall if config is not defined in package.json', function() {
                const atlasConfig = config.getBase();
                assert.strictEqual(atlasConfig.isCorrupted, true, 'atlasConfig undefined');
            });
            it('should fall if config is not defined in project root', function() {
                const atlasConfig = config.getBase();
                assert.strictEqual(atlasConfig.isCorrupted, true, 'atlasConfig undefined');
            });
        });

        context('when config is defined', function() {
            context('but basic config not declared', function() {
                it('should falls gracefully if "guideSrc" not declared in config', function() {
                    const atlasConfig = config.getBase({
                        'guideDest': 'test/fixtures/results/guide/',
                        'cssSrc': 'test/results/'
                    });
                    assert.strictEqual(atlasConfig.isCorrupted, true, '"guideSrc" not declared');
                });
                it('should falls gracefully if "guideDest" not declared in config', function() {
                    const atlasConfig = config.getBase({
                        'guideSrc': 'assets/src/scss/',
                        'cssSrc': 'assets/css/'
                    });
                    assert.strictEqual(atlasConfig.isCorrupted, true, '"guideDest" not declared');
                });
                it('should falls gracefully if "cssSrc" not declared in config', function() {
                    const atlasConfig = config.getBase({
                        'guideSrc': 'assets/src/scss/',
                        'guideDest': 'test/results/'
                    });
                    assert.strictEqual(atlasConfig.isCorrupted, true, '"cssSrc" not declared');
                });
            });
            context('but path without end slash', function() {
                it('config should hadle it', function() {
                    const atlasConfig = config.getBase({
                        'guideSrc': 'assets/src/scss',
                        'guideDest': 'test/results',
                        'cssSrc': 'assets/css'
                    });
                    const actualConfig = {
                        'guideSrc': atlasConfig.guideSrc,
                        'guideDest': atlasConfig.guideDest,
                        'cssSrc': atlasConfig.cssSrc
                    };
                    const expectedConfig = {
                        'guideSrc': path.join(cwd, 'assets/src/scss/'),
                        'guideDest': path.join(cwd, 'test/results/'),
                        'cssSrc': path.join(cwd, 'assets/css/')
                    };
                    assert.deepEqual(actualConfig, expectedConfig, 'end slash not handled');
                });
            });
            context('but files not available', function() {
                it('should fall gracefully and show message', function() {
                    const atlasConfig = config.getBase({
                        'guideSrc': 'path/to/src/',
                        'guideDest': 'test/results/',
                        'cssSrc': 'assets/css/'
                    });
                    assert.strictEqual(atlasConfig.isCorrupted, true, '"guideSrc" not available');
                });
                it('should fall gracefully and show message', function() {
                    const atlasConfig = config.getBase({
                        'guideSrc': 'assets/src/scss/',
                        'guideDest': 'path/to/dest',
                        'cssSrc': 'assets/css/'
                    });
                    assert.strictEqual(atlasConfig.isCorrupted, true, '"guideDest" not available');
                });
                it('should fall gracefully and show message', function() {
                    const atlasConfig = config.getBase({
                        'guideSrc': 'assets/src/scss/',
                        'guideDest': 'test/results/',
                        'cssSrc': 'path/to/css/'
                    });
                    assert.strictEqual(atlasConfig.isCorrupted, true, '"cssSrc" not available');
                });
                it('should warn that "scssSrc" not available and use "guideSrc"', function() {
                    const atlasConfig = config.getBase({
                        'guideSrc': 'assets/src/scss/',
                        'guideDest': 'test/results/',
                        'cssSrc': 'assets/css/',
                        'scssSrc': 'path/to/dir/'
                    });
                    assert.strictEqual(atlasConfig.scssSrc, atlasConfig.guideSrc, '"scssSrc" fallback not handled');
                });
            });
            context('and valid', function() {
                const config = require(path.resolve(__dirname, '../models/atlasconfig.js'));
                it('should return absolute path to existent resource', function() {
                    const atlasConfig = config.getBase({
                        'guideSrc': '/assets/src/scss/',
                        'guideDest': 'test/results',
                        'cssSrc': '/assets/css/'
                    });
                    assert.strictEqual(atlasConfig.guideSrc, path.join(cwd, 'assets/src/scss/'),
                        '"guideSrc" absolute path');
                });
            });
        });

        context('when project name is defined', function() {
            it('should search in config');
            it('should search in package.json');
            it('should use default and throw message');
        });

        context('when component prefix is defined', function() {
            it('should process list to regexp', function() {
                const atlasConfig = config.getBase({
                    'guideSrc': '/assets/src/scss/',
                    'guideDest': 'test/results',
                    'cssSrc': '/assets/css/',
                    'componentPrefixes': ['atlas-', 'l-']
                });
                assert.strictEqual(atlasConfig.componentPrefixes.toString(), '/^.atlas-|^.l-/');
            });
            it('should handle invalid list', function() {
                const atlasConfig = config.getBase({
                    'guideSrc': '/assets/src/scss/',
                    'guideDest': 'test/results',
                    'cssSrc': '/assets/css/',
                    'componentPrefixes': 'atlas-'
                });
                assert.strictEqual(atlasConfig.componentPrefixes.toString(), '/^.b-|^.l-/');
            });
            it('should return default list if not declared', function() {
                const atlasConfig = config.getBase({
                    'guideSrc': '/assets/src/scss/',
                    'guideDest': 'test/results',
                    'cssSrc': '/assets/css/'
                });
                assert.strictEqual(atlasConfig.componentPrefixes.toString(), '/^.b-|^.l-/');
            });
        });

        context('when overloaded templates is defined', function() {
            context('but template not available', function() {
                it('should throw message and fall gracefully');
                it('should use internal template');
            });
            context('but template not muched any used template', function() {
                it('should throw message and fall gracefully');
                it('should use internal template');
            });
            context('template is available', function() {
                it('should return proper absolute path');
                it('should use overloaded template');
            });
        });

        context('when overloaded partials is defined', function() {
            context('but partial not available', function() {
                it('should throw message and fall gracefully');
                it('should use internal partial');
            });
            context('but partials not muched any used template', function() {
                it('should throw message and fall gracefully');
                it('should use internal partials');
            });
            context('partial is available', function() {
                it('should return proper absolute path');
                it('should use overloaded partial');
            });
        });
    });
    describe('copyassets()', function() {
        const copyAssets = require(cwd + '/app/utils/copyassets.js');
        const assetsDest = path.join(cwd, '/test/results/');
        const assetsSrc = path.join(cwd, '/test/fixtures/assets/');

        before(function() {
            copyAssets(assetsSrc, assetsDest);
        });

        it('should create missing folders', function() {
            const assetsDir = fs.existsSync(path.join(assetsDest, '/assets'));
            assert.strictEqual(assetsDir, true, 'assets directory is created');
        });
        it('should copy files', function() {
            const style = fs.existsSync(path.join(assetsDest, '/assets/css/style.css'));
            const script = fs.existsSync(path.join(assetsDest, '/assets/my js/bundle.js'));
            assert.strictEqual(style && script, true, 'needed files is copied');
        });
        it('should not copy "src" folder', function() {
            const assetsSourceFiles = fs.existsSync(path.join(assetsDest, '/assets/src'));
            assert.strictEqual(assetsSourceFiles, false, '"src" folder not copied');
        });
        it('should not copy "map" files', function() {
            const styleMap = fs.existsSync(path.join(assetsDest, '/assets/css/style.css.map'));
            assert.strictEqual(styleMap, false, 'map file not copied');
        });

        after(function() {
            function deleteRes(res) {
                fs.readdirSync(res).forEach(item => {
                    const source = path.join(res, item);
                    if (fs.statSync(source).isFile()) {
                        if (item === '.gitkeep') {
                            return;
                        }
                        fs.unlinkSync(source);
                    } else {
                        deleteRes(source);
                        fs.rmdirSync(source);
                    }
                });
            }
            deleteRes(assetsDest);
        });
    });
    describe('models', function() {
        describe('styleguide', function() {
            const config = require(cwd + '/models/atlasconfig.js').getBase({
                'guideSrc': '/assets/src/scss/',
                'guideDest': 'test/results',
                'cssSrc': '/assets/css/',
                'projectConstants': {
                    'constantsSrc': '/test/fixtures/atlas/_excluded-settings.scss',
                    'colorPrefix': 'color',
                    'fontPrefix': 'font',
                    'scalePrefix': 'scale',
                    'spacePrefix': 'space',
                    'motionPrefix': 'motion',
                    'depthPrefix': 'depth',
                    'breakpointPrefix': 'break'
                }
            });
            const constants = require(cwd + '/models/projectconstants.js')(config.constants);

            it('return proper transformed model', function() {
                const viewModel = require(cwd + '/viewmodels/styleguide.js')(constants);
                const expectedViewModel = require(cwd + '/test/fixtures/viewmodels/styleguide.json');
                assert.deepEqual(viewModel, expectedViewModel, 'proper view model for styleguide');
            });
        });
        describe('statcomponent', function() {
            it('return proper transformed model without defined constants', function () {
                const componentPath = path.join(cwd, '/test/fixtures/atlas/_component.scss');
                const baseConfig = require(cwd + '/models/atlasconfig.js').getBase({
                    'guideSrc': '/assets/src/scss/',
                    'guideDest': 'test/results',
                    'cssSrc': '/assets/css/'
                });
                const constants = require(cwd + '/models/projectconstants.js')(baseConfig.constants);
                const deps = require(cwd + '/models/projectimportsgraph.js');
                const importsGraph = deps.getImportsGraph(baseConfig);
                const componentImports = deps.getFileImports(componentPath, importsGraph);
                const componentStat = require(cwd + '/models/componentstat.js').getStatFor(
                    componentPath, baseConfig.componentPrefixes);

                const viewModel = require(cwd + '/viewmodels/statcomponent.js')(
                    componentStat, componentImports, constants);
                const expectedViewModel = require(cwd + '/test/fixtures/viewmodels/statcomponent.json');
                assert.deepEqual(viewModel, expectedViewModel);
            });

            it('return proper transformed model with defined constants', function () {
                const componentPath = path.join(cwd, '/test/fixtures/atlas/_component.scss');
                const baseConfig = require(cwd + '/models/atlasconfig.js').getBase({
                    'guideSrc': '/assets/src/scss/',
                    'guideDest': 'test/results',
                    'cssSrc': '/assets/css/',
                    'projectConstants': {
                        'constantsSrc': '/test/fixtures/atlas/_excluded-settings.scss',
                        'colorPrefix': 'color',
                        'fontPrefix': 'font',
                        'scalePrefix': 'scale',
                        'spacePrefix': 'space',
                        'motionPrefix': 'motion',
                        'depthPrefix': 'depth',
                        'breakpointPrefix': 'break'
                    }
                });
                const constants = require(cwd + '/models/projectconstants.js')(baseConfig.constants);
                const deps = require(cwd + '/models/projectimportsgraph.js');
                const importsGraph = deps.getImportsGraph(baseConfig);
                const componentImports = deps.getFileImports(componentPath, importsGraph);
                const componentStat = require(cwd + '/models/componentstat.js').getStatFor(
                    componentPath, baseConfig.componentPrefixes);

                const viewModel = require(cwd + '/viewmodels/statcomponent.js')(
                    componentStat, componentImports, constants);
                const expectedViewModel = require(cwd + '/test/fixtures/viewmodels/statcomponent-const.json');
                assert.deepEqual(viewModel, expectedViewModel);
            });
        });
        describe('pagecontent', function () {
            const pageContent = require(cwd + '/viewmodels/pagecontent');

            it('should return comment content if path is right', function () {
                const result = pageContent('test/fixtures/atlas/_component.scss');
                const expectedResult = require(cwd + '/test/fixtures/viewmodels/pagecontent.json');
                assert.deepEqual(result, expectedResult);
            });
            it('should falls if no comment in file', function () {
                const result = pageContent('test/fixtures/atlas/_component-undocumented.scss');
                assert.deepEqual(result, {content: '', toc: []});
            });
            it('should falls if wrong path to file');
        });
        describe('statproject', function () {
            let projectStat;

            before(function () {
                const baseConfig = require(cwd + '/models/atlasconfig.js').getBase({
                    'guideSrc': '/assets/src/scss/',
                    'guideDest': 'test/results',
                    'cssSrc': '/assets/css/'
                });
                const projectName = 'atlas-guide';
                const cssSrc = baseConfig.cssSrc;
                const excludedCssFiles = baseConfig.excludedCssFiles;
                projectStat = require(cwd + '/models/projectcssstat.js')(projectName, cssSrc, excludedCssFiles);
            });

            it('should return proper view model', function () {
                const statProject = require(cwd + '/viewmodels/statproject.js');
                const projectName = 'atlas-guide';
                const viewModel = statProject(projectStat, projectName);
                const expectedViewModel = require(cwd + '/test/fixtures/viewmodels/statproject.json');
                assert.deepEqual(viewModel, expectedViewModel);
            });
        });
    });
    describe('Component statistics', function() {
        describe('getStatFor', function() {
            it('should skip keyframes rules');
            it('should correct calculate includes');
            it('should correct calculate imports');
            it('should correct calculate variables');
            it('should correct calculate imported by');
            it('should correct calculate total declarations');
            it('should correct construct component selectors tree');
            it('should return only uniq spaces');
            it('should return only uniq scales');
        });
    });
    describe('format', function() {
        const format = require(cwd + '/viewmodels/utils/format');

        describe('numbers', function() {
            it('should return proper formatted numbers with 0', function() {
                assert.strictEqual(format.numbers(0), 0);
            });
            it('should return proper formatted numbers more than 4', function() {
                assert.strictEqual(format.numbers(500), '500');
            });
            it('should return proper formatted numbers less than 4', function() {
                assert.strictEqual(format.numbers(3), '3');
            });
            it('should return proper formatted numbers with float point', function() {
                assert.strictEqual(format.numbers(3.000000002), '3.0');
            });
            it('should return proper formatted numbers with float point', function() {
                assert.strictEqual(format.numbers(0.6000000000000001), '600m');
            });
            it('should return proper formatted numbers with thousand numbers', function() {
                assert.strictEqual(format.numbers(20000), '20k');
            });
            it('should return proper formatted numbers million numbers', function() {
                assert.strictEqual(format.numbers(1000000), '1.0M');
            });
        });
        describe('bytes', function() {
            it('should return proper formatted bytes', function() {
                assert.strictEqual(format.bytes(600), '600B');
            });
            it('should return proper formatted kilo bytes', function() {
                assert.strictEqual(format.bytes(1000), '1000B');
            });
            it('should return proper formatted kilo bytes', function() {
                assert.strictEqual(format.bytes(1128), '1kB');
            });
            it('should return proper formatted mega bytes', function() {
                assert.strictEqual(format.bytes(1000000), '977kB');
            });
            it('should return proper formatted mega bytes', function() {
                assert.strictEqual(format.bytes(1128000), '1MB');
            });
            it('should return proper formatted giga bytes', function() {
                assert.strictEqual(format.bytes(1128000000), '1GB');
            });
        });
    });
});

