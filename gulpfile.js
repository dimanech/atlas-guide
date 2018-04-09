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

let changedFilePath = '';
let affectedFilesPaths = [];
let importsGraph;

/*
 * Local server for static assets with live reload
 */

gulp.task('server:up', done => {
    const cors = (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    };

    connect.server({
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

    done();
});

// We have 2 separate tasks for reload because in one case 1) we need to reload only styles
// in other – full page reload; 2) after styles compiled wait for atlas compilation, – in other
// reload immediate.

// Reload the CSS links right after 'styles:compile:incremental' task is returned
gulp.task('server:reload:styles', () =>
    gulp.src(affectedFilesPaths) // css only reload
        .pipe(connect.reload()));

// Reload the page right after 'atlas:compile:incremental' task is returned
gulp.task('server:reload:guide', () =>
    gulp.src(pathConfig.ui.guide.resources + '*.html') // full page reload
        .pipe(connect.reload()));

/*
 * Sass compilation
 */

const notifyChange = path => {
    changedFilePath = path;
    console.log(`[CHANGED:] \x1b[32m${path}\x1b[0m`);
};

const createImportsGraph = function () {
    importsGraph = require('sass-graph').parseDir(
        pathConfig.ui.core.sass.src,
        {loadPaths: [pathConfig.ui.lib.resources]}
    );
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

    console.log(`[COMPILE:] \x1b[35m${config.source}\x1b[0m`);

    return gulp.src(config.source, {allowEmpty: true})
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
            console.error('\x1b[35m' + error.message + '\x1b[0m');
            this.emit('end');
        })
        .pipe(postcss(postProcessors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest));
};

/**
 * Get list of files that affected by changed file
 * @param {string} changedFile - changed file path
 * @return {array} pathsArray - Array of strings. Path to the main scss files that includes changed file.
 */
const getAffectedSassFiles = changedFile => {
    // Ensure that changed file is Sass file
    if (path.extname(changedFile) !== '.scss') {
        return ['not.scss'];
    }

    let resultedFilesPaths = []; // used for compilation
    let resultedCSSPaths = []; // used for reload
    const getResultedCSSPath = path => path
        .replace(pathConfig.ui.core.sass.src, pathConfig.ui.core.sass.dest)
        .replace('.scss', '.css');

    if (path.basename(changedFile).match(/^_/)) {
        importsGraph.visitAncestors(changedFile, parent => {
            if (!path.basename(parent).match(/^_/)) {
                resultedFilesPaths.push(parent);
                resultedCSSPaths.push(getResultedCSSPath(parent));
            }
        });
    } else {
        resultedFilesPaths.push(changedFile);
        resultedCSSPaths = [getResultedCSSPath(changedFile)];
        createImportsGraph(); // Rebuild imports graph
    }

    affectedFilesPaths = resultedCSSPaths; // Used to reload styles. Not very good, better solution should be found
    // return passed path if file not listed in graph and it is partial
    return resultedFilesPaths.length === 0 ? [changedFile] : resultedFilesPaths;
};

// Compile all Sass files
gulp.task('styles:compile:all', () => sassCompile({
    source: pathConfig.ui.core.sass.src + '*.scss',
    dest: pathConfig.ui.core.sass.dest,
    alsoSearchIn: [pathConfig.ui.lib.resources]
}));

// Compile only particular Sass file that has import of changed file
gulp.task('styles:compile:incremental', () => sassCompile({
    source: getAffectedSassFiles(changedFilePath),
    dest: pathConfig.ui.core.sass.dest,
    alsoSearchIn: [pathConfig.ui.lib.resources]
}));

// Compile all Sass files and watch for changes
gulp.task('styles:watch', done => {
    createImportsGraph();
    gulp.watch(
        pathConfig.ui.core.sass.src + '**/*.scss',
        gulp.series('styles:compile:incremental', 'server:reload:styles')
    ).on('change', notifyChange);
    done();
});

/*
 * Guide generation
 */
// if installed it should be require('atlas-guide');
const atlas = require('./app/atlas-guide.js');

// Compile all components pages
gulp.task('atlas:compile', done => atlas.build().then(done()));

// Compile particular page from the guide
gulp.task('atlas:compile:incremental', done => atlas.build(changedFilePath).then(done()));

gulp.task('atlas:compile:all', done => atlas.buildAll().then(done()));

// Compile Guide and watch changes
gulp.task('atlas:watch', done => {
    createImportsGraph();
    gulp.watch(
        [pathConfig.ui.core.sass.src + '**/*.scss', pathConfig.ui.core.sass.src + '**/*.md'],
        gulp.series('styles:compile:incremental', 'atlas:compile:incremental', 'server:reload:guide')
    ).on('change', notifyChange);
    return done();
});

/*
 * Complex tasks
 */
gulp.task('dev', gulp.parallel('server:up', 'styles:compile:all', 'styles:watch'));
// change to atlas:compile for regular projects, for our cases we compile all atlas in dev workflow
gulp.task('dev:atlas', gulp.parallel('server:up', 'styles:compile:all', 'atlas:compile:all', 'atlas:watch'));
gulp.task('build', gulp.parallel('styles:compile:all', 'atlas:compile:all'));
