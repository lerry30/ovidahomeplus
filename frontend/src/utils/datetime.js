export const formattedDateAndTime = (date) => {
    const formattedDate = date.toLocaleDateString('en-AU', {year: 'numeric', month: 'short', day: '2-digit'});
    const formattedTime = date.toLocaleTimeString('en-AU', {hour: 'numeric', minute: '2-digit', hour12: true});
    const formattedDateTime = `${formattedDate} ${formattedTime}`;
    return formattedDateTime;
}

export const formattedDate = (date) => {
    const dateParts = new Intl.DateTimeFormat('en-AU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);

    return `${dateParts.find(part => part.type === 'year').value}-${
        dateParts.find(part => part.type === 'month').value}-${
        dateParts.find(part => part.type === 'day').value}`;
}

export const areDatesEqual = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

export const formatTimeFromString = (timeString) => {
    const [hoursStr, minutes] = timeString.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${hours}:${minutes} ${ampm}`;
}