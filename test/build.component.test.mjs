import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
const cwd = process.cwd();

import atlasGuideWithConfig from '../app/atlas-guide.mjs';

describe('Build', function() {
    const guideDest = 'test/results/';
    let atlas;

    before(function() {
        fs.unlinkSync(path.join(cwd, guideDest, '.gitkeep'));
        atlas = atlasGuideWithConfig({
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
    });

    after(function() {
        fs.writeFileSync(path.join(cwd, guideDest, '.gitkeep'), '', 'utf8');
    });

    describe('Single component', function() {
        describe('Wrong config', function() {
            it('should not throw an error if it has wrong config', function(done) {
                const atlasGuide = atlasGuideWithConfig('./.inexistentatlasrc.json');
                try {
                    atlasGuide.build('/path/to/file.css').then(() => done());
                } catch (e) {
                    done('failed');
                }
            });
        });
        describe('Existed absolute path', function() {
            const expectedFile = path.join(cwd, guideDest, 'component.html');

            before(function(done) {
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
                assert.deepStrictEqual(actualFiles, ['component.html']);
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
            const expectedFile = path.join(cwd, guideDest, 'component-deprecated.html');

            before(function(done) {
                atlas.build('./test/fixtures/atlas/_component-deprecated.scss').then(() => done()); // eslint-disable-line
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
                const result = /h1-b-component-deprecated/.test(expectedFileContent);
                assert.strictEqual(result, true, 'component file have expected content');
            });
        });

        describe('Wrong path', function() {
            it('should not trow an error on unexisted file with relative path', function(done) {
                try {
                    atlas.build('./test/fixtures/atlas_component.scss').then(() => done()); // eslint-disable-line
                } catch (e) {
                    done('failed');
                }
            });
            it('should not trow an error on unexisted file with absolute path', function(done) {
                try {
                    atlas.build(path.join(cwd, '/test/fixtures/atlas/_some.scss')).then(() => done()); // eslint-disable-line
                } catch (e) {
                    done('failed');
                }
            });
            it('should not trow an error on directory path', function(done) {
                try {
                    atlas.build('./test/fixtures/atlas/').then(() => done()); // eslint-disable-line
                } catch (e) {
                    done('failed');
                }
            });
        });

        describe('Should not write file with not changed content', function() {
            const expectedFile = path.join(cwd, guideDest, 'category-component.html');

            beforeEach(function(done) {
                atlas.build(path.join(cwd, '/test/fixtures/atlas/category/_component.scss')).then(() => done()); // eslint-disable-line
            });

            it('should be written', function() {
                const generatedFile = fs.existsSync(expectedFile);
                assert.strictEqual(generatedFile, true, 'component file exitst');
                fs.unlinkSync(expectedFile);
            });

            it('should not be written', function() {
                const generatedFile = fs.existsSync(expectedFile);
                assert.strictEqual(generatedFile, false, 'component file not exitst');
            });
        });
    });

    describe('Components pages', function() {
        before(function(done) {
            atlas.build().then(() => done());
        });
        after(function() {
            fs.readdirSync(guideDest).forEach(item => {
                fs.unlinkSync(path.join(cwd, guideDest, item));
            });
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
            assert.deepStrictEqual(actualFiles, expected);
        });
    });
});
