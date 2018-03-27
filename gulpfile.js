'use strict';

const path = require('path');
const gulp = require('gulp');
const connect = require('gulp-connect');

const pathConfig = {
    'ui': {
        'core': {
            'resources': './',
            'sass': {
                'src': 'assets/src/scss/',
                'dest': 'assets/css/'
            }
        },
        'guide': {
            'resources': 'atlas/'
        },
        'lib': {
            'resources': ''
        }
    }
};

/*
 * Local server for static assets with live reload
 */

gulp.task('devServ:up', () => {
    const cors = (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    };

    return connect.server({
        root: [
            pathConfig.ui.core.resources,
            pathConfig.ui.guide.resources
        ],
        port: 5000,
        host: '127.0.0.1',
        livereload: {
            start: true,
            port: 9000
        },
        middleware() {
            return [cors];
        },
        https: true
    });
});

/*
 * Sass compilation
 */

let changedFilePath = '';
let generateFilePath = [];
let importsGraph;

const createImportsGraph = () => {
    importsGraph = require('sass-graph').parseDir(pathConfig.ui.core.sass.src, {
        loadPaths: [pathConfig.ui.lib.resources]
    });
};

/**
 * Configurable Sass compilation
 * @param {Object} config
 */
const sassCompile = config => {
    const sass = require('gulp-sass');
    const postcss = require('gulp-postcss');
    const autoprefixer = require('autoprefixer');
    const sourcemaps = require('gulp-sourcemaps');

    const postProcessors = [
        autoprefixer({
            flexbox: 'no-2009'
        })
    ];

    return gulp.src(config.source)
        .pipe(sourcemaps.init({
            loadMaps: true,
            largeFile: true
        }))
        .pipe(sass({
            includePaths: config.alsoSearchIn,
            sourceMap: false,
            outputStyle: 'compressed',
            indentType: 'tab',
            indentWidth: '1',
            linefeed: 'lf',
            precision: 10,
            errLogToConsole: true
        }))
        .on('error', function (error) {
            console.log('\x07');
            console.log('\x1b[35m' + error.message + '\x1b[0m');
            this.emit('end');
        })
        .pipe(postcss(postProcessors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest));
};

/**
 * Get file path that should be compiled
 * @param {string} changedFile - changed file path
 * @return {array} pathsArray - Array of strings. Path to the main scss files that
 * includes changed file.
 */
const getResultedFilesList = changedFile => {
    // Ensure that changed file is Sass file
    if (path.extname(changedFile) !== '.scss') {
        return [];
    }

    let resultedFilesPath = []; // used for compilation
    let resultedCSSPaths = []; // used for reload
    const getResultedCSSPath = path => path
        .replace(pathConfig.ui.core.sass.src, pathConfig.ui.core.sass.dest)
        .replace('.scss', '.css');

    if (!path.basename(changedFile).match(/^_/)) {
        resultedFilesPath.push(changedFile);
        resultedCSSPaths = [getResultedCSSPath(changedFile)];
        createImportsGraph(); // Rebuild imports graph
    } else {
        importsGraph.visitAncestors(changedFile, parent => {
            if (!path.basename(parent).match(/^_/)) {
                resultedFilesPath.push(parent);
                resultedCSSPaths.push(getResultedCSSPath(parent));
            }
        });
    }

    generateFilePath = resultedCSSPaths; // side effects is bad, find better solution
    return resultedFilesPath;
};

// Compile all Sass files
gulp.task('styles:compile:all', () => {
    return sassCompile({
        source: pathConfig.ui.core.sass.src + '*.scss',
        dest: pathConfig.ui.core.sass.dest,
        alsoSearchIn: [pathConfig.ui.lib.resources]
    });
});

// Compile only particular Sass file that has import of changed file
gulp.task('styles:compile:incremental', () => {
    return sassCompile({
        source: getResultedFilesList(changedFilePath),
        dest: pathConfig.ui.core.sass.dest,
        alsoSearchIn: [pathConfig.ui.lib.resources]
    });
});

// Compile all Sass files and watch for changes
gulp.task('styles:watch', () => {
    createImportsGraph();
    gulp.watch(
        pathConfig.ui.core.sass.src + '**/*.scss',
        ['devServ:reload:styles']
    ).on('change', event => {
        changedFilePath = event.path;
    });
});

// Reload the CSS links right after 'styles:compile:incremental' task is returned
gulp.task('devServ:reload:styles', ['styles:compile:incremental'], () =>
    gulp.src(generateFilePath) // css only reload
        .pipe(connect.reload()));

/*
 * Guide generation
 */
const atlas = require('./app/atlas-guide.js');

// Compile all components pages
// if installed it should be require('atlas-guide').buildAll();
gulp.task('atlas:compile', () => atlas.build());

// Compile particular page from the guide
gulp.task('atlas:compile:incremental', ['styles:compile:incremental'], () => atlas.build(changedFilePath));

// if installed it should be require('atlas-guide').buildAll();
gulp.task('atlas:compile:all', () => atlas.buildAll());

// Compile Guide and watch changes
gulp.task('atlas:watch', () => {
    createImportsGraph();
    gulp.watch(
        [pathConfig.ui.core.sass.src + '**/*.scss', pathConfig.ui.core.sass.src + '**/*.md'],
        ['devServ:reload:guide']
    ).on('change', event => {
        changedFilePath = event.path;
    });
});

// Reload the page right after 'atlas:compile:incremental' task is returned
gulp.task('devServ:reload:guide', ['atlas:compile:incremental'], () =>
    gulp.src(pathConfig.ui.guide.resources + '*.html') // full page reload
        .pipe(connect.reload()));

/*
 * Complex tasks
 */
gulp.task('default', '');
gulp.task('dev', ['devServ:up', 'styles:compile:all', 'styles:watch']);
// change to atlas:compile for regular projects, for our cases we compile all atlas in dev workflow
gulp.task('dev:atlas', ['devServ:up', 'styles:compile:all', 'atlas:compile:all', 'atlas:watch']);
gulp.task('build', ['styles:compile:all', 'atlas:compile:all']);
