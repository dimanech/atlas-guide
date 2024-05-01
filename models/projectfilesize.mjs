import fs from 'node:fs';
import path from 'node:path';
import { format } from 'd3-format';
import { getFileSizeWithoutComments } from './utils/fileSize.mjs';

const prepareComponentsFileSizesStat = (guideSrc) => {
    let sizes = [];

    const findComponents = (url) => {
        const dir = fs.readdirSync(url);

        for (let i = 0; i < dir.length; i++) {
            const name = dir[i];
            const target = path.join(url, name);
            const stats = fs.statSync(target);

            if (stats.isFile()) {
                if (path.extname(name) === '.scss') {
                    const fileSize = getFileSizeWithoutComments(target);
                    sizes.push({
                        filename: path.basename(name),
                        size: fileSize,
                        view: {
                            size: format('.2s')(fileSize) + 'B'
                        },
                        svg: {
                            radius: '',
                            width: ''
                        }
                    });
                }
            } else if (stats.isDirectory()) {
                findComponents(target);
            }
        }
    }

    findComponents(guideSrc);

    return sizes;
};

export default prepareComponentsFileSizesStat;
