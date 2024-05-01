import d3fmt from 'd3-format';

const formatNumbers = number => {
    if (!number) {
        return 0;
    }
    const length = number.toString().length;

    if (length > 4) {
        return d3fmt.format('.2s')(number);
    } else {
        return d3fmt.format(',')(number);
    }
};

const formatBytes = bytes => {
    const fmt = d3fmt.format('.0f');

    if (bytes < 1024) {
        return fmt(bytes) + 'B';
    } else if (bytes < 1024 * 1024) {
        return fmt(bytes / 1024) + 'kB';
    } else if (bytes < 1024 * 1024 * 1024) {
        return fmt(bytes / 1024 / 1024) + 'MB';
    } else {
        return fmt(bytes / 1024 / 1024 / 1024) + 'GB';
    }
};

export { formatNumbers, formatBytes }
