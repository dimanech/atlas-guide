'use strict';

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const mustache = require('mustache');
const renderer = new marked.Renderer();

marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
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

renderer.paragraph = text => mustache.render(elements.paragraph, {text: text});

renderer.list = (body, ordered) => {
    const ol = mustache.render(elements.ol, {body: body});
    const ul = mustache.render(elements.ul, {body: body});

    return ordered ? ol : ul;
};

renderer.table = (header, body) => mustache.render(elements.table, {header: header, body: body});

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
    renderer.heading = (text, level) => {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        const heading = {
            text: text,
            level: level,
            escapedText: escapedText,
            isSection: level <= 2
        };
        toc.push(heading);
        return mustache.render(elements.heading, heading);
    };

    renderer.code = (code, language) => {
        if (language === undefined) {
            language = '';
        }

        const exampleMarkup = mustache.render(elements.example, {
            code: code,
            language: language.replace(/_example/, ''),
            title: options.title + '-code-' + codeItemCount
        });

        const regularMarkup = mustache.render(elements.code, {
            code: code,
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

module.exports = mdImport;
