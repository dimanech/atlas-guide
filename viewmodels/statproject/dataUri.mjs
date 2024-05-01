import { formatBytes } from '../utils/format.mjs';

const dataUri = (background, backgroundImage, fontFaces) => {
    const props = [].concat(background).concat(backgroundImage).concat(fontFaces.src);
    const dataUri = {
        'total': {
            raw: 0,
            fmt: 0,
            count: 0
        },
        'data': []
    };
    const normalizeCSSString = str => str.replace(/^['"\s]*/, '').replace(/['"\s]*$/, '').replace(/['"]/g, '%22');

    props.forEach(value => {
        if (/data:/g.test(value)) {
            const uriString = /\((.*?)\)/.exec(value)[1];
            const size = Buffer.byteLength(uriString, 'utf8');
            dataUri.data.push({
                sizeRaw: size,
                size: formatBytes(size),
                type: /data:(.*?)\//.exec(uriString)[1],
                typeRaw: /data:(.*?),/.exec(uriString)[1],
                displayValue: /data:image/.test(uriString) ? normalizeCSSString(uriString) : ''
            });
        }
    });

    dataUri.data.sort((a, b) => b.sizeRaw - a.sizeRaw);

    dataUri.total.count = dataUri.data.length;
    dataUri.data.forEach(item => {
        dataUri.total.raw += item.sizeRaw;
    });
    dataUri.total.fmt = formatBytes(dataUri.total.raw);

    return dataUri;
}

export default dataUri;
