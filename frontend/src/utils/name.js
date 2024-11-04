import TitleFormat from '@/utils/titleFormat';

export const createFullname = (firstname, lastname) => {
    if(!firstname || !lastname) return '';
    const fName = TitleFormat(firstname);
    const lName = TitleFormat(lastname);
    const fullName = fName + ' ' + lName;

    return fullName;
}