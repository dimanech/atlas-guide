import fs from 'node:fs';
import path from 'node:path';

export default function(text, render) {
    const resource = path.resolve(process.cwd(), render(text));
    if (fs.existsSync(resource)) {
        return fs.readFileSync(resource, 'utf8');
    } else {
        console.warn('[Atlas]: file to inline not found ' + resource);
    }
};
