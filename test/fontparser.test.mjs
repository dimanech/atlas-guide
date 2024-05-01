/*
 Based on https://github.com/bramstein/css-font-parser
 */

import assert from 'node:assert';
import parse from '../models/componentstat/utils/cssfontparser.mjs';

describe('CSS Font parser', function() {
    it('returns null on invalid css font values', function() {
        assert.strictEqual(parse(''), null);
        assert.strictEqual(parse('Arial'), null);
        assert.strictEqual(parse('12px'), null);
        assert.strictEqual(parse('12px/16px'), null);
        assert.strictEqual(parse('bold 12px/16px'), null);
    });

    it('ignores non-terminated strings', function() {
        assert.strictEqual(parse('12px "Comic'), null);
        assert.strictEqual(parse('12px "Comic, serif'), null);
        assert.strictEqual(parse('12px \'Comic'), null);
        assert.strictEqual(parse('12px \'Comic, serif'), null);
    });

    it('parses a simple font specification correctly', function() {
        assert.deepStrictEqual(parse('12px serif'), {
            'font-size': '12px',
            'font-family': ['serif']
        });
    });

    it('returns multiple font families', function() {
        assert.deepStrictEqual(parse('12px Arial, Verdana, serif'), {
            'font-size': '12px',
            'font-family': ['Arial', 'Verdana', 'serif']
        });
    });

    it('handles quoted family names correctly', function() {
        assert.deepStrictEqual(parse('12px "Times New Roman"'), {
            'font-size': '12px',
            'font-family': ['Times New Roman']
        });
        assert.deepStrictEqual(parse('12px \'Times New Roman\''), {
            'font-size': '12px',
            'font-family': ['Times New Roman']
        });

        assert.deepStrictEqual(parse('12px "Times\\\' New Roman"'), {
            'font-size': '12px',
            'font-family': ['Times\\\' New Roman']
        });
        assert.deepStrictEqual(parse('12px \'Times\\" New Roman\''), {
            'font-size': '12px',
            'font-family': ['Times\\" New Roman']
        });

        assert.deepStrictEqual(parse('12px "Times\\" New Roman"'), {
            'font-size': '12px',
            'font-family': ['Times\\" New Roman']
        });
        assert.deepStrictEqual(parse('12px \'Times\\\' New Roman\''), {
            'font-size': '12px',
            'font-family': ['Times\\\' New Roman']
        });
    });

    it('handles unquoted identifiers correctly', function() {
        assert.deepStrictEqual(parse('12px Times New Roman'), {
            'font-size': '12px',
            'font-family': ['Times New Roman']
        });
        assert.deepStrictEqual(parse('12px Times New Roman, Comic Sans MS'), {
            'font-size': '12px',
            'font-family': ['Times New Roman', 'Comic Sans MS']
        });
    });

    // Examples taken from: http://mathiasbynens.be/notes/unquoted-font-family
    it('correctly returns null on invalid identifiers', function() {
        assert.strictEqual(parse('12px Red/Black'), null);
        assert.strictEqual(parse('12px \'Lucida\' Grande'), null);
        assert.strictEqual(parse('12px Ahem!'), null);
        assert.strictEqual(parse('12px Hawaii 5-0'), null);
        // assert.strictEqual(parse('12px $42'), null); // remove this because $ is variable identifier in scss
    });

    it('correctly parses escaped characters in identifiers', function() {
        assert.deepStrictEqual(parse('12px Red\\/Black'), {'font-size': '12px', 'font-family': ['Red\\/Black']});
        assert.deepStrictEqual(parse('12px Lucida    Grande'), {'font-size': '12px', 'font-family': ['Lucida Grande']});
        assert.deepStrictEqual(parse('12px Ahem\\!'), {'font-size': '12px', 'font-family': ['Ahem\\!']});
        assert.deepStrictEqual(parse('12px \\$42'), {'font-size': '12px', 'font-family': ['\\$42']});
        assert.deepStrictEqual(parse('12px €42'), {'font-size': '12px', 'font-family': ['€42']});
    });

    it('correctly parses font-size', function() {
        assert.deepStrictEqual(parse('12px serif'), {'font-size': '12px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('xx-small serif'), {'font-size': 'xx-small', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('s-small serif'), {'font-size': 's-small', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('small serif'), {'font-size': 'small', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('medium serif'), {'font-size': 'medium', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('large serif'), {'font-size': 'large', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('x-large serif'), {'font-size': 'x-large', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('xx-large serif'), {'font-size': 'xx-large', 'font-family': ['serif']});

        assert.deepStrictEqual(parse('larger serif'), {'font-size': 'larger', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('smaller serif'), {'font-size': 'smaller', 'font-family': ['serif']});
    });

    it('correctly parses lengths', function() {
        assert.deepStrictEqual(parse('1px serif'), {'font-size': '1px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1em serif'), {'font-size': '1em', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1ex serif'), {'font-size': '1ex', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1ch serif'), {'font-size': '1ch', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1rem serif'), {'font-size': '1rem', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1vh serif'), {'font-size': '1vh', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1vw serif'), {'font-size': '1vw', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1vmin serif'), {'font-size': '1vmin', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1vmax serif'), {'font-size': '1vmax', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1mm serif'), {'font-size': '1mm', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1cm serif'), {'font-size': '1cm', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1in serif'), {'font-size': '1in', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1pt serif'), {'font-size': '1pt', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1pc serif'), {'font-size': '1pc', 'font-family': ['serif']});
    });

    it('returns null when it fails to parse a font-size', function() {
        assert.strictEqual(parse('1 serif'), null);
        assert.strictEqual(parse('xxx-small serif'), null);
        assert.strictEqual(parse('1bs serif'), null);
        assert.strictEqual(parse('100 % serif'), null);
    });

    it('correctly parses percentages', function() {
        assert.deepStrictEqual(parse('100% serif'), {'font-size': '100%', 'font-family': ['serif']});
    });

    it('correctly parses numbers', function() {
        assert.deepStrictEqual(parse('1px serif'), {'font-size': '1px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('1.1px serif'), {'font-size': '1.1px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('-1px serif'), {'font-size': '-1px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('-1.1px serif'), {'font-size': '-1.1px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('+1px serif'), {'font-size': '+1px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('+1.1px serif'), {'font-size': '+1.1px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('.1px serif'), {'font-size': '.1px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('+.1px serif'), {'font-size': '+.1px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('-.1px serif'), {'font-size': '-.1px', 'font-family': ['serif']});
    });

    it('returns null when it fails to parse a number', function() {
        assert.deepStrictEqual(parse('12.px serif'), null);
        assert.deepStrictEqual(parse('+---12.2px serif'), null);
        assert.deepStrictEqual(parse('12.1.1px serif'), null);
        assert.deepStrictEqual(parse('10e3px serif'), null);
    });

    it('correctly parses line-height', function() {
        assert.deepStrictEqual(parse('12px/16px serif'), {
            'font-size': '12px',
            'line-height': '16px',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('12px/1.5 serif'), {
            'font-size': '12px',
            'line-height': '1.5',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('12px/normal serif'), {'font-size': '12px', 'font-family': ['serif']});
        assert.deepStrictEqual(parse('12px/105% serif'), {
            'font-size': '12px',
            'line-height': '105%',
            'font-family': ['serif']
        });
    });

    it('correctly parses font-style', function() {
        assert.deepStrictEqual(parse('italic 12px serif'), {
            'font-size': '12px',
            'font-style': 'italic',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('oblique 12px serif'), {
            'font-size': '12px',
            'font-style': 'oblique',
            'font-family': ['serif']
        });
    });

    it('correctly parses font-variant', function() {
        assert.deepStrictEqual(parse('small-caps 12px serif'), {
            'font-size': '12px',
            'font-variant': 'small-caps',
            'font-family': ['serif']
        });
    });

    it('correctly parses font-weight', function() {
        assert.deepStrictEqual(parse('bold 12px serif'), {
            'font-size': '12px',
            'font-weight': 'bold',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('bolder 12px serif'), {
            'font-size': '12px',
            'font-weight': 'bolder',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('lighter 12px serif'), {
            'font-size': '12px',
            'font-weight': 'lighter',
            'font-family': ['serif']
        });

        for (let i = 1; i < 10; i += 1) {
            assert.deepStrictEqual(parse(i * 100 + ' 12px serif'), {
                'font-size': '12px',
                'font-weight': '' + i * 100, // because buffer is an string
                'font-family': ['serif']
            });
        }
    });

    it('correctly parses font-stretch', function() {
        assert.deepStrictEqual(parse('ultra-condensed 12px serif'), {
            'font-size': '12px',
            'font-stretch': 'ultra-condensed',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('extra-condensed 12px serif'), {
            'font-size': '12px',
            'font-stretch': 'extra-condensed',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('condensed 12px serif'), {
            'font-size': '12px',
            'font-stretch': 'condensed',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('semi-condensed 12px serif'), {
            'font-size': '12px',
            'font-stretch': 'semi-condensed',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('semi-expanded 12px serif'), {
            'font-size': '12px',
            'font-stretch': 'semi-expanded',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('expanded 12px serif'), {
            'font-size': '12px',
            'font-stretch': 'expanded',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('extra-expanded 12px serif'), {
            'font-size': '12px',
            'font-stretch': 'extra-expanded',
            'font-family': ['serif']
        });
        assert.deepStrictEqual(parse('ultra-expanded 12px serif'), {
            'font-size': '12px',
            'font-stretch': 'ultra-expanded',
            'font-family': ['serif']
        });
    });
});
