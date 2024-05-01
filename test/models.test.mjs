import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
const cwd = process.cwd();

function getJSON(filePath) {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
}

import config from '../models/atlasconfig.mjs';
import { getProjectConstants } from '../models/projectconstants.mjs';
import styleguide from '../viewmodels/styleguide.mjs';
import { getImportsGraph, getFileImports } from '../models/projectimportsgraph.mjs';
import componentStat from '../models/componentstat.mjs';
import getStatistic from '../viewmodels/statcomponent.mjs';
import pageContent from '../models/pagecontent.mjs';
import getProjectStat from '../models/projectcssstat.mjs';
import statProject from '../viewmodels/statproject.mjs';
import bundleImports from '../viewmodels/statimports.mjs';
import projectbundle from '../models/projectbundle.mjs';

describe('Models', function() {
    describe('styleguide', function() {
        const baseConfig = config({
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
        const projectConstants = getProjectConstants(baseConfig.constants);

        it('return proper transformed model', function() {
            const viewModel = styleguide(projectConstants);
            const expectedViewModel = getJSON(cwd + '/test/fixtures/viewmodels/styleguide.json');
            assert.deepEqual(viewModel, expectedViewModel, 'proper view model for styleguide');
        });
    });
    describe('projectimportsgraph', function() {
        const baseConfig = config({
            'guideSrc': 'test/fixtures/atlas/',
            'guideDest': 'test/results/',
            'cssSrc': 'test/fixtures/atlas/css/'
        });
        // const graph = require(cwd + '/models/projectimportsgraph.js');
        const importGraph = getImportsGraph(baseConfig);

        describe('getImportsGraph', function() {
            it('should return right import graph without additional imports', function() {
                assert.strictEqual(Object.keys(importGraph.index).length, 9);
            });
        });

        describe('getFileImports', function() {
            it('should return empty model if no file info in imports graph', function() {
                const expected = {
                    imports: [],
                    importedBy: []
                };
                const model = getFileImports('path/to/file.scss', importGraph);
                assert.deepEqual(model, expected);
            });
            it('should return empty model if no imports info for file in imports graph', function() {
                const expected = {
                    imports: [],
                    importedBy: []
                };
                const model = getFileImports(
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
                const model = getFileImports('test/fixtures/atlas/_component.scss', importGraph);
                assert.deepEqual(model, expected);
            });
        });
    });
    describe('statcomponent', function() {
        it('should return proper transformed model without defined constants', function() {
            const componentPath = path.join(cwd, '/test/fixtures/atlas/_component.scss');
            const baseConfig = config({
                'guideSrc': 'test/fixtures/atlas/',
                'guideDest': 'test/results/',
                'cssSrc': 'test/fixtures/atlas/css/'
            });
            const constants = getProjectConstants(baseConfig.constants);
            const importsGraph = getImportsGraph(baseConfig);
            const componentImports = getFileImports(componentPath, importsGraph);
            const componentStatistic = componentStat(componentPath, baseConfig.componentPrefixes);

            const viewModel = getStatistic(componentStatistic, componentImports, constants);
            const expectedViewModel = getJSON(cwd + '/test/fixtures/viewmodels/statcomponent.json');
            assert.deepStrictEqual(viewModel, expectedViewModel);
        });

        it('should return proper transformed model with defined constants', function() {
            const componentPath = path.join(cwd, '/test/fixtures/atlas/_component.scss');
            const baseConfig = config({
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
            const constants = getProjectConstants(baseConfig.constants);
            const importsGraph = getImportsGraph(baseConfig);
            const componentImports = getFileImports(componentPath, importsGraph);
            const componentStatistic = componentStat(componentPath, baseConfig.componentPrefixes);
            const viewModel = getStatistic(componentStatistic, componentImports, constants);
            const expectedViewModel = getJSON(cwd + '/test/fixtures/viewmodels/statcomponent-const.json');
            assert.deepStrictEqual(viewModel, expectedViewModel);
        });
    });
    describe('pagecontent', function() {
        // const pageContent = require(cwd + '/models/pagecontent');

        it('should return comment content if path is right', function() {
            const result = pageContent('test/fixtures/atlas/_component.scss');
            const expectedResult = getJSON(cwd + '/test/fixtures/viewmodels/pagecontent.json');
            assert.deepStrictEqual(result, expectedResult);
        });
        it('should falls if no comment in file', function() {
            const result = pageContent('test/fixtures/atlas/_component-undocumented.scss');
            assert.deepStrictEqual(result, {content: '', toc: [], isNeedStat: false});
        });
        it('should pass false for statistics if found declaration', function() {
            const result = pageContent('test/fixtures/atlas/category/_component-no-stat.scss');
            assert.deepStrictEqual(result, {content: '', toc: [], isNeedStat: false});
        });
        it('should falls if wrong path to file');
    });
    describe('statproject', function() {
        let projectStat;

        before(function() {
            const baseConfig = config({
                'guideSrc': 'test/fixtures/atlas/',
                'guideDest': 'test/results/',
                'cssSrc': 'test/fixtures/atlas/css/'
            });
            const projectName = 'atlas-guide';
            const cssSrc = baseConfig.cssSrc;
            const excludedCssFiles = baseConfig.excludedCssFiles;
            projectStat = getProjectStat(projectName, cssSrc, excludedCssFiles);
        });

        it('should return proper view model', function() {
            // const statProject = require(cwd + '/viewmodels/statproject.js');
            const projectName = 'atlas-guide';
            const viewModel = statProject(projectStat, projectName);
            const expectedViewModel = getJSON(cwd + '/test/fixtures/viewmodels/statproject.json');
            assert.deepStrictEqual(viewModel, expectedViewModel);
        });
    });
    describe('componentstat', function() {
        // const componentstat = require(cwd + '/models/componentstat.js');
        it('should return nothing if file not scss', function() {
            const result = componentStat('/path/to/file.md', 'some');
            assert.strictEqual(result, undefined);
        });
    });
    describe('statimports', function() {
        // const statimports = require(cwd + '/viewmodels/statimports.js');
        const importsGraph = {
            index: {
                '/path/to/some.scss': {
                    imports: ['/path/foo.scss', '/path/bar.scss']
                }
            }
        };

        it('should not process excluded files', function() {
            const result = bundleImports(importsGraph, new RegExp('some'));
            assert.strictEqual(result.length, 0);
        });
        it('should return proper imports for standalone files', function() {
            const result = bundleImports(importsGraph, new RegExp('foo'));
            const expected = [{name: 'some.scss', imports: ['foo.scss', 'bar.scss']}];
            assert.deepStrictEqual(result, expected);
        });
    });
    describe('projectbundle', function() {
        // const projectBundle = require(cwd + '/models/projectbundle.js');
        // const importsGraph = require(cwd + '/models/projectimportsgraph.js').getImportsGraph;
        const importsGraphsExpected = getJSON(cwd + '/test/fixtures/viewmodels/importsgraphs.json');
        const tests = [
            {type: 'deep', description: 'for deep tree imports'},
            {type: 'semi-flat', description: 'for flat imports'},
            {type: 'multi-level', description: 'for deep tree imports with multiple standalones'}
        ];

        tests.forEach(function(test) {
            it('should return proper model ' + test.description, function() {
                const graph =
                    getImportsGraph({
                        scssSrc: path.join(cwd, 'test', 'fixtures', 'projectStructures', test.type),
                        scssAdditionalImportsArray: []
                    });
                const result = projectbundle(graph, 'root', 'some/', new RegExp('_exclud'));
                assert.deepStrictEqual(JSON.parse(result), importsGraphsExpected[test.type]);
            });
        });
    });
    describe('projectconstants', function() {
        const baseConfig = config({
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

        it('should return undefined if props not declared', function() {
            const baseConfig = config({
                'guideSrc': 'test/fixtures/atlas/',
                'guideDest': 'test/results/',
                'cssSrc': 'test/fixtures/atlas/css/'
            });
            const viewModel = getProjectConstants(baseConfig.constants);

            assert.strictEqual(viewModel, undefined);
        });
        it('should return proper model for custom properties only', function() {
            baseConfig.constants.constantsFile = `
                @use 'sass:math';
                :root {
                    --color-yellow-atlas: #fae20f;
                    --font-mono-atlas: "DejaVu Sans Mono", monospace;
                    --scale-sm-atlas: 0.8rem;
                    $size-line-atlas: 1.2rem;
                    --space-sm-atlas: #{math.div($size-line-atlas, 2)};
                    --motion-ease: cubic-bezier(0.65, 0.05, 0.36, 1) 0.3s;
                    --depth-1: 0 3px 10px 1px rgba(black, 0.34);
                    --break-sm: 767px;
                }
                `;
            const viewModel = getProjectConstants(baseConfig.constants);
            const expectedViewModel = {
                'color': [{'name': '--color-yellow-atlas', 'value': '#fae20f'}],
                'font': [{'name': '--font-mono-atlas', 'value': '"DejaVu Sans Mono", monospace'}],
                'scale': [{'name': '--scale-sm-atlas', 'value': '0.8rem'}],
                'space': [{'name': '--space-sm-atlas', 'value': '0.6rem'}],
                'breakpoint': [{'name': '--break-sm', 'value': '767px'}],
                'depth': [{'name': '--depth-1', 'value': '0 3px 10px 1px rgba(black, 0.34)'}],
                'motion': [{'name': '--motion-ease', 'value': 'cubic-bezier(0.65, 0.05, 0.36, 1) 0.3s'}]
            };

            assert.deepStrictEqual(viewModel, expectedViewModel);
        });
        it('should return proper model for SCSS constants only', function() {
            baseConfig.constants.constantsFile = `
                    @use 'sass:math';
                    $color-yellow-atlas: #fae20f;
                    $font-mono-atlas: "DejaVu Sans Mono", monospace;
                    $scale-sm-atlas: 0.8rem;
                    $size-line-atlas: 1.2rem;
                    $space-sm-atlas: math.div($size-line-atlas, 2);
                    $motion-ease: cubic-bezier(0.65, 0.05, 0.36, 1) 0.3s;
                    $depth-1: 0 3px 10px 1px rgba(black, 0.34);
                    $break-sm: 767px;
                `;
            const viewModel = getProjectConstants(baseConfig.constants);
            const expectedViewModel = {
                'color': [{'name': '$color-yellow-atlas', 'value': '#fae20f'}],
                'font': [{'name': '$font-mono-atlas', 'value': '"DejaVu Sans Mono", monospace'}],
                'scale': [{'name': '$scale-sm-atlas', 'value': '0.8rem'}],
                'space': [{'name': '$space-sm-atlas', 'value': '0.6rem'}],
                'breakpoint': [{'name': '$break-sm', 'value': '767px'}],
                'depth': [{'name': '$depth-1', 'value': '0 3px 10px 1px rgba(0, 0, 0, 0.34)'}],
                'motion': [{'name': '$motion-ease', 'value': 'cubic-bezier(0.65, 0.05, 0.36, 1) 0.3s'}]
            };

            assert.deepStrictEqual(viewModel, expectedViewModel);
        });
        it('should return proper model for mix constants and custom props', function() {
            baseConfig.constants.constantsFile = `
                    $color-green-atlas: #fae20f;
                    :root {
                        --color-yellow-atlas: #fae20f;
                    }
                `;
            const viewModel = getProjectConstants(baseConfig.constants);
            const expectedViewModel = {
                'breakpoint': [],
                'color': [{
                    'name': '--color-yellow-atlas',
                    'value': '#fae20f'
                }, {
                    'name': '$color-green-atlas',
                    'value': '#fae20f'
                }],
                'depth': [],
                'font': [],
                'motion': [],
                'scale': [],
                'space': []
            };

            assert.deepStrictEqual(viewModel, expectedViewModel);
        });
        it('should ignore undeclared constants', function() {
            const baseConfig = config({
                'guideSrc': 'test/fixtures/atlas/',
                'guideDest': 'test/results/',
                'cssSrc': 'test/fixtures/atlas/css/',
                'projectConstants': {
                    'constantsSrc': '/test/fixtures/atlas/_excluded-settings.scss',
                    'colorPrefix': 'color'
                }
            });
            baseConfig.constants.constantsFile = `
                    $brand-green-atlas: #fae20f;
                    :root {
                        --brand-yellow-atlas: #fae20f;
                    }
                `;
            const viewModel = getProjectConstants(baseConfig.constants);
            const expectedViewModel = {
                'breakpoint': [],
                'color': [],
                'depth': [],
                'font': [],
                'motion': [],
                'scale': [],
                'space': []
            };

            assert.deepStrictEqual(viewModel, expectedViewModel);
        });
        it('should warn about not proper imports', function() {
            const baseConfig = config({
                'guideSrc': 'test/fixtures/atlas/',
                'guideDest': 'test/results/',
                'cssSrc': 'test/fixtures/atlas/css/',
                'projectConstants': {
                    'constantsSrc': '/test/fixtures/atlas/_excluded-settings.scss',
                    'colorPrefix': 'color'
                }
            });
            baseConfig.constants.constantsFile = '@import "../inexistent_file";';
            const viewModel = getProjectConstants(baseConfig.constants);
            const expectedViewModel = {
                'breakpoint': [],
                'color': [],
                'depth': [],
                'font': [],
                'motion': [],
                'scale': [],
                'space': []
            };

            assert.deepStrictEqual(viewModel, expectedViewModel);
        });
    });
});
