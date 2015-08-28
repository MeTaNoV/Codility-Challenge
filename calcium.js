
var buildNodes = function (A, B, N, nodes) {
    for (var i = 0; i < N; i++) {
		var node;
		if ( !nodes[A[i]] ) {
			node = {};
			node.idx = A[i];
			node.connections = [];
			nodes[A[i]] = node;
		}
		if ( !nodes[B[i]] ) {
			node = {};
			node.idx = B[i];
			node.connections = [];
			nodes[B[i]] = node;
		}
		nodes[A[i]].connections.push( { road: i, node: nodes[B[i]]} );
		nodes[B[i]].connections.push( { road: i, node: nodes[A[i]]} );
    }
};

var printNodes = function (nodes) {
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		var s = "";
		for (var j = 0; j < node.connections.length; j++) {
			s += node.connections[j].node.idx;
		};
		console.log("Node " + node.idx + ": " + s);
	}
}

var buildRoads = function (roads) {
    for (var i = 0; i < roads.length; i++) {
    	var road = {};
    	road.idx = i;
    	road.count = 0;
    	road.isSuppressed = false;
    	roads[i] = road;
	}
};

var initPath = function (path) {
    for (var i = 0; i < path.length; i++) {
    	path[i] = 0;
	}
};

var computeAllPaths = function (nodes, roads, paths) {
	var path = new Array(roads.length);
	initPath(path);
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		//console.log("Node " + node.idx);
		for ( var j = 0; j < node.connections.length; j++) {
			var newPath = path.slice();
			//console.log("Following road: " + node.connections[j].road);
			computePath(roads, paths, newPath, 0, node.connections[j]);
		}
		nodes[i].isDone = true;
	}
};

var computePath = function (roads, paths, path, step, conn) {
	if ( path[conn.road] > 0 ) {
		//console.log("Been there... " + conn.road);
		return;
	}
	step++;
	path[conn.road] = step;
	var node = conn.node;

	//console.log("Node " + node.idx);

	if ( !node.isDone ) {
		path.forEach( function(elt, i) {
		    if ( elt > 0) {
		        roads[i].count++;
		    }
		});
		//console.log("Adding path: " + path);			
		paths.push({length: step, path: path});		
	} else {
		//console.log("doublon: " + conn.node.idx);
	}

	for (var i = 0; i < node.connections.length; i++) {
		var newPath = path.slice();
		//console.log("Following road: " + node.connections[i].road + " to node " + node.connections[i].node.idx);
		computePath(roads, paths, newPath, step, node.connections[i]);		
	}
};

var chooseRoad = function (roads) {
	return roads.reduce( function (prev, current) {
		if ( !prev && !current.isSuppressed) {
			return current;
		}
		if (!current.isSuppressed && current.count > prev.count) {
			return current;
		} else {
			return prev;
		}
	}, null);
};

var suppressPathsWithRoad = function (paths, road, roads) {
	return paths.filter( function (elt) {
		if ( elt.path[road.idx] > 0 ) {
			elt.path.forEach( function(e, i) {
			    if ( e > 0 ) {
			        roads[i].count--;
			    }
			});
			return false;
		} else {
			return true;
		}
	});
};

var printRoads = function (roads) {
	roads.forEach( function (road) {
		console.log("Road " + road.idx + ": " + road.count);
	});
}

function solution(A, B, K) {
    // write your code in JavaScript (Node.js 0.12)
    var N = A.length;
    var nodes = new Array(N + 1);
    var roads = new Array(N);
    var paths = [];
    
    buildNodes(A, B, N, nodes);
    //printNodes(nodes);
    buildRoads(roads);

	computeAllPaths(nodes, roads, paths);
    
    for (var i = 0; i < K; i++) {
    	//printRoads(roads);
    	var road = chooseRoad(roads);
    	//console.log("Suppressing road:" + road.idx);
    	paths = suppressPathsWithRoad(paths, road, roads);
    	roads[road.idx].isSuppressed = true;
    }
    
    // paths.forEach( function (path) {
    // 	if ( path ) {
    // 		console.log(path);
    // 	}
    // });

    var result = paths.reduce( function (prev, current) {
    	if (current && current.length > prev) {
    		return current.length;
    	} else {
    		return prev;
    	}
    }, 0);
    //console.log("And the result is: " + result);

    return result;
}