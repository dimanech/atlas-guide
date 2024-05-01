import path from 'node:path';
const cwd = process.cwd();

export default function(url) {
    if (url !== undefined) {
        return path.isAbsolute(url) ? url : path.join(cwd, url);
    } else {
        return url;
    }
}
