const fs = require('fs');
const csv = require('csv-parser');
function filterPathsByTraffic(carPaths, traffic) {
    return carPaths.filter(path => {
        const words = path.split(" ");
        for (let word of words) {
            if (!traffic.has(word) || traffic.get(word) <= 0) {
                return false;
            }
        }
        // If all words are found and have positive values, decrement their values by one
        words.forEach(word => {
            traffic.set(word, traffic.get(word) - 1);
        });
        return true;
    });
}


function readTrafficData(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    const lines = data.split('\n');
    const roadSegments = new Map();

    // Skip the first line as it contains headers
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const [roadSegment, numOfCars] = line.split(',');
        roadSegments.set(roadSegment, parseInt(numOfCars));
    }

    return roadSegments;
}


function readCarPathsFromCSV(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    const lines = data.split('\n');
    const carPaths = [];

    // Skip the first line as it contains headers
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const path = line.trim(); // Trim any whitespace
        carPaths.push(path);
    }

    return carPaths;
}

function sortCarPathsBySegments(carPaths) {
    // Sort car paths based on the number of road segments
    carPaths.sort((a, b) => {
        const segmentsA = a.split(' ').length;
        const segmentsB = b.split(' ').length;
        return segmentsB - segmentsA;
    });

    return carPaths;
}

function increaseOccurances(carPaths, factor) {
    const increasedPaths = [];
    for (let path of carPaths) {
        for (let i = 0; i < factor; i++) {
            increasedPaths.push(path);
        }
    }
    return increasedPaths;
}

function readExitRoadsFromCSV(filePath) {
    const dataMap = new Map();

    const csvData = fs.readFileSync(filePath, 'utf8');
    const rows = csvData.split('\n');

    // Skip the header row
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (row) {
            const [roadSegment, exitRoad] = row.split(',');
            dataMap.set(roadSegment.trim(), exitRoad.trim());
        }
    }

    return dataMap;
}

function addExitRoads(carPaths, exitRoads) {
    const pathsWithExitRoads = [];

    for (let path of carPaths) {
        const words = path.split(' ');

        // Add exit road after last road segment
        const lastRoadSegment = words[words.length - 1];
        const exitRoad = exitRoads.get(lastRoadSegment);
        const pathWithExitRoad = path + ' ' + exitRoad;
        pathsWithExitRoads.push(pathWithExitRoad);
    }

    return pathsWithExitRoads;
}

function formatCarPaths(carPaths) {
    return carPaths.map(path => {
        const segments = path.split(' ');
        return {
            "path_length": segments.length,
            "path": segments
        };
    });
}

function readIntersectionsAndConvertToJSON(csvFilePath) {
    // Read the CSV file
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');

    // Split the CSV data into rows
    const rows = csvData.trim().split('\n');

    // Remove the header row and split each row into columns
    const header = rows.shift().split(',');

    // Define an array to hold the JSON objects for each intersection
    const intersections = [];

    // Iterate over each row to create JSON objects
    rows.forEach(row => {
        const columns = row.split(',');
        const intersection = {};

        // Map each column to its corresponding property in the intersection object
        header.forEach((columnName, index) => {
            // Remove '\r' from the column name if present
            const cleanedColumnName = columnName.replace(/\r$/, '');
            const columnValue = columns[index].trim(); // Remove leading/trailing spaces
            // Convert numeric values from strings to numbers
            intersection[cleanedColumnName] = isNaN(columnValue) ? columnValue : parseFloat(columnValue);
        });

        // Push the intersection object to the array
        intersections.push(intersection);
    });

    // Return intersections
    return intersections;
}

function readStreetsAndConvertToJSON(csvFilePath) {
    // Read the CSV file
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');

    // Split the CSV data into rows
    const rows = csvData.trim().split('\n');

    // Remove the header row
    const headers = rows.shift().split(',');

    // Define an array to hold the JSON objects for each street
    const streets = [];

    // Iterate over each row to create JSON objects
    rows.forEach(row => {
        const columns = row.split(',');
        const street = {
            "start": parseInt(columns[0]),
            "end": parseInt(columns[1]),
            "name": columns[2],
            "time": parseInt(columns[3])
        };
        streets.push(street);
    });

    // Return the streets
    return streets;
}

function readConstraintsFromFile(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        const constraints = JSON.parse(data).constraints;
        return constraints;
    } catch (err) {
        console.error('Error reading constraints from file:', err);
        return [];
    }
}

function generateInstance(intersections, streets, cars, constraints, duration = 600, bonus = 100, duration_to_pass_through_a_traffic_light = 1.42, yellow_phase = 4, limit_on_minimum_cycle_length = 60, limit_on_maximum_cycle_length = 120, limit_on_minimum_green_phase_duration = 15, limit_on_maximum_green_phase_duration = 70) {
    let values = {
        "simulation": {
            "duration": duration,
            "intersections": intersections.length,
            "streets": streets.length,
            "cars": cars.length,
            "bonus": bonus,
            "duration_to_pass_through_a_traffic_light": duration_to_pass_through_a_traffic_light,
            "yellow_phase": yellow_phase,
            "limit_on_minimum_cycle_length": limit_on_minimum_cycle_length,
            "limit_on_maximum_cycle_length": limit_on_maximum_cycle_length,
            "limit_on_minimum_green_phase_duration": limit_on_minimum_green_phase_duration,
            "limit_on_maximum_green_phase_duration": limit_on_maximum_green_phase_duration,
        },
        "intersections": intersections,
        "streets": streets,
        "cars": cars,
        "constraints": constraints
    };

    return JSON.stringify(values, null, 4);
}
// Example usage:
const carPathIncreaseFactor = 200;
const instanceName = "pr_fk";
const possiblePathsFile = 'input/possible_paths.csv';
const trafficFile = 'input/road_segments_traffic_' + instanceName + '.csv';
const exitRoadsFile = 'input/exit_roads_' + instanceName + '.csv';
const intersectionsFile = 'input/intersections_pr_fk.csv';
const streetsFile = 'input/road_segments_distance_' + instanceName + '.csv';
const constraintsFile = 'input/constraints_' + instanceName + '.json';

const outputInstanceName = 'output/instance_' + instanceName + '.json'


const intersections = readIntersectionsAndConvertToJSON(intersectionsFile);
const streets = readStreetsAndConvertToJSON(streetsFile);
const constraints = readConstraintsFromFile(constraintsFile);

const carPaths = readCarPathsFromCSV(possiblePathsFile);
const sortedCarPaths = sortCarPathsBySegments(carPaths);
const increasedPaths = increaseOccurances(sortedCarPaths, carPathIncreaseFactor);
let trafficData = readTrafficData(trafficFile)
let filteredPaths = filterPathsByTraffic(increasedPaths, trafficData);
const exitRoads = readExitRoadsFromCSV(exitRoadsFile);
let carPathsWithExitRoads = addExitRoads(filteredPaths, exitRoads);
let cars = formatCarPaths(carPathsWithExitRoads)

let instance = generateInstance(intersections, streets, cars, constraints);

fs.writeFileSync(outputInstanceName, instance);
console.log(traffic)