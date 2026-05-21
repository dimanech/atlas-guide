import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { setOptions, Renderer, marked } from 'marked';
import mustache from 'mustache';
const renderer = new Renderer();

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

setOptions({
    renderer: renderer,
    gfm: true,
    breaks: false,
    pedantic: false
});

const markdownTemplates = '../views/includes/markdown/';
const getFile = fileURL => fs.readFileSync(path.join(__dirname, fileURL), 'utf8');
const elements = {
    'heading': getFile(markdownTemplates + 'heading.mustache'),
    'example': getFile(markdownTemplates + 'example.mustache'),
    'code': getFile(markdownTemplates + 'code.mustache'),
    'hr': getFile(markdownTemplates + 'hr.mustache'),
    'paragraph': getFile(markdownTemplates + 'paragraph.mustache'),
    'ol': getFile(markdownTemplates + 'ol.mustache'),
    'ul': getFile(markdownTemplates + 'ul.mustache'),
    'table': getFile(markdownTemplates + 'table.mustache')
};

renderer.paragraph = function({ tokens }) {
    return mustache.render(elements.paragraph, {text: this.parser.parseInline(tokens)});
};

renderer.list = function(token) {
    let body = '';
    for (const item of token.items) {
        body += this.listitem(item);
    }
    const template = token.ordered ? elements.ol : elements.ul;
    return mustache.render(template, {body: body});
};

renderer.table = function(token) {
    let headerCells = '';
    for (const cell of token.header) {
        headerCells += this.tablecell(cell);
    }
    const header = this.tablerow({text: headerCells});
    let body = '';
    for (const row of token.rows) {
        let rowCells = '';
        for (const cell of row) {
            rowCells += this.tablecell(cell);
        }
        body += this.tablerow({text: rowCells});
    }
    return mustache.render(elements.table, {header: header, body: body});
};

renderer.hr = () => elements.hr;

/**
 * @typedef {Object} commentContent
 * @property {string} content comment content
 * @property {boolean} isNeedStat do we disable statistic for component
 */
/**
 * Get comment text from special type of CSS comment
 * @param {string} filePath
 * @return {commentContent}
 */
function getCommentContent(filePath) {
    const file = fs.readFileSync(filePath, 'utf8');
    const documentationCommentRegexp = /\/\*md(\r\n|\n)(((\r\n|\n)|.)*?)\*\//g;
    const statRegexp = /@no-stat(\r\n|\n)/g;
    const match = documentationCommentRegexp.exec(file);

    if (match !== null) {
        const fullContent = match[2];
        const isNeedStat = !statRegexp.test(fullContent);
        const strippedContent = fullContent.replace(statRegexp, '');

        return {
            content: isNeedStat ? fullContent : strippedContent,
            isNeedStat: isNeedStat
        };
    } else {
        const colorizeYellow = str => '\x1b[33m' + str + '\x1b[0m';
        console.warn(colorizeYellow('Warn: ') + 'Atlas: Content for import not found in ' + filePath);

        return {
            content: '',
            isNeedStat: false
        };
    }
}

function mdImport(fileURL, options) {
    options = options || {};

    let codeItemCount = 0;
    let content = '';
    let toc = [];
    let isNeedStat = false;

    // We need to keep renderers here because they changes page to page
    renderer.heading = function({ tokens, depth, text }) {
        const renderedText = this.parser.parseInline(tokens);
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        const heading = {
            text: renderedText,
            level: depth,
            escapedText: escapedText,
            isSection: depth <= 2
        };
        toc.push(heading);
        return mustache.render(elements.heading, heading);
    };

    renderer.code = ({ text, lang }) => {
        const language = lang === undefined ? '' : lang;

        const exampleMarkup = mustache.render(elements.example, {
            code: text,
            language: language.replace(/_example/, ''),
            title: options.title + '-code-' + codeItemCount
        });

        const regularMarkup = mustache.render(elements.code, {
            code: text,
            language: language.replace(/_.*$/, ''),
            class: language
        });

        codeItemCount += 1;
        return language === 'html_example' ? exampleMarkup : regularMarkup;
    };

    if (path.extname(fileURL) === '.md') {
        content = marked(fs.readFileSync(fileURL, 'utf8'));
    } else {
        const comment = getCommentContent(fileURL);
        isNeedStat = comment.isNeedStat;
        content = marked(comment.content);
    }

    return {
        content: content,
        toc: toc,
        isNeedStat: isNeedStat
    };
}

export default mdImport;
