var ASEexport = (function() {
	
	function set_prop(node, attribute, value) {
		if (node[attribute]) {
			if (node[attribute].constructor == Array) {
				node[attribute].push(value);
			} else {
				var arr = [];
				arr.push(node[attribute]);
				arr.push(value);
				node[attribute] = arr;
			}
		} else {
			node[attribute] = value;
		}
	}

	function Node(params) {
		if (params && params instanceof Object) {
			for (var k in params) {
				this[k] = params[k];
			}
		}
	}
	
	Node.prototype.search = function(arr) {
		if (arr.length == 0) {
			return this;
		} else {
			if (this[arr[0]]) {
				return search(arr.slice(1), this[arr[0]]);
			} else {
				return null;
			}
		}
	};

	Node.prototype.getStringProperty = function(propName) {
		var p = this[propName];
		if (p === undefined) {
			return "";
		} else if (typeof p == "string") {
			return p;
		} else if (typeof p == "object" && p.constructor == Array) {
			return p.join(" ");
		} else 
		return p.toString();
	}

	
	function ASEParser() {

		var nodes_seq;
		var root;
		var curnode;

		this.reset = function() {
			nodes_seq = [];
			root = new Node({name: "ROOT", data: []});
			curnode = root;
			nodes_seq.push(root);
		};
		
		this.reset();
		
		this.parseLine = function(line) {
			
			if (curnode == undefined) {
				curnode = root;
				nodes_seq.push(root);
			}
			
			var curobj = new Node;
			var cols = line.trim().split(/[ \t\n\r]/);
			
			if (cols[0] == "}") {
				nodes_seq.pop();
				curnode = nodes_seq[nodes_seq.length-1];
			} else {

				if (cols[1] == '{') {
					var newobj = new Node;
					// if curnode[cols[0]] already exists, we try to stack our new object on it instead of overwriting
					if (curnode[cols[0]]) {
						if (curnode[cols[0]].push) {
							curnode[cols[0]].push(newobj);
						} else {
							var newarr = [ curnode[cols[0]] ];
							newarr.push(newobj);
							curnode[cols[0]] = newarr;
						}
					} else {
						curnode[cols[0]] = newobj;
					}
					curnode = newobj;
					nodes_seq.push(newobj);
				} else if (cols[2] == '{') {
					if (curnode[cols[0]] === undefined) {
						curnode[cols[0]] = new Node;
					}
					var newobj = new Node;
					curnode[cols[0]][cols[1]] = newobj;
					curnode = newobj;
					nodes_seq.push(newobj);
				} else {
					for (var j=1; j<cols.length; ++j) {
						set_prop(curnode, cols[0], cols[j]);
					}
				}
			}
		};

		this.getRoot = function() {
			return root;
		}
	}
		
	function LineReader() {
		this.buffer = false;
		this.eat = function(text, lineCallback) {
			var lastLineIndex = 0;
			var offset = 0;
			while ( (offset=text.indexOf('\n', lastLineIndex)) != -1) {
				var line = text.substring(lastLineIndex, offset);
				if (this.buffer) {
					lineCallback(this.buffer + line);
					this.buffer=false;
				} else {
					lineCallback(line);
				}
				lastLineIndex = offset+1;
			}
			if (lastLineIndex < text.length) {
				this.buffer = text.substring(lastLineIndex, text.length);
			}
		};
		this.reset = function() { this.buffer=false;};
	}
	
	return function(){
		
//		var root = null;
		var reader = new LineReader();
		var readBlockSize = 1024*50;
		var parser = new ASEParser();
		
		function loadFile(file, offset, callbackComplete, progressCallback) {
			var sliceFunc = file.slice || file.webkitSlice || file.mozSlice;
			var currentBlob = sliceFunc.call(file, offset, offset+readBlockSize); // file.slice(offset, offset + steps);
			var fileReader = new FileReader();
			if (progressCallback) {
				progressCallback(offset / file.size);
			}
			fileReader.onload = function (evt) {
				reader.eat(evt.target.result, function(line) {
					parser.parseLine(line);
				});
				if (offset+readBlockSize < file.size) {
					loadFile(file, offset+readBlockSize, callbackComplete, progressCallback);
				} else {
					if (callbackComplete) {
						callbackComplete();
					}
				}
			}; 
			fileReader.readAsText(currentBlob);
		}
		
		this.buildFromFile = function(file, callbackComplete, progressCallback) {
			reader.reset();
			parser.reset();
			
			return loadFile(file, 0, callbackComplete, progressCallback);
		};

		this.getRootNode = function() {
			return parser.getRoot();
		};
		
		this.test = function(text) {
			var root = make_nodes(text);
			
			var result = [];
			
			console.log(root);
			var matlist = search(["*MATERIAL_LIST", "*MATERIAL"], root);
			var geomobj = search(["*GEOMOBJECT"], root);
			console.log("matlist", matlist);
			console.log("geomobjects", geomobj);
			for (var i=0; i<geomobj.length; ++i) {
				var g = geomobj[i];
				var name = getStringProperty(g, "*NODE_NAME");
				var line = "";
				console.log("name: " + name);
				line += name + ';';
				
				if (g["*MATERIAL_REF"]) {
					var material = matlist[g["*MATERIAL_REF"]];
					
					var matname = getStringProperty(material, "*MATERIAL_NAME");
					console.log("material", material, matname);
					line += matname+';';
				}
				
				result.push(line);
			}
			return result.join("\n");
		};
		
	};
	
})(window);