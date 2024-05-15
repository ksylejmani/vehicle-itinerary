
const fs = require('fs');

function readPossiblePathsFromCSV(filename, occurrences) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        const lines = data.trim().split('\n');
        const jsonList = [];

        // Skip the first row (header)
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].trim().split(',');
            const path = values[0];
            const pathLength = path.split(' ').length;
            jsonList.push({ pathLength: parseInt(pathLength), path });
        }

        // Sort jsonList based on pathLength in ascending order
        // jsonList.sort((a, b) => a.pathLength - b.pathLength);

        // Duplicate each item in jsonList by the specified number of occurrences
        const duplicatedList = [];
        for (let i = 0; i < jsonList.length; i++) {
            for (let j = 0; j < occurrences; j++) {
                duplicatedList.push(jsonList[i]);
            }
        }

        return duplicatedList;
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

function isPathInList(jsonList, pathName) {
    for (let i = 0; i < jsonList.length; i++) {
        if (jsonList[i].path === pathName) {
            return true;
        }
    }
    return false;
}

function convertJSONToCSVAndSave(jsonData, filename) {
    let csvContent = "Path\n";
    jsonData.forEach(row => {
        row.forEach(item => {
            csvContent += `${item}\n`;
        });
    });
    fs.writeFileSync(filename, csvContent);
    console.log('CSV file saved successfully.');
}

