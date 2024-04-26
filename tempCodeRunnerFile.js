const fs = require('fs');

// Function to read the file and parse the edge list
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

// Function to perform depth-first search (DFS) to find all paths
function findAllPaths(graph, currentNode, endNode, visited, path, allPaths) {
    visited.add(currentNode);

    if (currentNode === endNode) {
        allPaths.push([...path]);
    } else {
        if (graph.has(currentNode)) {
            graph.get(currentNode).forEach(edge => {
                if (!visited.has(edge.target)) {
                    path.push(edge.edgeName);
                    findAllPaths(graph, edge.target, endNode, visited, path, allPaths);
                    path.pop();
                }
            });
        }
    }

    visited.delete(currentNode);
}

// Function to generate all paths from each node to each other node
function generateAllPaths(graph) {
    const allPaths = new Map();

    graph.forEach((_, startNode) => {
        allPaths.set(startNode, new Map());

        graph.forEach((_, endNode) => {
            if (startNode !== endNode) {
                const visited = new Set();
                const path = [];
                const paths = [];

                findAllPaths(graph, startNode, endNode, visited, path, paths);
                allPaths.get(startNode).set(endNode, paths);
            }
        });
    });

    return allPaths;
}

// Function to print the graph
function printGraph(graph) {
    console.log('Graph:');
    graph.forEach((edges, node) => {
        console.log(`Node ${node}:`);
        edges.forEach(edge => {
            console.log(`  - Edge to ${edge.target} (${edge.edgeName})`);
        });
    });
}

// Read the file and parse the edge list
const filename = 'map_pr_small.txt';
const graph = readEdgeListFromFile(filename);

// printGraph(graph);

// Generate all paths
const allPaths = generateAllPaths(graph);

// Print all paths
console.log('All Paths:');
allPaths.forEach((pathsFromStartNode, startNode) => {
    pathsFromStartNode.forEach((pathsToEndNode, endNode) => {
        console.log(`Paths from ${startNode} to ${endNode}:`);
        pathsToEndNode.forEach(path => {
            console.log('  ', path.join(' '));
        });
    });
});
