export const splitNWrapText = (text, offset=50) => {
    const listOfText = text?.split('>') ?? [];
    const nListOfText = [];
    for(const nText of listOfText) {
        for(let i = 0; i < nText.length; i+=offset) {
            const subText = nText.substring(i, (i+1)*offset);
            nListOfText.push(subText);
        }
    }

    return nListOfText;
}

export const barcodeConfig = {
    x: 80,
    y: 230,
    height: 180,
    width: 5,
    textFontHeight: 12,
    textFontWidth: 8
};
