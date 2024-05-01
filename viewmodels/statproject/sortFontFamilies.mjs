import _uniq from 'lodash.uniq';

const sortFontFamilies = (values) => {
    let normalizedNames = [];

    values.forEach(item => normalizedNames.push(item.replace(/, /g, ',')));

    return _uniq(normalizedNames);
}

export default sortFontFamilies;
