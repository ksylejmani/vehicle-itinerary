const fs = require('fs');

function savePathsToJSON(paths, filePath) {
    const cars = paths.map(path => {
        return {
            "path_length": path.length,
            "path": path
        };
    });

    const jsonObject = {
        "cars": cars
    };

    fs.writeFileSync(filePath, JSON.stringify(jsonObject, null, 2));
}

// Example usage:
const paths = [
    ["PTK_Katedralja_Santea", "Katedralja_Santea_RobertDoll", "Santea_RobertDoll"],
    ["PTK_Katedralja_Santea", "Katedralja_Santea_RobertDoll", "Santea_RobertDoll"],
    ["PTK_Katedralja_Santea", "Katedralja_Santea_RobertDoll", "Santea_RobertDoll"],
    ["PTK_Katedralja_Santea", "Katedralja_Santea_RobertDoll", "Santea_RobertDoll"]
];

const filePath = 'cars.json';
savePathsToJSON(paths, filePath);
