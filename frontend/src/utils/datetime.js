export const formattedDateAndTime = (date) => {
    const formattedDate = date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: '2-digit'});
    const formattedTime = date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true});
    const formattedDateTime = `${formattedDate} ${formattedTime}`;
    return formattedDateTime;
}

export const formatDateToLong = (date) => date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: '2-digit'});

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

export const isValidDate = (dateString) => {
    // Check if the date string matches the format YYYY-MM-DD
    const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    // Parse the date string to a Date object
    const date = new Date(dateString);

    // Check if the Date object is valid
    if (isNaN(date.getTime())) {
        return false;
    }

    // Additional check: ensure the day, month, and year are correct
    const [year, month, day] = dateString.split('-').map(Number);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
        return false;
    }

    return true;
};

export const formatDateForHtmlInput = (date) => {
    // Ensure the date exists
    if (!date) return '';
    
    const fDate = new Date(date);
    const year = fDate.getFullYear();
    const month = String(fDate.getMonth() + 1).padStart(2, '0'); // Add 1 to get correct month
    const day = String(fDate.getDate()).padStart(2, '0'); // Use getDate for day of the month

    return `${year}-${month}-${day}`; // Format for HTML input
}; 