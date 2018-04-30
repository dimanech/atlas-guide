'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const cwd = process.cwd();

describe('Atlas', function() {
    let initialConfig = '';

    before(function() {
        initialConfig = fs.readFileSync('.atlasrc.json');
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
            before(function (done) {
                const atlas = require(cwd + '/app/atlas-guide');
                atlas.build().then(() => done());
            });

            it('should generate all components pages', function() {
                const actualFiles = fs.readdirSync(guideDest);
                const expected = [
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

            it('reports should be written', function() {
                const fileCount = fs.readdirSync(guideDest).length;
                assert.strictEqual(fileCount, 8, 'folder contain needed files count');
            });
            it('should not process excluded files', function() {
                const actual = fs.readdirSync(guideDest);
                const expected = [
                    'bundle.html',
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
                    /data-chart='\[{"name":"stat-test.css","raw":7500,"zipped":5238,"view":{"raw":"7kB","zipped":/
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

        after(function() {
            fs.unlinkSync('.atlasrc.json');
            fs.writeFileSync(path.join(cwd, guideDest, '.gitkeep'), '', 'utf8');
        });
    });
    describe('Config', function() {
        const config = require(cwd + '/models/atlasconfig.js');

        before(function() {
            const config = path.join(cwd, '.atlasrc.json');
            if (fs.existsSync(config)) {
                fs.unlinkSync(config);
            }
        });

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
    describe('Models', function() {
        describe('styleguide', function() {
            const config = require(cwd + '/models/atlasconfig.js').getBase({
                'guideSrc': 'test/fixtures/atlas/',
                'guideDest': 'test/results/',
                'cssSrc': 'test/fixtures/atlas/css/',
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
        describe('projectimportsgraph', function() {
            const baseConfig = require(cwd + '/models/atlasconfig.js').getBase({
                'guideSrc': 'test/fixtures/atlas/',
                'guideDest': 'test/results/',
                'cssSrc': 'test/fixtures/atlas/css/'
            });
            const graph = require(cwd + '/models/projectimportsgraph.js');
            const importGraph = graph.getImportsGraph(baseConfig);

            describe('getImportsGraph', function() {
                it('should return right import graph without additional imports', function() {
                    const model = importGraph;
                    assert.strictEqual(Object.keys(model.index).length, 7);
                });
            });

            describe('getFileImports', function() {
                it('should return empty model if no file info in imports graph', function() {
                    const expected = {
                        imports: [],
                        importedBy: []
                    };
                    const model = graph.getFileImports('path/to/file.scss', importGraph);
                    assert.deepEqual(model, expected);
                });
                it('should return empty model if no imports info for file in imports graph', function() {
                    const expected = {
                        imports: [],
                        importedBy: []
                    };
                    const model = graph.getFileImports(
                        cwd + 'test/fixtures/atlas/_component-undocumented.scss',
                        importGraph
                    );
                    assert.deepEqual(model, expected);
                });
                it('should return proper model if file exist in imports graph', function() {
                    const expected = {
                        'imports': ['excluded-component.scss', '_component.scss'],
                        'importedBy': ['style.scss']
                    };
                    const model = graph.getFileImports('test/fixtures/atlas/_component.scss', importGraph);
                    assert.deepEqual(model, expected);
                });
            });
        });
        describe('statcomponent', function() {
            it('should return proper transformed model without defined constants', function() {
                const componentPath = path.join(cwd, '/test/fixtures/atlas/_component.scss');
                const baseConfig = require(cwd + '/models/atlasconfig.js').getBase({
                    'guideSrc': 'test/fixtures/atlas/',
                    'guideDest': 'test/results/',
                    'cssSrc': 'test/fixtures/atlas/css/'
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

            it('should return proper transformed model with defined constants', function() {
                const componentPath = path.join(cwd, '/test/fixtures/atlas/_component.scss');
                const baseConfig = require(cwd + '/models/atlasconfig.js').getBase({
                    'guideSrc': 'test/fixtures/atlas/',
                    'guideDest': 'test/results/',
                    'cssSrc': 'test/fixtures/atlas/css/',
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
        describe('pagecontent', function() {
            const pageContent = require(cwd + '/models/pagecontent');

            it('should return comment content if path is right', function() {
                const result = pageContent('test/fixtures/atlas/_component.scss');
                const expectedResult = require(cwd + '/test/fixtures/viewmodels/pagecontent.json');
                assert.deepEqual(result, expectedResult);
            });
            it('should falls if no comment in file', function() {
                const result = pageContent('test/fixtures/atlas/_component-undocumented.scss');
                assert.deepEqual(result, {content: '', toc: []});
            });
            it('should falls if wrong path to file');
        });
        describe('statproject', function() {
            let projectStat;

            before(function() {
                const baseConfig = require(cwd + '/models/atlasconfig.js').getBase({
                    'guideSrc': 'test/fixtures/atlas/',
                    'guideDest': 'test/results/',
                    'cssSrc': 'test/fixtures/atlas/css/'
                });
                const projectName = 'atlas-guide';
                const cssSrc = baseConfig.cssSrc;
                const excludedCssFiles = baseConfig.excludedCssFiles;
                projectStat = require(cwd + '/models/projectcssstat.js')(projectName, cssSrc, excludedCssFiles);
            });

            it('should return proper view model', function() {
                const statProject = require(cwd + '/viewmodels/statproject.js');
                const projectName = 'atlas-guide';
                const viewModel = statProject(projectStat, projectName);
                const expectedViewModel = require(cwd + '/test/fixtures/viewmodels/statproject.json');
                assert.deepEqual(viewModel, expectedViewModel);
            });
        });
        describe('componentstat', function() {
            const componentstat = require(cwd + '/models/componentstat.js');
            it('should return nothing if file not scss', function() {
                const result = componentstat.getStatFor('/path/to/file.md', 'some');
                assert.strictEqual(result, undefined);
            });
        });
        describe('statimports', function() {
            const statimports = require(cwd + '/viewmodels/statimports.js');
            const importsGraph = {
                index: {
                    '/path/to/some.scss': {
                        imports: ['/path/foo.scss', '/path/bar.scss']
                    }
                }
            };

            it('should not process excluded files', function() {
                const result = statimports(importsGraph, new RegExp('some'));
                assert.strictEqual(result.length, 0);
            });
            it('should return proper imports for standalone files', function() {
                const result = statimports(importsGraph, new RegExp('foo'));
                const expected = [{name: 'some.scss', imports: ['foo.scss', 'bar.scss']}];
                assert.deepEqual(result, expected);
            });
        });
    });
    describe('format()', function() {
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
        it('should not recreate existed folders', function() {
            copyAssets(assetsSrc, assetsDest);
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
        it('should not copy hidden files', function() {
            const hiddenFile = fs.existsSync(path.join(assetsDest, '/assets/css/.geetkeep'));
            assert.strictEqual(hiddenFile, false);
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
    describe('inline()', function() {
        const inline = require(cwd + '/app/utils/templateHelpers/inline.js');
        it('should return right inlining if path is exist', function() {
            const result = inline('test/fixtures/assets/src/style.scss', text => text);
            const expectedResult = `body {
	margin: 0;
}
`;
            assert.strictEqual(result, expectedResult);
        });
        it('should return message and not fall if path not exist', function() {
            const result = inline('inexistent.scss', text => text);
            assert.strictEqual(result, undefined);
        });
    });
    describe('pluralize()', function() {
        const pluralize = require(cwd + '/app/utils/templateHelpers/pluralize.js');
        it('should return proper value if plural', function() {
            const result = pluralize('0,singular,plural', text => text);
            assert.strictEqual(result, 'plural');
        });
        it('should return proper value if singular', function() {
            const result = pluralize('1,singular,plural', text => text);
            assert.strictEqual(result, 'singular');
        });
    });
    describe('statproject', function() {
        describe('ruleSizeStat', function() {
            const ruleSizeStat = require(cwd + '/viewmodels/statproject/ruleSizeStat');
            it('should return false if we do not have stat', function() {
                const result = ruleSizeStat();
                assert.strictEqual(result, false);
            });
            it('should push to heavy rule sets if values more than 15', function() {
                const data = [{selector: '.empty', declarations: 0},
                    {selector: '.heavy', declarations: 16},
                    {selector: '.regular', declarations: 2}];
                const result = ruleSizeStat(data).heavy[0].declarations;
                assert.strictEqual(result, 16);
            });
            it('should push to empty rule sets if values less than 1', function() {
                const data = [{selector: '.empty', declarations: 0},
                    {selector: '.heavy', declarations: 16},
                    {selector: '.regular', declarations: 2}];
                const result = ruleSizeStat(data).empty.length;
                assert.strictEqual(result, 1);
            });
            it('should return sorted values', function() {
                const data = [{selector: '.heavy', declarations: 20},
                    {selector: '.heavy-1', declarations: 17},
                    {selector: '.heavy-2', declarations: 18}];
                const result = ruleSizeStat(data);
                assert.deepEqual(result, {
                    heavy: [
                        {selector: '.heavy', declarations: 20},
                        {selector: '.heavy-2', declarations: 18},
                        {selector: '.heavy-1', declarations: 17}],
                    empty: []
                });
            });
        });
        describe('selectorsListTops', function() {
            const selectorsListTops = require(cwd + '/viewmodels/statproject/selectorsListTops');
            it('should push to list if selectors length more than 3', function() {
                const data = [
                    'article,aside,footer,header,nav,section',
                    'figcaption,figure,main',
                    'b,strong'
                ];
                const result = selectorsListTops(data).length;
                assert.strictEqual(result, 1);
            });
            it('should not push to list if selectors length less than 3', function() {
                const data = [
                    'figcaption,figure,main',
                    'b,strong',
                    '.some'
                ];
                const result = selectorsListTops(data).length;
                assert.strictEqual(result, 0);
            });
            it('should return sorted values', function() {
                const data = [
                    'b,strong,.some,.some:hover',
                    'article,aside,footer,header,nav,section',
                    'figcaption,figure,main,header,a'
                ];
                const result = selectorsListTops(data);
                const expectedResult = [{
                    'selector': 'article,<br>aside,<br>footer,<br>header,<br>nav,<br>section',
                    'selectors': 6
                }, {
                    'selector': 'figcaption,<br>figure,<br>main,<br>header,<br>a',
                    'selectors': 5
                }, {
                    'selector': 'b,<br>strong,<br>.some,<br>.some:hover',
                    'selectors': 4
                }
                ];
                assert.deepEqual(result, expectedResult);
            });
        });
        describe('totals', function() {
            const totals = require(cwd + '/viewmodels/statproject/totals');
            it('should return false if we do not have stat', function() {
                const result = totals();
                assert.strictEqual(result, false);
            });
        });
        describe('uniques', function() {
            const uniques = require(cwd + '/viewmodels/statproject/uniques');
            it('should return false if we do not have stat', function() {
                const result = uniques();
                assert.strictEqual(result, false);
            });
        });
        describe('parseSpaces', function() {
            const parseSpaces = require(cwd + '/viewmodels/statproject/parseSpaces');
            it('should return false if we do not have stat', function() {
                const result = parseSpaces();
                assert.strictEqual(result, false);
            });
            it('should not split values list if it contain calc function', function() {
                const data = [
                    'calc(100px + 2em) 20px',
                    '30px 20px',
                    '0'
                ];
                const result = parseSpaces(data);
                const expectedResult = ['calc(100px + 2em) 20px', '30px', '20px', '0'];
                assert.deepEqual(result, expectedResult);
            });
            it('should return only uniq values', function() {
                const data = ['20px', '20px', '20px', '0'];
                const result = parseSpaces(data);
                assert.deepEqual(result, ['20px', '0']);
            });
        });
        describe('sortSizes', function() {
            const sortSizes = require(cwd + '/viewmodels/statproject/sortSizes');
            it('should return false if we do not have stat', function() {
                const result = sortSizes();
                assert.strictEqual(result, false);
            });
            it('should proper process int', function() {
                const data = [0];
                const result = sortSizes(data);
                const expectedResult = [{
                    orig: '0',
                    abs: 0,
                    isNegative: false,
                    normalized: 0
                }];
                assert.deepEqual(result, expectedResult);
            });
            it('should proper process strings', function() {
                const data = ['-20px'];
                const result = sortSizes(data);
                const expectedResult = [{
                    orig: '-20px',
                    abs: -20,
                    isNegative: true,
                    normalized: 20
                }];
                assert.deepEqual(result, expectedResult);
            });
        });
    });
    describe('componentstat', function() {
        describe('getFont', function() {
            const getFont = require(cwd + '/models/componentstat/utils/getFont');
            const tests = [
                {
                    name: 'normative, no spaces',
                    property: '14px/1.2 Arial, Helvetica, sans-serif',
                    result: ['14px', '"Arial", "Helvetica", sans-serif']
                },
                {
                    name: 'normative, spaces, with brackets',
                    property: '14rem/1.2 Arial,"Helvetica N",sans-serif',
                    result: ['14rem', '"Arial", "Helvetica N", sans-serif']
                },
                {
                    name: 'normative, full declaration',
                    property: 'italic small-caps bold semi-condensed 14ex/1.2 cursive',
                    result: ['14ex', 'cursive']
                },
                {
                    name: 'not normative, size and family',
                    property: '14pt Arial, Helvetica, sans-serif',
                    result: ['14pt', '"Arial", "Helvetica", sans-serif']
                },
                {
                    name: 'not normative with spaces, no brackets',
                    property: '14em/1.2px Times New Roman,Arial,Times New Roman,sans-serif',
                    result: ['14em', '"Times New Roman", "Arial", "Times New Roman", sans-serif']
                },
                {
                    name: 'normative with variable',
                    property: '14pc/1.2 $some',
                    result: ['14pc', '$some']
                },
                {
                    name: 'inherit',
                    property: 'inherit',
                    result: ['inherit', 'inherit']
                },
                {
                    name: 'parse error',
                    property: 'cursive',
                    result: ['', '']
                }
            ];
            tests.forEach(function(test) {
                it('should return right value in `' + test.name + '` case', function() {
                    const expectedResult = {
                        fontSize: test.result[0],
                        fontFamily: test.result[1]
                    };
                    assert.deepEqual(expectedResult, getFont(test.property));
                });
            });
        });
        describe('guessType', function() {
            const guessType = require(cwd + '/models/componentstat/utils/guessSelectorType');
            const componentPrefixRegExp = new RegExp('^.atlas-|^.l-');

            describe('single selector', function() {
                const tests = [
                    {
                        type: 'component',
                        selectors: ['.atlas-component', '.l-component']
                    }, {
                        type: 'element',
                        selectors: [
                            'strong',
                            '.atlas-component__element',
                            '.atlas-component__element-name',
                            '.atlas-component__element-name-2',
                            '&__element'
                        ]
                    }, {
                        type: 'element-implicit',
                        selectors: ['.selector::before', '&::after']
                    }, {
                        type: 'modifier',
                        selectors: [
                            '.atlas-component_mod',
                            '.atlas-component--mod',
                            '&_m-mod',
                            '&--mod',
                            '.atlas-component__element_mod',
                            '.atlas-component__element--mod'
                        ]
                    }, {
                        type: 'modifier-adjacent',
                        selectors: ['&.m-mod', '&.atlas-component'] // should not be modifier is the same component used
                    }, {
                        type: 'modifier-implicit',
                        selectors: ['.selector:hover', '&:hover']
                    }, {
                        type: 'modifier-context',
                        selectors: ['.selector &', '.atlas-component &']
                    }, {
                        type: 'mixin',
                        selectors: ['include']
                    }, {
                        type: 'extend',
                        selectors: ['extend']
                    }, {
                        type: 'condition',
                        selectors: ['media', 'supports', 'if']
                    }
                ];
                const getResult = selector => guessType(selector, componentPrefixRegExp);

                tests.forEach(function(test) {
                    it('should return `' + test.type + '` type', function() {
                        test.selectors.forEach(function(selector) { // eslint-disable-line
                            return assert.equal(getResult(selector), test.type);
                        });
                    });
                });
            });

            describe('changed selectors', function() {});
        });
    });
    describe('statcomponent', function() {
        describe('prepareDisplayName', function() {
            const ruleSizeStat = require(cwd + '/viewmodels/statcomponent/prepareDisplayName');

            it('should return proper display names for "fontFamily"', function() {
                assert.strictEqual(ruleSizeStat('fontFamily', true), 'Font family');
                assert.strictEqual(ruleSizeStat('fontFamily', false), 'Font families');
            });
            it('should return proper display names for "fontSize"', function() {
                assert.strictEqual(ruleSizeStat('fontSize', true), 'Font size');
                assert.strictEqual(ruleSizeStat('fontSize', false), 'Font sizes');
            });
            it('should return proper display names for "backgroundColor"', function() {
                assert.strictEqual(ruleSizeStat('backgroundColor', true), 'Background');
                assert.strictEqual(ruleSizeStat('backgroundColor', false), 'Backgrounds');
            });
            it('should return proper display names for "mediaQuery"', function() {
                assert.strictEqual(ruleSizeStat('mediaQuery', true), 'Media query');
                assert.strictEqual(ruleSizeStat('mediaQuery', false), 'Media queries');
            });
            it('should return proper display names for "boxShadow"', function() {
                assert.strictEqual(ruleSizeStat('boxShadow', true), 'Box shadow');
                assert.strictEqual(ruleSizeStat('boxShadow', false), 'Box shadow');
            });
        });
        describe('getComponentStat', function() {
            const getConstantsStat = require(cwd + '/viewmodels/statcomponent/getConstantsUsage');
            let valueList = ['0', '0.6rem', '0.6rem'];
            let constants = {
                'space': [
                    {'name': '$space-off-atlas', 'value': '0'},
                    {'name': '$space-sm-atlas', 'value': '0.6rem'},
                    {'name': '$space-md-atlas', 'value': '1.2rem'}
                ]
            };

            it('should return counter for suggest right props', function() {
                const expectedResult = {notInConstants: {count: 0, values: []},
                    allOk: true,
                    consider: [
                        {from: '0', to: '$space-off-atlas', count: 1},
                        {from: '0.6rem', to: '$space-sm-atlas', count: 2}
                    ]};
                assert.deepEqual(getConstantsStat('padding', valueList, constants), expectedResult);
            });
            it('should return undefined in case of empty values list', function() {
                valueList = [];
                const expectedResult = undefined;
                assert.deepEqual(getConstantsStat('padding', valueList, constants), expectedResult);
            });
            it('should return undefined in case of prop not much constants map', function() {
                const expectedResult = undefined;
                assert.deepEqual(getConstantsStat('overflow', valueList, constants), expectedResult);
            });
        });
    });
});
// fs.writeFileSync('statproject.json', JSON.stringify(viewModel), null, '\t');

