import inline from './templateHelpers/inline.mjs';
import pluralize from './templateHelpers/pluralize.mjs';

export const prepareView = (projectInfo, subPages) => {
    const View = function(config) {
        this.projectInfo = {
            name: projectInfo.name,
            version: projectInfo.version
        };
        this.title = config.title;
        this.content = config.content;
        this.type = config.type;
        this.isDeprecated = config.isDeprecated;
        this.subPages = subPages.subPages;
    };

    View.prototype.inline = () => (text, render) => inline(text, render);
    View.prototype.pluralize = () => (text, render) => pluralize(text, render);

    return { view: config => new View(config) };
};
