export const quickSortObj = (arr, key) => {
    if (arr.length <= 1) {
        return arr; // Base case: arrays with 0 or 1 element are already sorted
    }

    const pivot = arr[arr.length - 1]; // Choose the last element as the pivot
    const left = []; // Elements less than the pivot
    const right = []; // Elements greater than the pivot

    for (let i = 0; i < arr.length - 1; i++) { // Loop through all elements except the pivot
        if (arr[i][key] < pivot[key]) {
            left.push(arr[i]); // Add to left array
        } else {
            right.push(arr[i]); // Add to right array
        }
    }

    // Recursively sort left and right arrays, and concatenate with pivot
    return [...quickSortObj(left, key), pivot, ...quickSortObj(right, key)];
}
