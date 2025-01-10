class PseudoInterpreter {
    constructor() {
        this.continueFlag = false;
        this.breakFlag = false;
        this.variables = {};
        this.arrays = {};
        this.procedures = {};
        this.functions = {};
        this.ifCountTracker = 0;
        this.elseIfTracker = [0];
        this.inMultilineComment = false; // Track if we are inside a multiline comment
    }

    tokenize(line) {
        if (/^([\w\[\]<>\-,\+\*/%]+)\s*<- (.+)$/.test(line)) {
            const match = line.match(/^([\w\[\]<>\-,\+\*/%]+)\s*<- (.+)$/);
            return ["SET", match[1], match[2]];
        } else if (/^([\w\[\]<>\-,\+\*/%]+)\s*= (.+)$/.test(line)) {
            const match = line.match(/^([\w\[\]<>\-,\+\*/%]+)\s*= (.+)$/);
            return ["SET", match[1], match[2]];
        } else if (/^SET\s+([\w\[\]<>\-,\+\*/%]+)\s+TO\s+(.+)$/.test(line)) {
            const match = line.match(/^SET\s+([\w\[\]<>\-,\+\*/%]+)\s+TO\s+(.+)$/);
            return ["SET", match[1], match[2]];
        } else if (line.startsWith("OUTPUT")) {
            const match = line.match(/^OUTPUT\s+((?:(["'])(?:\\.|(?!\2).)*\2|[\w\[\]<>\-,\+\*/%]+)(?:,\s+(?:(["'])(?:\\.|(?!\3).)*\3|[\w\[\]<>\-,\+\*/%]+))*)$/);
            const args = match[1].split(/,\s+/).map(arg => arg.trim());
            return ["OUTPUT", args];
        } else if (line.startsWith("INPUT")) {
            const match = line.match(/^INPUT ([A-Za-z0-9\[\]<>,]+)$/);
            return ["INPUT", match[1]];
        } else if (line.startsWith("APPEND")) {
            const match = line.match(/^APPEND (\w+), (.+)$/);
            return ["APPEND", match[1], match[2]];
        } else if (line.startsWith("REMOVE")) {
            const match = line.match(/^REMOVE (\w+), (\d+)$/);
            return ["REMOVE", match[1], parseInt(match[2], 10)];
        } else if (line.startsWith("LEN")) {
            const match = line.match(/^LEN\((\w+)\)$/);
            return ["LEN", match[1]];
        } else if (line.startsWith("DEFINE")) {
            const match = line.match(/^DEFINE (\w+)\((.*)\)$/);
            return ["DEFINE", match[1], match[2] ? match[2].split(", ").map((p) => p.trim()) : []];
        } else if (line === "ENDDEFINE") {
            return ["ENDDEFINE"];
        } else if (line.startsWith("RETURN")) {
            const match = line.match(/^RETURN (.+)$/);
            return ["RETURN", match[1]];
        } else if (line.startsWith("CALL")) {
            const match = line.match(/^CALL (\w+)\((.*)\)$/);
            return ["CALL", match[1], match[2] ? match[2].split(", ").map((p) => p.trim()) : []];
        } else if (line.startsWith("IF")) {
            const match = line.match(/^IF (.+) THEN$/);
            this.ifCountTracker++;
            this.elseIfTracker.push(0);
            return ["IF", match[1]];
        } else if (line.startsWith("ELSE IF")) {
            const match = line.match(/^ELSE IF (.+)$/);
            this.elseIfTracker[this.ifCountTracker]++;
            return ["ELSE IF", match[1]];
        } else if (line === "ELSE") {
            return ["ELSE"];
        } else if (line === "ENDIF") {
            return ["ENDIF"];
        } else if (line.startsWith("WHILE")) {
            const match = line.match(/^WHILE (.+) DO$/);
            return ["WHILE", match[1]];
        } else if (line === "ENDWHILE") {
            return ["ENDWHILE"];
        } else if (/^FOR (\w+)\s*<-?\s*([\w\[\],\+\-\*\/%]+)\s*TO\s*([\w\[\],\+\-\*\/%]+)$/.test(line)) {
            const match = line.match(/^FOR (\w+)\s*<-?\s*([\w\[\],\+\-\*\/%]+)\s*TO\s*([\w\[\],\+\-\*\/%]+)$/);
            return ["FOR", match[1], match[2], match[3]];
        } else if (/^FOR (\w+)\s*=?\s*([\w\[\],\+\-\*\/%]+)\s*TO\s*([\w\[\],\+\-\*\/%]+)$/.test(line)) {
            const match = line.match(/^FOR (\w+)\s*=?\s*([\w\[\],\+\-\*\/%]+)\s*TO\s*([\w\[\],\+\-\*\/%]+)$/);
            return ["FOR", match[1], match[2], match[3]];
        } else if (line.startsWith("NEXT")) {
            const match = line.match(/^NEXT (\w+)$/);
            return ["NEXT", match[1]];
        } else if (line.startsWith("CASE OF")) {
            const match = line.match(/^CASE OF\s+(.*)$/);
            return ["CASE", match[1]];
        } else if (line.startsWith("OTHERWISE")) {
            const match = line.match(/^OTHERWISE\s*:\s*(.*)/);
            return ["OTHERWISE", match ? match[1].trim() : ""];
        } else if (/^(\S+)\s*TO\s*(\S+)\s*:\s*/.test(line)) {
            const match = line.match(/^(.*?)\s*TO\s*(.*?)\s*:\s*(.*)/);
            return ["RANGE_CASE", match[1].trim(), match[2].trim(), match[3].trim()];
        } else if (/^\S+\s*:\s*/.test(line)) {
            const match = line.match(/^(.*?)\s*:\s*(.*)/);
            return ["CASE_VALUE", match[1].trim(), match[2].trim()];
        } else if (line === "ENDCASE") {
            return ["ENDCASE"];
        } else if (line === "REPEAT") {
            return ["REPEAT"];
        } else if (/^UNTIL\s+(.*)$/.test(line)) {
            const match = line.match(/^UNTIL\s+(.*)$/);
            return ["UNTIL", match[1]];
        } else if (/^DECLARE\s+(\w+)\s*:\s*ARRAY\s*\[\s*(\d+)\s*:\s*(\d+)\s*]\s*OF\s+(\w+)\s*$/.test(line)) {
            const match = line.match(/^DECLARE\s+(\w+)\s*:\s*ARRAY\s*\[\s*(\d+)\s*:\s*(\d+)\s*]\s*OF\s+(\w+)\s*$/);
            return ["DECLARE_ARRAY", match[1], [parseInt(match[2], 10), parseInt(match[3], 10)], match[4]];
        } else if (/^DECLARE\s+(\w+)\s*:\s*ARRAY\s*\[\s*(\d+)\s*:\s*(\d+)\s*,\s*(\d+)\s*:\s*(\d+)\s*]\s*OF\s+(\w+)\s*$/.test(line)) {
            const match = line.match(/^DECLARE\s+(\w+)\s*:\s*ARRAY\s*\[\s*(\d+)\s*:\s*(\d+)\s*,\s*(\d+)\s*:\s*(\d+)\s*]\s*OF\s+(\w+)\s*$/);
            return ["DECLARE_2D_ARRAY", match[1], [parseInt(match[2], 10), parseInt(match[3], 10)], [parseInt(match[4], 10), parseInt(match[5], 10)], match[6]];
        } else if (line === "CONTINUE") {
            return ["CONTINUE"];
        } else if (line === "BREAK") {
            return ["BREAK"];
        } else if (line === "PASS") {
            return ["PASS"];
        }

       throw new SyntaxError(`Unknown command: ${line}`);
    }

    // Utilities

    forToWhile(inputLines) {
        let transformdLines = [];
        let forCount = 0;
        if (inputLines[0] === "FOR") {
            forCount++;
            const iteratorName = inputLines[1];
            let initialLine = ["SET", iteratorName, inputLines[2]]; // Initialize iterator
            transformdLines.push(initialLine);
            let whileLine = ["WHILE", iteratorName + "<=" + inputLines[3]]; // While line
            transformdLines.push(whileLine);

            while (++i < lines.length) {
                let line = inputLines[i];

                if (line[0] === "NEXT") {
                    forCount--;
                    if (forCount == 0) {
                        let nextLine = ["SET", iteratorName, iteratorName + "+1"];
                        transformdLines.push(nextLine);
                        transformdLines.push(["ENDWHILE"]);
                        break; 
                    }
                } else if (line[0] === "IF") {
                    forCount++;
                    let innerForCount = forCount;
                    let innerLines = [];
                    do {
                        innerLines.push(line[i]);
                        i++;
                        if (line[0] === "IF") {
                            forCount++;
                        } else if (line[0] === "NEXT") {
                            forCount--;
                        }
                    } while (forCount !== innerForCount);
                    let processedInnerLines = this.forToWhile(innerLines);
                    for (const processedLine of processedInnerLines) {
                        transformdLines.push(processedLine);
                    }
                } else {
                    transformdLines.push(line);
                }
            }
        }
        return transformdLines;
    }

    replaceVariables(expr) {
        expr = expr.replace(/\b\w+\b/g, (match) => {
            return this.variables[match] !== undefined ? this.variables[match] : match;
        });
        return expr;
    }

    replaceArrayVariables(expr) {
        // Regular expression to match variables in square brackets
        const regex = /\b(\w+)\[(\w+)(?:,(\w+))?\]/g;
    
        expr = expr.replace(regex, (match, varName, index1, index2) => {
            // Replace the variable name with its value if it exists in this.variables
            const replacedVar = this.variables[varName] !== undefined ? this.variables[varName] : varName;
    
            // Replace indices if they are defined in this.variables
            const replacedIndex1 = this.variables[index1] !== undefined ? this.variables[index1] : index1;
            const replacedIndex2 = index2 && this.variables[index2] !== undefined ? this.variables[index2] : index2;
    
            // Construct the new expression based on whether it's a 1D or 2D array
            return replacedIndex2 
                ? `${replacedVar}[${replacedIndex1},${replacedIndex2}]` 
                : `${replacedVar}[${replacedIndex1}]`;
        });
    
        return expr;
    }
    
    parseReference(expr) {
        const pattern1 = /^(.*)\[(.+?)\]$/;
        const pattern2 = /^(.*)\[(.+?),(.+?)\]$/;
        let match;
        if (pattern1.test(expr)) { // 1D array
            match = expr.match(pattern1);
            return [match[1],this.evalExpression(match[2])]
        } else if (pattern2.test(expr)) { // 2D array
            match = expr.match(pattern2);
            return [match[1],this.evalExpression(match[2]),this.evalExpression(match[3])]
        } else {
            return [expr];
        }
    }

    evalArray(expr) {
        const pattern1 = /^(.*)\[(.+?)\]$/;
        const pattern2 = /^(.*)\[(.+?),(.+?)\]$/;
        let match;
        if (pattern1.test(expr)) { // 1D array
            match = expr.match(pattern1);
            return this.arrays[match[1]][this.evalExpression(match[2])]
        } else if (pattern2.test(expr)) { // 2D array
            match = expr.match(pattern2);
            return this.arrays[match[1]][this.evalExpression(match[2])][this.evalExpression(match[3])]
        } else {
            return expr;
        }
    }

    removeQuotationMark(expr) {
        let expr_string = String(expr);
        // console.log("removeQuotationMark");
        // console.log(expr_string);
        if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
            // console.log(expr_string.slice(1, -1));
            return expr_string.slice(1, -1);
        } else {
            return expr;
        }
    }

    turnBooleanCapitalized(expr) {
        if (typeof expr === "boolean") {
            if (expr) return "TRUE";
            else return "FALSE";
        }
        if (expr === 'true') {
            return "TRUE";
        }
        if (expr === 'false') {
            return "FALSE";
        }
        return expr;
    }

    replaceSingleEquals(input) {
        return input.replace(/(^|[^=!<>])=([^=]|$)/g, '$1==$2');
    }

    take_left(str, x) {
        // In zero-based indexing, the leftmost x chars go from index 0 up to x
        return str.substring(0, x);
    }

    take_right(str, x) {
        // In zero-based indexing, we start at str.length - x
        return str.substring(str.length - x);
    }

    take_mid(str, x, y) {
        // Convert 1-based index (x) to zero-based, then retrieve y characters
        const startIndex = x - 1;
        return str.substring(startIndex, startIndex + y);
    }
    
    /*
    handleForLoop(parsedCode, i, varName, startVar, endVar) {
        // Handle a FOR loop and any nested loops.
        let forIndex = i;
        let loopI = 1;
    
        // Loop over the range from start to end
        for (let loopVal = start; loopVal <= end; loopVal++) {
            this.variables[varName] = loopVal;
            loopI = forIndex + 1;
            let executableCode = [];
    
            // Execute the body of the loop
            while (loopI < parsedCode.length) {
                let currentToken = parsedCode[loopI];
                if (currentToken[0] === 'FOR') {
                    // Recursively handle nested loops
                    this.execute(executableCode);
                    executableCode = [];
                    loopI = this.handleForLoop(parsedCode, loopI, currentToken[1], currentToken[2], currentToken[3]);
                } else if (currentToken[0] === 'NEXT') {
                    this.execute(executableCode);
                    executableCode = [];
                    if (currentToken[1] === varName) {
                        break;  // End of the current loop
                    }
                } else {
                    executableCode.push(currentToken);
                    // this.execute([currentToken]);  // Execute other commands
                }
                loopI++;
            }
    
            this.execute(executableCode);
            executableCode = [];
        }
    
        return loopI;
    }
    */

    evalExpression(expr) {
        // Replace <> with !=
        expr = expr.replace(/<>/g, '!=');

        // Replace AND with &&
        expr = expr.replace(/AND/g, '&&');

        // Replace OR with ||
        expr = expr.replace(/OR/g, '||');

        // Replace NOT with !
        expr = expr.replace(/NOT/g, '!');

        // Replace Booleans
        expr = expr.replace(/TRUE/g, 'true');
        expr = expr.replace(/FALSE/g, 'false');

        // Replace = with ==
        expr = this.replaceSingleEquals(expr);

        /*
        // Handle CALL expression for function calls
        if (expr.startsWith("CALL")) {
            const match = expr.match(/^CALL (\w+)\((.*)\)$/);
            if (match) {
                const funcName = match[1];
                const args = match[2] ? match[2].split(",").map((arg) => this.evalExpression(arg.trim())) : [];
                return this.callFunction(funcName, args);
            }
        }

        // Handle LEN function
        if (expr.startsWith("LEN(")) {
            const arrayName = expr.slice(4, -1); // Extract array name
            if (this.variables[arrayName] && Array.isArray(this.variables[arrayName])) {
                return this.variables[arrayName].length;
            } else {
                throw new Error(`${arrayName} is not an array or is not defined.`);
            }
        }
        */

        
        // Handle strings
        if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
            return expr;
            // return expr.slice(1, -1);
        }
        
        
        // Handle Boolean
        if (expr === "TRUE") {
            return true;
        }
        if (expr === "FALSE") {
            return false;
        }

        // Replace variables in the expression with their values
        expr = this.replaceVariables(expr);

        // Regular expression to match 1D and 2D array references
        const arrayPattern = /([A-Za-z]+)\[(.+?)(?:,(\S+))?\]/g;

        // Function to replace array references with their evaluated values
        const replaceArrayReferences = (match, arrayName, index1, index2) => {
            if (index2 !== undefined) { // 2D array reference
                index1 = this.evalExpression(index1);
                index2 = this.evalExpression(index2);
                return this.evalArray(`${arrayName}[${this.evalExpression(index1)},${index2}]`);
            } else { // 1D array reference
                index1 = this.evalExpression(index1);
                return this.evalArray(`${arrayName}[${index1}]`);
            }
        };

        // Replace all array references in the expression
        expr = expr.replace(arrayPattern, replaceArrayReferences);

        try {
            return eval(expr); // Evaluate mathematical and logical expressions
        } catch {
            throw new Error(`Invalid expression: ${expr}`);
        }
    }

    parse(pseudocode) {
        const lines = pseudocode.trim().split("\n");
        const parsedLines = [];
        console.log(lines);
    
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            // console.log(line);
    
            // Handle multiline comments
            if (line.includes("/*")) {
                this.inMultilineComment = true;
                line = line.split("/*")[0].trim();
                continue;
            }
    
            // Skip lines inside multiline comments
            if (this.inMultilineComment || !line) continue;
    
            // Remove inline comments
            if (line.includes("//")) {
                line = line.split("//")[0].trim();
            }
            
            // Remove inline comments with #
            if (line.includes("#")) {
                line = line.split("#")[0].trim();
            }
            
            line = line.trim();

            // console.log(line);

            if (!line) continue;

            const parsedLine = this.tokenize(line);

            // Preprocess ELSE IF into ELSE and IF
            if (parsedLine[0] === "ELSE IF") {
                parsedLines.push(["ELSE"]);
                parsedLine[0] = "IF";
            }

            // Handle ENDIF logic
            if(parsedLine[0] === "ENDIF") { 
                for(let j=0; j < this.elseIfTracker[this.ifCountTracker]; j++) { 
                    parsedLines.push(["ENDIF"]); 
                }
                this.elseIfTracker[this.ifCountTracker] = 0; 
                this.ifCountTracker -= 1; 
            }

            // Handle CASE structure
            if (parsedLine[0] === "CASE") {
                const caseExpression = parsedLine[1];
                let caseLines = [];
                let otherwiseLine = null;

                // Process subsequent CASE lines until we hit ENDCASE
                while (++i < lines.length) {
                    let caseLine = lines[i].trim();
                    let caseParsed = this.tokenize(caseLine);

                    // Handle individual cases
                    if (caseParsed[0] === "CASE_VALUE") {
                        caseLines.push(caseParsed); // Store individual case actions
                        continue;
                    }

                    // Handle range cases
                    if (caseParsed[0] === "RANGE_CASE") {
                        caseLines.push(caseParsed); // Store range case actions
                        continue;
                    }

                    // Handle OTHERWISE action
                    if (caseParsed[0] === "OTHERWISE") {
                        otherwiseLine = caseParsed; 
                        continue;
                    }

                    // End of CASE block
                    if (caseParsed[0] === "ENDCASE") {
                        break; 
                    }
                }
                
                let caseCount = 0;
                let caseAction = [];
                // Generate IF-ELSE structure from cases
                for (const caseLine of caseLines) {
                    caseCount++;

                    if (caseLine.length === 4 && caseLine[0] === "RANGE_CASE") { 
                        parsedLines.push(["IF", `${caseExpression} <= ${caseLine[2]} && ${caseExpression} >= ${caseLine[1]}`]); 
                        caseAction = caseLine[3].toString().trim();
                        // console.log(caseAction);
                        caseAction = this.tokenize(caseAction);
                        parsedLines.push(caseAction); 
                        parsedLines.push(["ELSE"]); 
                    }
                    
                    // For individual cases 
                    else { 
                        parsedLines.push(["IF", `${caseExpression} == ${caseLine[1]}`]);
                        caseAction = caseLine[2].toString().trim();
                        caseAction = this.tokenize(caseAction);
                        // console.log(caseAction);
                        parsedLines.push(caseAction); 
                        parsedLines.push(["ELSE"]); 
                    }
                }

                // Handle OTHERWISE action
                if (otherwiseLine) {
                    caseAction = otherwiseLine[1].toString().trim();
                    caseAction = this.tokenize(caseAction);
                    // console.log(caseAction);
                    parsedLines.push(caseAction); 
                }
                
                for (let j=0; j < caseCount; j++) {
                    parsedLines.push(["ENDIF"]);
                }
            }

            // Translate FOR into WHILE
            if (parsedLine[0] === "FOR") {
                const iteratorName = parsedLine[1];
                let initialLine = ["SET", iteratorName, parsedLine[2]]; // Initialize iterator
                parsedLines.push(initialLine);
                let whileLine = ["WHILE", iteratorName + "<=" + parsedLine[3]]; // While line
                parsedLines.push(whileLine);

                while (++i < lines.length) {
                    let forLine = lines[i].trim();
                    let forParsed = this.tokenize(forLine);

                    if (forParsed[0] === "NEXT") {
                        let nextLine = ["SET", iteratorName, iteratorName + "+1"];
                        parsedLines.push(nextLine);
                        parsedLines.push(["ENDWHILE"]);
                        break; 
                    } else {
                        parsedLines.push(forParsed);
                    }
                }
            }

            if (parsedLine[0] !== "CASE" && parsedLine[0] !== "OTHERWISE" && parsedLine[0] !== "FOR" && parsedLine[0] !== "NEXT") {
                parsedLines.push(parsedLine);
            }


        }
        for (const pline of parsedLines) {
            console.log(pline);
        }
        return parsedLines;
    }

    execute(parsedCode) {
        let i = 0;
        let whileCount;
        let repeatCount;
        let ifCount;
        let currentBlock;
    
        while (i < parsedCode.length) {
            const token = parsedCode[i];
            let ref;

            switch (token[0]) {
                case "PASS":
                    break;

                case "SET":
                    // console.log(token[1]);
                    // console.log(token[2]);
                    ref = this.parseReference(token[1]);
                    if (ref.length === 1) {
                        this.variables[ref[0]] = this.evalExpression(token[2]);
                    } else if (ref.length === 2) {
                        this.arrays[ref[0]][ref[1]] = this.evalExpression(token[2]);
                    } else if (ref.length === 3) {
                        this.arrays[ref[0]][ref[1]][ref[2]] = this.evalExpression(token[2]);
                    }
                    break;
        
                case "OUTPUT":
                    const outputArgs = token[1]; // This is now an array of arguments
                    // console.log(token[1][0]);
                    // console.log(this.evalExpression(token[1][0]));
                    const outputValue = outputArgs.map(arg => this.turnBooleanCapitalized(this.removeQuotationMark(this.evalExpression(arg)))).join(''); // Concatenate evaluated values
                    document.getElementById('outputBox').value += outputValue + '\n'; // Output to text box
                    // console.log(outputValue); // Output to console
                    break;
        
                case "INPUT":
                    const inputVal = prompt(`Enter value for ${this.replaceArrayVariables(token[1])}:`);
                    ref = this.parseReference(token[1]);
                    if (ref.length === 1) {
                        this.variables[ref[0]] = isNaN(inputVal) ? inputVal : Number(inputVal);
                    } else if (ref.length === 2) {
                        this.arrays[ref[0]][ref[1]] = isNaN(inputVal) ? inputVal : Number(inputVal);
                    } else if (ref.length === 3) {
                        this.arrays[ref[0]][ref[1]][ref[2]] = isNaN(inputVal) ? inputVal : Number(inputVal);
                    }
                    break;
                
                /*
                case "APPEND":
                    if (!Array.isArray(this.variables[token[1]])) {
                    throw new Error(`${token[1]} is not an array.`);
                    }
                    this.variables[token[1]].push(this.evalExpression(token[2]));
                    break;
        
                case "REMOVE":
                    if (!Array.isArray(this.variables[token[1]])) {
                    throw new Error(`${token[1]} is not an array.`);
                    }
                    this.variables[token[1]].splice(token[2], 1);
                    break;

                case "LEN":
                    console.log(this.evalExpression(`LEN(${token[1]})`));
                    break;
                */

                case "IF":
                    const condition = this.evalExpression(token[1]);
                    i++;
                    let executableCode = [];
                    ifCount = 1;
                
                    if (condition) { // True condition, execute until ELSE or ENDIF
                        while (ifCount > 0) {
                            executableCode.push(parsedCode[i]);
                            if (parsedCode[i][0] === 'IF') {
                                ifCount++;
                            }
                            if (parsedCode[i][0] === 'ENDIF') {
                                ifCount--;
                            }
                            if (ifCount === 1 && (parsedCode[i][0] === 'ELSE' || parsedCode[i][0] === 'ELSE IF')) { // Skip the ELSE block
                                i++;
                                while (ifCount > 0) {
                                    if (parsedCode[i][0] === 'IF') {
                                        ifCount++;
                                    }
                                    if (parsedCode[i][0] === 'ENDIF') {
                                        ifCount--;
                                    }
                                    i++;
                                }
                                break;
                            }
                            i++;
                        }
                        this.execute(executableCode);
                    } else { // False condition, skip until ELSE or ENDIF
                        while (ifCount > 0) {
                            if (parsedCode[i][0] === 'IF') {
                                ifCount++;
                            }
                            if (parsedCode[i][0] === 'ENDIF') {
                                ifCount--;
                                if (ifCount === 0) break;
                            }
                            /*
                            if (ifCount === 1 && parsedCode[i][0] === 'ELSE IF') { // Execute ELSE IF block if present
                                i++;
                                const condition = this.evalExpression(parsedCode[i][1]);
                                executableCode = [];
                                while (ifCount > 0 && parsedCode[i][0] !== 'ELSE IF' && parsedCode[i][0] !== 'ELSE') {
                                    if (parsedCode[i][0] === 'IF') {
                                        ifCount++;
                                    }
                                    if (parsedCode[i][0] === 'ENDIF') {
                                        ifCount--;
                                    }
                                    executableCode.push(parsedCode[i]);
                                    i++;
                                }
                                this.execute(executableCode);
                                break;
                            }
                            */
                            if (ifCount === 1 && parsedCode[i][0] === 'ELSE') { // Execute ELSE block if present
                                i++;
                                executableCode = [];
                                while (ifCount > 0) {
                                    if (parsedCode[i][0] === 'IF') {
                                        ifCount++;
                                    }
                                    if (parsedCode[i][0] === 'ENDIF') {
                                        ifCount--;
                                    }
                                    executableCode.push(parsedCode[i]);
                                    i++;
                                }
                                this.execute(executableCode);
                                break;
                            }
                            i++;
                        }
                    }
                    break;
                
                case "ELSE":
                    break;        

                case "ENDIF":
                    break;
                
                /*
                case "DEFINE":
                    const funcName = token[1];
                    const params = token[2];
                    const funcBody = [];
                    i++;
                    while (parsedCode[i][0] !== "ENDDEFINE") {
                    funcBody.push(parsedCode[i]);
                    i++;
                    }
                    this.functions[funcName] = { params, funcBody };
                    break;

                case "CALL":
                    this.callFunction(token[1], token[2].map((arg) => this.evalExpression(arg)));
                    break;

                case "RETURN":
                    return this.evalExpression(token[1]);
                */

                case "WHILE":
                    let loopCondition = token[1];
                    whileCount = 1;
                    repeatCount = 0;
                    ifCount = 0;
                    i++;
                    let loopBody = [];
                    currentBlock = [];
                    while (!(parsedCode[i][0] === "ENDWHILE" && whileCount === 1)) {
                        // console.log(parsedCode[i]);
                        if (parsedCode[i][0] === 'WHILE') {
                            whileCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDWHILE') {
                            whileCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 1 && repeatCount === 0 && ifCount === 0) {
                                if (parsedCode[i+1][0] === 'SET') { // In case of a broken down FOR loop
                                    i++;
                                    currentBlock.push(parsedCode[i]);
                                }
                                loopBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'REPEAT') {
                            repeatCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'UNTIL') {
                            repeatCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 1 && repeatCount === 0 && ifCount === 0) {
                                repeatBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'IF') {
                            ifCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDIF') {
                            ifCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 1 && repeatCount === 0 && ifCount === 0) {
                                loopBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (currentBlock.length === 0) {
                            currentBlock = [parsedCode[i]];
                            loopBody.push(currentBlock);
                            currentBlock = [];
                        } else {
                            currentBlock.push(parsedCode[i]);
                        }
                        i++;
                    }
                    while (this.evalExpression(loopCondition)) {
                        for (const currentBlock of loopBody) {
                            this.execute(currentBlock);
                            if (this.continueFlag) {
                                break;
                            }
                            if (this.breakFlag) {
                                break;
                            }
                        }
                        if (this.continueFlag) {
                            this.continueFlag = false;
                            continue;
                        }
                        if (this.breakFlag) {
                            this.breakFlag = false;
                            break;
                        }
                    }
                    break;

                case "REPEAT":
                    let repeatCondition;
                    whileCount = 0;
                    repeatCount = 1;
                    ifCount = 0;
                    i++;
                    let repeatBody = [];
                    currentBlock = [];
                    while (!(parsedCode[i][0] === "UNTIL" && repeatCount === 1)) {
                        // console.log(parsedCode[i]);
                        if (parsedCode[i][0] === 'WHILE') {
                            whileCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDWHILE') {
                            whileCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 1 && ifCount === 0) {
                                if (parsedCode[i+1][0] === 'SET') { // In case of a broken down FOR loop
                                    i++;
                                    currentBlock.push(parsedCode[i]);
                                }
                                repeatBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'REPEAT') {
                            repeatCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'UNTIL') {
                            repeatCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 1 && ifCount === 0) {
                                repeatBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'IF') {
                            ifCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDIF') {
                            ifCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 1 && ifCount === 0) {
                                repeatBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (currentBlock.length === 0) {
                            currentBlock = [parsedCode[i]];
                            repeatBody.push(currentBlock);
                            currentBlock = [];
                        } else {
                            currentBlock.push(parsedCode[i]);
                        }
                        i++;
                    }
                    repeatCondition = parsedCode[i][1];
                    // console.log(repeatCondition);
                    // console.log(repeatBody);
                    do {
                        for (const currentBlock of repeatBody) {
                            this.execute(currentBlock);
                            if (this.continueFlag) {
                                break;
                            }
                            if (this.breakFlag) {
                                break;
                            }
                        }
                        if (this.continueFlag) {
                            this.continueFlag = false;
                            continue;
                        }
                        if (this.breakFlag) {
                            this.breakFlag = false;
                            break;
                        }
                    } while (!this.evalExpression(repeatCondition));
                    break;
                
                case "UNTIL":
                    break;

                /*   
                case "FOR":
                    var varName = token[1];
                    var start = token[2];
                    var end = token[3];
                    console.log(varName);
                    console.log(start);
                    console.log(end);
                    start = this.evalExpression(start);
                    end = this.evalExpression(end);
                    console.log(start);
                    console.log(end);
                    i = this.handleForLoop(parsedCode, i, varName, start, end);
                */
                
                case "CONTINUE":
                    this.continueFlag = true;
                    // console.log("CONTINUE");
                    break; 
                    
                case "BREAK":
                    this.breakFlag = true;
                    // console.log("BREAK");
                    break;  

                case "NEXT":
                    break;

                case "DECLARE_ARRAY":
                    this.arrays[token[1]] = [];
                    break;
                
                case "DECLARE_2D_ARRAY":
                    this.arrays[token[1]] = [];
                    for (let i = 0; i < 114514; i++) {
                        this.arrays[token[1]][i] = [];
                    }
                    break;

                default:
                    throw new SyntaxError(`Unknown command: ${token[0]}`);
            }

            i++; 
        }
    }

    callFunction(funcName, args) {
        if (!this.functions[funcName]) {
            throw new Error(`Function ${funcName} not defined.`);
        }

        const funcDef = this.functions[funcName];
        const { params, funcBody } = funcDef;

        if (params.length !== args.length) {
            throw new Error(`Expected ${params.length} arguments, got ${args.length}.`);
        }

        const savedVariables = { ...this.variables };

        params.forEach((param, index) => {
            this.variables[param] = args[index];
        });

        let returnValue = null;
        for (const statement of funcBody) {
            const result = this.execute([statement]);
            if (result !== undefined) {
                returnValue = result;
                break;
            }
        }

        this.variables = savedVariables;
        return returnValue;
    }
}

function runPseudocode() {
    document.getElementById('outputBox').value = ''; // Clear previous output

    const pseudocodeInput = document.getElementById('inputBox').value;

    try {
        const interpreter = new PseudoInterpreter();
        const parsedCode = interpreter.parse(pseudocodeInput);
        console.log(parsedCode);
        interpreter.execute(parsedCode);
    } catch (error) {
        alert('Error during execution:\n' + error.message);
    }
}
