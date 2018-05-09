'use strict';

const path = require('path');
const basePath = process.cwd().replace(/\\/, '\\');
const pathSep = path.sep !== '/' ? '\\' : '/';

const deepTree = `{
    "dir": "${basePath}${pathSep}",
    "index": {
        "${basePath}${pathSep}standalone-1.scss": {
            "imports": [
                "${basePath}${pathSep}components${pathSep}_index.scss"
            ]
        },
        "${basePath}${pathSep}components${pathSep}foo${pathSep}_bar.scss": {
            "imports": []
        },
        "${basePath}${pathSep}components${pathSep}_index.scss": {
            "imports": [
                "${basePath}${pathSep}components${pathSep}foo${pathSep}_bar.scss"
            ]
        }
    }
}`;

const deepTreeMultipleLevels = `{
    "dir": "${basePath}${pathSep}",
    "index": {
        "${basePath}${pathSep}standalone-1.scss": {
            "imports": [
                "${basePath}${pathSep}components${pathSep}_index.scss"
            ]
        },
        "${basePath}${pathSep}components${pathSep}standalone-2.scss": {
            "imports": [
                "${basePath}${pathSep}components${pathSep}_index.scss"
            ]
        },
        "${basePath}${pathSep}components${pathSep}else${pathSep}standalone-3.scss": {
            "imports": [
                "${basePath}${pathSep}components${pathSep}_index.scss"
            ]
        },
        "${basePath}${pathSep}components${pathSep}foo${pathSep}_bar.scss": {
            "imports": []
        },
        "${basePath}${pathSep}components${pathSep}_index.scss": {
            "imports": [
                "${basePath}${pathSep}components${pathSep}foo${pathSep}_bar.scss"
            ]
        }
    }
}`;

const flatTree = `{
    "dir": "${basePath}${pathSep}",
    "index": {
        "${basePath}${pathSep}standalone-1.scss": {
            "imports": [
                "${basePath}${pathSep}components${pathSep}_foo.scss",
                "${basePath}${pathSep}components${pathSep}_bar.scss"
            ]
        },
        "${basePath}${pathSep}standalone-2.scss": {
            "imports": [
                "${basePath}${pathSep}components${pathSep}_foo.scss",
                "${basePath}${pathSep}components${pathSep}_bar.scss"
            ]
        },
        "${basePath}${pathSep}components${pathSep}_foo.scss": {
            "imports": []
        },
        "${basePath}${pathSep}components${pathSep}_bar.scss": {
            "imports": []
        }
    }
}`;

const flatTreeExcludes = `{
    "dir": "${basePath}${pathSep}",
    "index": {
        "${basePath}${pathSep}standalone-1.scss": {
            "imports": [
                "${basePath}${pathSep}components${pathSep}_excluded.scss",
                "${basePath}${pathSep}components${pathSep}_foo.scss",
                "${basePath}${pathSep}components${pathSep}_bar.scss"
            ]
        },
        "${basePath}${pathSep}standalone-2.scss": {
            "imports": [
                "${basePath}${pathSep}_excluded-file.scss",
                "${basePath}${pathSep}components${pathSep}_foo.scss",
                "${basePath}${pathSep}components${pathSep}_bar.scss"
            ]
        },
        "${basePath}${pathSep}components${pathSep}_foo.scss": {
            "imports": []
        },
        "${basePath}${pathSep}components${pathSep}_bar.scss": {
            "imports": []
        },
        "${basePath}${pathSep}components${pathSep}_excluded.scss": {
            "imports": []
        },
        "${basePath}${pathSep}_excluded-file.scss": {
            "imports": []
        }
    }
}`;

module.exports = {
    flatTree: JSON.parse(flatTree),
    deepTree: JSON.parse(deepTree),
    flatTreeExcludes: JSON.parse(flatTreeExcludes),
    deepTreeMultipleLevels: JSON.parse(deepTreeMultipleLevels)
};