// File IO Functions
function readEdgeListFromFile(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    const lines = data.split('\n');
    const graph = new Map(); // Using a Map to store the graph data

    lines.forEach(line => {
        const parts = line.split(' ');
        const sourceNode = parseInt(parts[0]);
        const targetNode = parseInt(parts[1]);
        const edgeName = parts.slice(2).join('_');

        if (!graph.has(sourceNode)) {
            graph.set(sourceNode, []);
        }
        if (!graph.has(targetNode)) {
            graph.set(targetNode, []);
        }

        graph.get(sourceNode).push({ target: targetNode, edgeName: edgeName });
    });

    return graph;
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

function readExitRoads(filePath) {
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

// Path Finding Functions
function findAllPaths(graph, startNode, endNode, visited, path, allPaths) {
    visited.add(startNode);

    if (startNode === endNode) {
        allPaths.push([...path]);
    } else {
        if (graph.has(startNode)) {
            graph.get(startNode).forEach(edge => {
                if (!visited.has(edge.target)) {
                    path.push({ node: startNode, edge: edge });
                    findAllPaths(graph, edge.target, endNode, visited, path, allPaths);
                    path.pop();
                }
            });
        }
    }

    visited.delete(startNode);
}

function generateAllPaths(graph) {
    const allPaths = new Map();

    graph.forEach((_, startNode) => {
        allPaths.set(startNode, new Map());

        graph.forEach((_, endNode) => {
            if (startNode !== endNode) {
                const visited = new Set();
                const paths = [];

                findAllPaths(graph, startNode, endNode, visited, [], paths);
                allPaths.get(startNode).set(endNode, paths);
            }
        });
    });

    return allPaths;
}

function findFeasiblePath(startNode, endNode, allPaths, multiplier) {
    if (allPaths.has(startNode) && allPaths.get(startNode).has(endNode)) {
        const paths = allPaths.get(startNode).get(endNode);
        let filteredPaths = [];
        paths.forEach((path, index) => {
            const pathString = path.map(item => item.edge.edgeName.replace(/\r/g, '')).join(' -> ');
            filteredPaths.push(pathString);
        });

        let filtered = [];
        for (let i = 0; i < filteredPaths.length; i++) {
            const path = filteredPaths[i].split(' -> ')
            let filter_path = path[0];
            let filter_path_counter = 0;
            for (let j = 0; j < path.length - 1; j++) {
                const currentParts = path[j].split('_');
                const nextParts = path[j + 1].split('_');
                if (currentParts[2] === nextParts[1]) {
                    filter_path = filter_path + " " + path[j + 1];
                    filter_path_counter++;
                } else {
                    break;
                }
            }
            if (filter_path_counter === path.length - 1)
                filtered.push(filter_path)
        }

        let multiplyed_paths = []
        filtered.forEach((path, index) => {
            for (let i = 1; i <= multiplier; i++) {
                multiplyed_paths.push(path)
            }
        });

        return multiplyed_paths
    } else {
        return [];
    }
}

function findAllFeasiblePathsForAllNodes(allPaths, multiplier) {
    let result = [];
    allPaths.forEach((pathsFromStartNode, startNode) => {
        pathsFromStartNode.forEach((_, endNode) => {
            const paths = findFeasiblePath(startNode, endNode, allPaths, multiplier);
            result.push(paths)
        });
    });

    // convertJSONToCSVAndSave(result,'output_fk.csv')

    // Remove empty members from the list
    result = result.filter(sublist => sublist.length > 0);

    // Update the inner lists in myList to include the length based on the number of words in each string
    for (let innerList of result) {
        for (let i = 0; i < innerList.length; i++) {
            let member = innerList[i];
            let words = member.split(' ');
            innerList[i] = { pathLength: words.length, path: member };
        }
    }

    // Sorting the outer list based on the length of the first member in the inner list
    result.sort((a, b) => {
        const lengthA = a[0].pathLength;
        const lengthB = b[0].pathLength;
        return lengthB - lengthA;
    });
    return result;
}

function writePathsToCSV(paths, pathsOutputFile) {
    // Create CSV headers
    const headers = ['path length', 'path Itinerary'];

    // Convert array of objects to CSV format
    const csvContent = `${headers.join(',')}\n${paths.map(obj => `${obj.pathLength},"${obj.path}"`).join('\n')}`;

    // Write CSV content to file
    fs.writeFile(pathsOutputFile, csvContent, err => {
        if (err) {
            console.error('Error writing CSV file:', err);
            return;
        }
        console.log('CSV file has been created successfully!');
    });
}



// Printing Functions
function printGraph(graph) {
    console.log('Graph:');
    graph.forEach((edges, node) => {
        console.log(`Node ${node}:`);
        edges.forEach(edge => {
            console.log(`  - Edge to ${edge.target} (${edge.edgeName})`);
        });
    });
}

function printAllPaths(allPaths) {
    console.log('All Paths:');
    allPaths.forEach((pathsFromStartNode, startNode) => {
        pathsFromStartNode.forEach((pathsToEndNode, endNode) => {
            console.log(`Paths from ${startNode} to ${endNode}:`);
            pathsToEndNode.forEach(path => {
                const pathString = path.map(item => item.edge.edgeName.replace(/\r/g, '')).join(' -> ');
                console.log('  ', pathString);
            });
        });
    });
}


let testCounter=0
function getCars(ListA, MapB, exitRoadMap) {
    ListA.sort((a, b) => a.pathLength - b.pathLength);
    const validPaths = [];
    let anyNonZero = true; // Flag to check if any element of MapB is non-zero
    while (anyNonZero) {
        anyNonZero = false; // Assume all elements are zero initially
        ListA.forEach(pathObj => {

            testCounter+=1;
            const words = pathObj.path.split(' ');
            let isValidPath = true;

            words.forEach(word => {
                if (!MapB.has(word) || MapB.get(word) === 0) {
                    isValidPath = false;
                }
            });

            if (isValidPath) {
                words.forEach(word => {
                    if (MapB.has(word) && MapB.get(word) > 0) {
                        MapB.set(word, MapB.get(word) - 1);
                        if (MapB.get(word) > 0) {
                            anyNonZero = true; // Set flag to true if any element is non-zero
                        }
                    }
                });

                // Add exit road after last road segment
                const lastRoadSegment = words[words.length - 1];
                const exitRoad = exitRoadMap.get(lastRoadSegment);
                pathObj.path = pathObj.path + ' ' + exitRoad;
                let pathList = pathObj.path.split(' ');
                validPaths.push(pathList);
            }

        });
    }

    const cars = validPaths.map(path => {
        return {
            "path_length": path.length,
            "path": path
        };
    });

    return cars;
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


// Main Execution
const instanceName = "lakrishte_qerimi";
const multiplier = 200;

const exit_roadsFilePath = 'input/exit_roads_pr_fk.csv';
const intersectionsFile = 'input/intersections_pr_fk.csv';
const maP_filename = 'input/map_' + instanceName + '.txt';
const streetsFile = 'input/road_segments_distance_' + instanceName + '.csv';
const traffic_filename = 'input/road_segments_traffic_' + instanceName + '.csv';
const constraints_filename = 'input/constraints_' + instanceName + '.json';
const possible_paths = readPossiblePathsFromCSV('input/possible_paths.csv', multiplier);

const outputInstanceName = 'output/instance_' + instanceName + '.json'

// const graph = readEdgeListFromFile(maP_filename);
// const allPaths = generateAllPaths(graph);
// let feasible_paths = findAllFeasiblePathsForAllNodes(allPaths, multiplier);
const roadSegments_traffic = readTrafficData(traffic_filename);
const exitRoadMap = readExitRoads(exit_roadsFilePath);
// const cars = getCars(feasible_paths, roadSegments_traffic, exitRoadMap);
const cars = getCars(possible_paths, roadSegments_traffic, exitRoadMap);
console.log(roadSegments_traffic)
const intersections = readIntersectionsAndConvertToJSON(intersectionsFile);
const streets = readStreetsAndConvertToJSON(streetsFile);

const constraints = readConstraintsFromFile(constraints_filename);

let instance = generateInstance(intersections, streets, cars, constraints);

fs.writeFileSync(outputInstanceName, instance);

console.log("testCounter:"+testCounter);