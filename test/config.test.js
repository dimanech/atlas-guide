'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const cwd = process.cwd();

describe('Config', function() {
    const config = require(cwd + '/models/atlasconfig.js');
    let initialConfig = '';

    before(function() {
        initialConfig = fs.readFileSync('.atlasrc.json');
        const configFile = path.join(cwd, '.atlasrc.json');
        if (fs.existsSync(configFile)) {
            fs.unlinkSync(configFile);
        }
    });

    after(function() {
        fs.writeFileSync('.atlasrc.json', initialConfig, 'utf8');
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

    context('when index src is defined', function() {
        const getIndexPageSource = require(path.join(cwd, '/models/config/indexpagesource'));
        const projectRoot = cwd;
        const guideSrc = path.join(cwd, 'test/fixtures/atlas');
        const undefinedSrc = 'not-exist.md';
        const inexistentReadme = path.join(cwd, 'test/fixtures/atlas/category');

        it('should use defined in config index sourc', function() {
            const definedSrc = 'test/fixtures/atlas/guide.md';
            const result = getIndexPageSource(projectRoot, guideSrc, definedSrc);
            assert.strictEqual(path.join(cwd, definedSrc), result);
        });
        it('should fall to guide root README.md', function() {
            const result = getIndexPageSource(projectRoot, guideSrc, undefinedSrc);
            assert.strictEqual(path.join(guideSrc, 'README.md'), result);
        });
        it('should fall to project root README.md', function() {
            const result = getIndexPageSource(projectRoot, inexistentReadme, undefinedSrc);
            assert.strictEqual(path.join(projectRoot, 'README.md'), result);
        });
        it('should return empty string if no fallback', function() {
            const result = getIndexPageSource(inexistentReadme, inexistentReadme, undefinedSrc);
            assert.strictEqual('', result);
        });
        it('should exclude README.md from guide root');
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
