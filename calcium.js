
var buildNodes = function (A, B, N) {
    var nodes = new Array(N + 1);
    for (var i = 0; i < N; i++) {
		var node;
		if ( !nodes[A[i]] ) {
			node = {};
			node.idx = A[i];
			node.connections = 0;
			node.connectedNodes = [];
			nodes[A[i]] = node;
		}
		if ( !nodes[B[i]] ) {
			node = {};
			node.idx = B[i];
			node.connections = 0;
			node.connectedNodes = [];
			nodes[B[i]] = node;
		}
		nodes[A[i]].connectedNodes.push( nodes[B[i]] );
		nodes[A[i]].connections++;
		nodes[B[i]].connectedNodes.push( nodes[A[i]] );
		nodes[B[i]].connections++;
    }
    return nodes;
};

var sortNodes = function (nodes) {
	nodes.sort( function (a, b) {
		if (a.connectedNodes.length !== b.connectedNodes.length) {
			return a.connectedNodes.length - b.connectedNodes.length;
		} else {
			return a.idx - b.idx;
		}
	});
};

var reduceNodes = function (nodes) {
	var s = 0;
	nodes.forEach( function (node) {
		if (node.connections > 2) {
			var count = 0;
			node.connectedNodes.forEach( function (connectedNode, i, connectedNodes) {
				if (connectedNode.connections === 1) {
					if ( count !== 0 ) {
						console.log("Suppressing node " + connectedNode.idx);
						connectedNode.suppressed = true;
						node.connections--;
						s++;
					}
					count++;
				}
			});
		}
	});
	return s;
};

var longestPath = function (nodes) {
	// let's compute all leaf to leaf distance
	var max = 0;
	var queue = [];
	nodes.forEach( function (node) {
		if (node.connections !== 1 || node.suppressed) {
			return;
		}
		node.distance = 0;
		queue.push(node);
		while ( queue.length !== 0 ) {
			var cur = queue.shift();
			cur.connectedNodes.forEach( function (connectedNode) {
				if (!connectedNode.distance) {
					connectedNode.distance = cur.distance + 1;
					queue.push(connectedNode);
				}
			});
		}
		nodes.forEach( function(n) {
			max = Math.max(max, n.distance);
			delete n.distance;
		});		
	});
	return max;
};

var checkLongestPath = function (nodes, nodeCount, distance, cameras) {
	var found = false;
	var currentCount = 0;
	var queue = [];
	console.log("Trying to find a distance of "+distance);
	nodes.forEach( function(n) {
		n.conn = n.connections;
	});
	nodes.forEach( function (node) {
		if (node.suppressed || node.conn > 1 || found || cameras < 0) {
			return;
		}
		node.distance = 0;
		currentCount++;
		queue.push(node);
		while ( queue.length !== 0 ) {
			var cur = queue.shift();
			console.log("Visiting node "+cur.idx);
			cur.visited = true;
			if (cur.conn < 3) {
				// we are on a direct line
				cur.connectedNodes.forEach( function (connectedNode) {
					if (!connectedNode.suppressed && !connectedNode.visited && !connectedNode.distance) {
						connectedNode.distance = cur.distance + 1;
						currentCount++;
						if (connectedNode.distance !== distance) {
							// let's push it further
							queue.push(connectedNode);
						} else {
							// let's suppress a connection to its neighbours
							console.log("Maximum distance reached on node " + connectedNode.idx);
							connectedNode.connectedNodes.forEach( function (connectedNode) {
								if (!connectedNode.suppressed && !connectedNode.visited) {
									console.log("Suppressing connection to node "+connectedNode.idx);
									connectedNode.conn--;
									cameras--;
								}
							});
						}
					}
				});				
			} else {
				var count = 0;
				var chosen = false;
				// we need to take care of the crossing
				cur.connectedNodes.forEach( function (connectedNode) {
					if (!connectedNode.suppressed && !connectedNode.visited && !connectedNode.distance) {
						if (!chosen && (connectedNode.conn === 1 || 
							            (count+1) === connectedNode.conn)) {
							chosen = true;
							connectedNode.distance = cur.distance + 1;
							currentCount++;
							if (connectedNode.distance !== distance) {
								// let's push it further
								queue.push(connectedNode);
							} else {
								// let's suppress a connection to its neighbours
								console.log("Maximum distance reached on node " + connectedNode.idx);
								connectedNode.connectedNodes.forEach( function (connectedNode) {
									if (!connectedNode.suppressed && !connectedNode.visited) {
										console.log("Suppressing connection to node "+connectedNode.idx);
										connectedNode.conn--;
										cameras--;
									}
								});
							}
						} else {
							// let's suppress a connection to its neighbours
							connectedNode.connectedNodes.forEach( function (connectedNode) {
								if (!connectedNode.suppressed && !connectedNode.visited) {
									console.log("Suppressing connection to node "+connectedNode.idx);
									connectedNode.conn--;
									cameras--;
								}
							});
						}
					} else {
						count++;
					}
				});				
			}
		}
		console.log("currentCount: "+currentCount);
		if (currentCount === nodeCount) {
			found = true;
		}
	});
	if (!found) {
		nodes.forEach( function(n) {
			delete n.distance;
			delete n.conn;
			delete n.visited;
		});
	}
	return found;
};

function solution(A, B, K) {
    // write your code in JavaScript (Node.js 0.12)
    var N = A.length;
    var nodes = buildNodes(A, B, N);
    sortNodes(nodes);
    //printNodes(nodes);
    var L = longestPath(nodes);
    console.log("L="+L);
    var S = reduceNodes(nodes);
    console.log("S="+S);
    var min = Math.ceil( (L-K) / (K+1) );
    console.log("min="+min);

    var result = min;
    var found = false;
    while ( !found ) {
    	if (result === 1) {
	    	found = checkLongestPath(nodes, N+1-S, result, K-S);    		
    	} else {
	    	found = checkLongestPath(nodes, N+1-S, result, K);    		
    	}
    	if (!found) {
	    	result++;
    	}
    }

    return result;
}

var printNodes = function (nodes) {
	nodes.forEach( function (node) {
		var str = "";
		node.connectedNodes.forEach( function (connectedNode) {
			str += connectedNode.node.idx + " ";
		});
		console.log("Node " + node.idx + ": " + node.connectedNodes.length + " -> " + str);
	});
};

var printABK = function (A, B, K) {
	console.log("([" + A + "],[" + B + "]," + K + ")");
};

