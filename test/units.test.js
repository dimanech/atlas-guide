'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const cwd = process.cwd();

describe('Units', function() {
    describe('utils', function() {
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
        describe('copyassets', function() {
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
    });
    describe('templateHelpers', function() {
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
            it('should return proper display names for any other values', function() {
                assert.strictEqual(ruleSizeStat('margin', true), 'margin');
                assert.strictEqual(ruleSizeStat('margin', false), 'margins');
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
                const expectedResult = {
                    notInConstants: {count: 0, values: []},
                    allOk: true,
                    consider: [
                        {from: '0', to: '$space-off-atlas', count: 1},
                        {from: '0.6rem', to: '$space-sm-atlas', count: 2}
                    ]
                };
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

