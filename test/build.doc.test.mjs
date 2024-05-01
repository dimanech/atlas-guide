import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
const cwd = process.cwd();

import atlasGuideWithConfig from '../app/atlas-guide.mjs';

describe('Single guideline', function() {
    const guideDest = 'test/results/';
    const expectedFile = path.join(cwd, guideDest, 'doc-guide.html');

    before(function(done) {
        fs.unlinkSync(path.join(cwd, guideDest, '.gitkeep'));

        const atlas = atlasGuideWithConfig({
            'guideSrc': 'test/fixtures/atlas/',
            'guideDest': guideDest,
            'cssSrc': 'test/fixtures/atlas/css',
            'copyInternalAssets': false,
            'excludedSassFiles': '^excluded',
            'excludedCssFiles': '^excluded',
            'partials': {
                'assetsfooter': 'test/fixtures/includes/assetsfooter.mustache',
                'assetshead': 'test/fixtures/includes/assetshead.mustache'
            },
            'templates': {
                'guide': 'test/fixtures/templates/guide.mustache'
            }
        });
        atlas.build(path.join(cwd, '/test/fixtures/atlas/guide.md')).then(() => done());
    });

    after(function() {
        fs.unlinkSync(expectedFile);
        fs.writeFileSync(path.join(cwd, guideDest, '.gitkeep'), '', 'utf8');
    });

    it('only one file should be written', function() {
        const actual = fs.readdirSync(guideDest);
        const expected = ['doc-guide.html'];
        assert.deepStrictEqual(actual, expected);
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
});
