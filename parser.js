/**
 * returns a javascript object from a JSON formatted string
 * Example json to javascript object:
 *   "5"          -> 5
 *   "'hello'"   -> 'hello'
 *   "[]"         -> []
 *   "{}"         -> {}
 *   "["hello"]"  -> ['hello']
 *
 *  For more examples, use the JSON.stringify method in the console
 */

function JSONParser(string) {
	// we can't do splits because strings can hold tokens
	function endIndexOfValue(startingIndex){
		if(string[startingIndex] === '{' || string[startingIndex] === '[') { 
			return endIndexOfObjValue(startingIndex);
		}
		return endIndexOfPrimitiveValue(startingIndex);
	}

	function endIndexOfPrimitiveValue(startingIndex){
		// get the length of the json string that represents a primitive value
		for(let i = startingIndex + 1; i < string.length; i++){
			if(string[i] === ',' || string[i] === '}' || string[i] === ']'){
				return i - 1;
			}
		}
	}

	function endIndexOfObjValue(startingIndex){
		// get the length of the json string that represents an object or array
		let inString = false;
		let inObjects = 0;
		const openingToken = string[startingIndex];
		const closingToken = openingToken === '{' ? '}' : ']';
		// here we keep track of the full obj string by
		// counting how many open identifiers of objects they are
		// identifiers are [, or {
		// and subtracting by the closing identifiers ], }
		// once the open and close identifiers offset each other
		// that means we have reached the end of the full object
		// that may hold other objects
		for(let i = startingIndex; i < string.length; i++){
			if(string[i] === '"') inString = !inString;
			if(!inString){
				if(string[i] === openingToken){
					inObjects++;
				}
				else if(string[i] === closingToken){
					inObjects--;
					if(inObjects === 0) return i;
				}
			}
		}
	}

	function parseObj(string){
		let inKey = false, inValue = false, key = "", value = "";
		const obj = {};
		for(let i = 0; i < string.length; i++){
			if(!inKey && !inValue && string[i] === '"'){
				inKey = true;
			}
			else if(inKey){
				if(string[i] !== '"'){
					key += string[i];
				}
				else {
					inKey = false;
				}
			}
			else if(inValue){
				const endIndex = endIndexOfValue(i);
				obj[key] = JSONParser(string.slice(i, endIndex + 1));
				i = endIndex;
				inValue = false;
				key = "";
			}
			else if(!inKey && key !== "" && string[i] === ':'){
				// next iteration in the string will be
				// iterating through the value string
				inValue = true;
			}
		}
		return obj;
	}
	function parseArr(string){
		const arr = [];
		for(let i = 1; i < string.length; i++){
			const endIndex = endIndexOfValue(i);
			if(endIndex !== undefined){ // if not empty array
				arr.push(JSONParser(string.slice(i, endIndex + 1)));
				i = endIndex + 1;
			}
		}
		return arr;
	}

	if(string[0] === "{"){
		// get the full object string
		return parseObj(string);
	}
	if(string[0] === "["){
		// get the full array string
		return parseArr(string);
	}

	if(string[0] === '"' || string[0] === '\''){
		// string holds a string value
		return string.slice(1, string.length - 1);
	}

	if(string === "false") return false; // string holds a false boolean value
	if(string === "true") return true; // string holds a true boolean value
	if(string === "undefined") return undefined;
	if(string === "null") return null;
	return Number(string);
}