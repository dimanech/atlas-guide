function selectorsListTops(array) {
    let selectorsList = array;
    let longestSelectors = [];

    selectorsList.forEach(list => {
        const selectorsArrayLength = list.split(/,/).length;
        if (selectorsArrayLength > 3) {
            longestSelectors.push({
                selector: list.replace(/,/g, ',<br>'),
                selectors: selectorsArrayLength
            });
        }
    });

    longestSelectors.sort((a, b) => b.selectors - a.selectors);

    return longestSelectors;
}

export default selectorsListTops;
