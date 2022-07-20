# Contributing to Atlas guide

## Code Contribution

### Installation and preparation

1. `npm install`
2. `npm run copyhooks` (Needs to be run only once after `git clone`. This will install git hooks)
3. Check editor config, linting plugins

### Workflow

To regular workflow run `gulp dev:atlas` to start local server and compile all guide and stats.

To work only with styles run `gulp dev` to start local server with hot reload only of CSS files.

### Debug

Debug with VSCode. Please add this configuration to the `launch.json`:

```json
{
   "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch via NPM",
            "runtimeExecutable": "npm",
            "runtimeArgs": [ "run-script", "debug" ],
            "port": 9229
        }
    ]
}
``` 

Debug with WebStorm. Add this configuration to Run | Edit Configuration... > Node.js

```
Node parameters:        --inspect
Working directory:      <you dir>
JavaScript file:        ./bin/atlas-guide.js
Application parameters: --build
```

Additional resources: [VSCode](https://code.visualstudio.com/docs/nodejs/nodejs-debugging), [WebStorm](https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html)

### Run tests

To run test please lunch `npm run test`. Please note that tests not contains stubs and use real FS for all files manipulation.
