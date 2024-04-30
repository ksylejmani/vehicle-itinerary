const numbers = [
    [18, 19], [19, 18], [0, 18], [18, 0], [18, 0], [18, 0], [18, 0], [1, 0], [1, 0], [1, 0],
    [1, 0], [25, 0], [25, 0], [25, 0], [26, 0], [26, 0], [26, 0], [0, 25], [0, 26], [0, 1],
    [0, 1], [0, 1], [27, 1], [27, 1], [2, 1], [2, 1], [1, 27], [1, 2], [1, 2], [1, 2], [1, 2],
    [12, 2], [12, 2], [12, 2], [12, 2], [16, 2], [16, 2], [16, 2], [16, 2], [71, 2], [71, 2],
    [71, 2], [71, 2], [2, 71], [2, 16], [2, 16], [2, 16], [2, 16], [2, 12], [3, 16], [3, 16],
    [3, 16], [3, 16], [4, 16], [4, 16], [4, 16], [4, 16], [6, 16], [6, 16], [6, 16], [6, 16],
    [16, 6], [16, 3], [16, 4], [16, 4], [16, 4], [16, 4], [3, 4], [3, 4], [3, 4], [3, 4],
    [30, 4], [30, 4], [30, 4], [30, 4], [4, 29], [4, 30], [4, 3]
];

// Initialize an empty set to store unique numbers
const uniqueNumbers = new Set();

// Iterate through the list and add each number to the set
numbers.forEach(pair => {
    pair.forEach(num => uniqueNumbers.add(num));
});

// Calculate the number of unique numbers
const numberOfUniqueNumbers = uniqueNumbers.size;

console.log("Number of different numbers:", numberOfUniqueNumbers);
