const fs = require('fs');

function writeToCSV(jsonList, outputFile) {
    // Create CSV headers
    const headers = ['path Itinerary'];

    // Convert JSON list to CSV format
    const csvContent = `${headers.join(',')}\n${jsonList.map(arr => arr.join('\n')).join('\n')}`;

    // Write CSV content to file
    fs.writeFile(outputFile, csvContent, err => {
        if (err) {
            console.error('Error writing CSV file:', err);
            return;
        }
        console.log('CSV file has been created successfully!');
    });
}

// Example usage:
const jsonList = [
    ['EnverMaloku_Qerimi_Menza Qerimi_Menza_Katedralja Menza_Katedralja_PTK Katedralja_PTK_BulevardiDK'],
    ['EnverMaloku_Qerimi_Menza Qerimi_Menza_Qerimi', 'EnverMaloku_Qerimi_Menza Qerimi_Menza_Teknik', 'EnverMaloku_Qerimi_Menza Qerimi_Menza_Katedralja', 'EnverMaloku_Qerimi_Menza Qerimi_Menza_MAShTI'],
    ['EnverMaloku_Qerimi_Menza Qerimi_Menza_Katedralja Menza_Katedralja_Parking Katedralja_Parking'],
    ['EnverMaloku_Qerimi_Teknik Qerimi_Teknik_FehmiLladrovci', 'EnverMaloku_Qerimi_Menza Qerimi_Menza_Teknik Menza_Teknik_RrugaB']
];

writeToCSV(jsonList, 'output.csv');
