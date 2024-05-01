# Set up compilation and live reload

Since Atlas is static page generator it is not provide any functionality for serving, livereloading and development setup.
This intended to not depends on project infrastructure.

This page is also example of how regular markdown files will be used to create guideline page.

## Atlas compilation with gulp

Atlas designed as styleguide-driven-development tool and has 3 variants of work:

1. single page generation
2. all components page generation
3. reports generation

With this you could achieve speed and performance with development tasks.

### Standard workflow - generate all components and rebuild single page

For standard development flow you need:

1. generate all components on start (because it could be changed from last running)
2. rebuild changed page when source file is changed

This two tasks could be easily achieved with gulp:

```js
let generateFilePath = [];
import atlasGuide from 'atlas-guide';
const atlas = atlasGuide('./.atlasrc.json');

// Build all components pages
gulp.task('atlas:compile', () => atlas.build());

// Compile particular page from the guide, but before compile changed styles
gulp.task('atlas:compile:incremental', ['styles:compile:incremental'], () => atlas.build(changedFilePath)); // rebuild only changed file);

// Compile Guide and watch changes
gulp.task('atlas:watch', () => {
    createImportsGraph(); // used for incremental sass compilation
    gulp.watch(
        [pathConfig.ui.core.sass.src + '**/*.scss', pathConfig.ui.core.sass.src + '**/*.md'], // watch for sass and md files
        ['devServ:reload:guide']
    ).on('change', event => {
        changedFilePath = event.path;
    });
});

// 1. compile all sass
// 2. build all components pages on start only
// 3. watch for changes and rebuild particular page
gulp.task('dev:guide', ['styles:compile:all', 'atlas:compile', 'atlas:watch']);
```

No need to say that for some cases this workflow could be organized even aggressive – when only changed page will be generated from start.

### Deploy workflow - generate all pages and reports

You probably don't need reports and all global statistic on daily work. By this reasons this tasks is moved to separate functions.

To build all pages and statistics you could use several way - npm scripts, regular js and task runners.
We show most simple way, by using CLI.

#### CLI

```json
{
  "scripts": {
    "build:guide": "atlas-guide --build=./.atlasrc.json"
  }
}
```

But if you use it with deploy you probably need to build all scss before build atlas. So it would look like this:

```json
{
  "scripts": {
    "build:guide": "node-sass /path/to/scss -o /path/to/css --output-style compressed && atlas-guide --build=./.atlasrc.json"
  }
}
```

#### Gulp

This also could be achieved with gulp:

```js
gulp.task('atlas:compile:all', () => {
    return atlasGuide('./.atlasrc.json').buildAll();
});
gulp.task('build', ['styles:compile:all', 'atlas:compile:all']);
```

so npm scripts could be changed to this:

```json
{
  "scripts": {
    "build:guide": "gulp build"
  }
}
```

## Incremental sass compilation

The first and the most problem that you faced when you start to work with many components that bundled to many separate files is that it is not trivial to compile only changed files in gulp.

Naive approach to pass all scss files overload the whole system and decrease development flow performance.
All unneeded files are compiled, uploaded and reloaded on each single file change.

This is not trivial to guess relation of sass files. Nor sass, neither node wrapper not provide any info about imports path (node-sass "native" watch use dependency graph to compile only needed files).
So for this case we need to build custom imports graph from our project. Lucky we have tool called `sass-graph` that could be used to get this graph.

### Building sass imports graph

So as the first step we need to create dependency graph on each task-runner start.

```js
import sassGraph from 'sass-graph';
let importsGraph;

const createImportsGraph = function() {
    importsGraph = sassGraph.parseDir(pathConfig.ui.core.sass.src, {
        loadPaths: [pathConfig.ui.lib.resources]
    });
};
```

### Get affected file path

The second step is to get the path to the standalone file that imports particular changed file.

```js
/**
 * Get file path that should be compiled
 * @param {string} changedFile - changed file path
 * @return {array} pathsArray - Array of strings. Path to the main scss files that
 * includes changed file.
 */
const getResultedFilesList = changedFile => {
    if (path.extname(changedFile) !== '.scss') {
        return [];
    }

    let resultedFilesPath = [];

    if (!path.basename(changedFile).match(/^_/)) {
        resultedFilesPath.push(changedFile);
        createImportsGraph(); // Rebuild imports graph since standalone files could contain new imports after change
    } else {
        importsGraph.visitAncestors(changedFile, parent => { // get all files that have imports of changed file
            if (!path.basename(parent).match(/^_/)) {
                resultedFilesPath.push(parent);
            }
        });
    }

    return resultedFilesPath;
};
```

To deal with tasks relations in gulp we need to add another variable to this function to get resulted files that we need to reload (this needed if you need to reload only css or the whole page):

```js
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

    generateFilePath = resultedCSSPaths;
    return resultedFilesPath;
};
```

### Compile sass

And the sass compilation:

```js
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import gulpPostcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import gulpSourcemaps from 'gulp-sourcemaps';

/**
 * Configurable Sass compilation
 * @param {Object} config
 */
const sassCompile = config => {
    const postProcessors = [
        autoprefixer({
            flexbox: 'no-2009'
        })
    ];

    console.log(`[COMPILE:] \x1b[35m${config.source}\x1b[0m`);

    return gulp.src(config.source, {allowEmpty: true})
        .pipe(gulpSourcemaps.init({
            loadMaps: true,
            largeFile: true
        }))
        .pipe(gulpSass(dartSass)({
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
        .pipe(gulpPostcss(postProcessors))
        .pipe(gulpSourcemaps.write('.'))
        .pipe(gulp.dest(config.dest));
};
```

### Gulp setup

And the gulp tasks that glue all together.
For this we use approach with global vars that store state that is conceptually not a part of gulp approach, but it is most simple solution.

```js
let changedFilePath = '';
let generateFilePath = [];
let importsGraph;

// all mentioned below stuff

gulp.task('styles:compile:all', () => {
    return sassCompile({
        source: pathConfig.ui.core.sass.src + '*.scss', // compile all files
        dest: pathConfig.ui.core.sass.dest,
        alsoSearchIn: [pathConfig.ui.lib.resources]
    });
});

gulp.task('styles:compile:incremental', () => {
    return sassCompile({
        source: getResultedFilesList(changedFilePath), // compile only changed files array
        dest: pathConfig.ui.core.sass.dest,
        alsoSearchIn: [pathConfig.ui.lib.resources]
    });
});

gulp.task('styles:watch', () => {
    createImportsGraph();
    gulp.watch(
        pathConfig.ui.core.sass.src + '**/*.scss',
        ['devServ:reload:styles']
    ).on('change', event => {
        changedFilePath = event.path; // when event is fired we store changed file path to global var that we use in styles:compile:incremental
    });
});
```

## Live reload with gulp and connect

Live reload could be easily setup with gulp and connect. All you need is one single plugin `gulp-connect` that have both `connect` and `connect-liverelod` out of the box.

### Setup local server

First of all you need to setup local server and serve all your project static resources.
We serve both Atlas and project assets (so we could use livereload on live project with few simple steps):

```
root: [
    pathConfig.ui.core.resources,
    pathConfig.ui.guide.resources
],
```

Than you need to workaround for CORS and https (that probably used on your project).

```js
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
```

### Reload page or scss on resource change

To make livereload works you need to trigger `connect.reload()` after file is changed. This could be done both as pipe:

```
...
.pipe(connect.reload())
```

or standalone task:

```js
gulp.task('devServ:reload:styles', ['styles:compile:incremental'], function () {
    return gulp.src(generateFilePath) // css only reload when /path/to/file.css is passed to the `src`
        .pipe(connect.reload());
});
```

Depending of what resource is passed to the stream the whole html or single scss will be reloaded.
You need to count this to organize proper flow.

### Tasks sequences in gulp

To proper organize live-reloading you need to run you task in sequence "change css" -> "build atlas page" -> "reload atlas".

One thing that you should know about gulp that all tasks by default runs in parallel rather in sequences.

With gulp 3 you could use several ways to organize your tasks into sequences - 2nd argument of `task()` or use `gulp-sequences` plugin.
In gulp 4 sequences is the standard feature.

Gulp 3 build in sequences:

```js

// Reload the CSS links right after 'styles:compile:incremental' task is returned
gulp.task('devServ:reload:styles', ['styles:compile:incremental'], () =>
    gulp.src(generateFilePath) // css only reload
        .pipe(connect.reload()));

// Reload the page right after 'atlas:compile:incremental' task is returned
gulp.task('devServ:reload:guide', ['atlas:compile:incremental'], () =>
    gulp.src(pathConfig.ui.guide.resources + '*.html') // full page reload
        .pipe(connect.reload()));
```

So tasks structure should be like this:

```
gulp.task('styles:compile:incremental', ...)
gulp.task('devServ:reload:styles', ['styles:compile:incremental'], ...)

gulp.task('atlas:compile:incremental', ['styles:compile:incremental'], ...)
gulp.task('devServ:reload:guide', ['atlas:compile:incremental'], ...)
```

If you use all this stuff as separate tasks you need to pass

and complex tasks:

```js
gulp.task('dev', ['devServ:up', 'styles:compile:all', 'styles:watch']);
gulp.task('dev:atlas', ['devServ:up', 'styles:compile:all', 'atlas:compile:all', 'atlas:watch']);
```

#### Gulp 4 example

```js
gulp.task('styles:watch', done => {
    createImportsGraph();
    gulp.watch(
        pathConfig.ui.core.sass.src + '**/*.scss',
        gulp.series('styles:compile:incremental', 'server:reload:styles')
    ).on('change', notifyChange);
    done();
});

gulp.task('atlas:watch', done => {
    createImportsGraph();
    gulp.watch(
        [pathConfig.ui.core.sass.src + '**/*.scss', pathConfig.ui.core.sass.src + '**/*.md'],
        gulp.series('styles:compile:incremental', 'atlas:compile:incremental', 'server:reload:guide')
    ).on('change', notifyChange);
    return done();
});
```

### Setup livereload on production site

To use livereload on "remote" or sandbox instance you could use the described setup without any changes.
The idea is instead of site resource use local resource trigger reload as always.

Just add to your templates:

```html
<?php if ($useLocal): ?>
    <link rel="stylesheet" type="text/css" href="https://127.0.0.1:5000/style.css" />
<?php else: ?>
    <link rel="stylesheet" type="text/css" href="path/to/style.css" />
<?php endif; ?>
```

and in footer

```html
<?php if ($useLocal): ?>
    <script src="https://127.0.0.1:9000/livereload.js"></script>
<?php endif; ?>
```

Than you could set using local resource innsted of site resource by http parameter or cookie.

***

Please see this project gulp file to get the idea how live reload and incremental scss compilation could be organized.

`gulp3` example could be found in [84fb58a](https://github.com/dimanech/atlas-guide/blob/84fb58a48d1ce78aa978ece46e96b8da6a3fcd57/gulpfile.js)
