import fs from 'node:fs';
import mustache from 'mustache';
import {prepareView} from './prepareview.mjs';

export default function writepage(atlasConfig, subPages) {
    const view = prepareView(atlasConfig.projectInfo, subPages).view;

    const cachedTemplates = {
        'component': fs.readFileSync(atlasConfig.templates.component, 'utf8'),
        'guide': fs.readFileSync(atlasConfig.templates.guide, 'utf8')
    };

    const getCachedTemplates = type => {
        switch (type) {
            case 'guide':
                return cachedTemplates.guide;
            case 'component':
            case 'container':
                return cachedTemplates.component;
            default:
                return fs.readFileSync(atlasConfig.templates[type], 'utf8');
        }
    };

    const cachePartials = partials => {
        let partialsStrings = {};

        Object.keys(partials).forEach(partial => {
            partialsStrings[partial] = fs.readFileSync(partials[partial], 'utf8');
        });

        return partialsStrings;
    };

    const cachedPartials = cachePartials(atlasConfig.partials);

    const writePage = function(config) {
        return new Promise(
            (resolve, reject) => fs.writeFile(
                config.target,
                mustache.render(
                    getCachedTemplates(config.template),
                    view(config),
                    cachedPartials
                ),
                error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve('Page saved');
                    }
                }
            )
        );
    };

    return { writePage };
}
