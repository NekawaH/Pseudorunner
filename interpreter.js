class PseudoInterpreter {
    constructor() {
        this.variables = {};
        this.functions = {};
        this.ifCountTracker = 0;
        this.elseIfTracker = [0];
        this.inMultilineComment = false; // Track if we are inside a multiline comment
    }

    parse(pseudocode) {
        const lines = pseudocode.trim().split("\n");
        const parsedLines = [];
    
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
    
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

            if (!line) continue;

            const parsedLine = this.tokenize(line);

            // Preprocess ELSE IF into ELSE and IF
            if (parsedLine[0] === "ELSE IF") {
                parsedLines.push(["ELSE"]);
                parsedLine[0] = "IF";
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
            } else if (parsedLine[0] !== "OTHERWISE") {
                parsedLines.push(parsedLine);
            }

            // Handle ENDIF logic
            if(parsedLine[0] === "ENDIF") { 
                for(let j=0; j < this.elseIfTracker[this.ifCountTracker]; j++) { 
                    parsedLines.push(["ENDIF"]); 
                }
                this.elseIfTracker[this.ifCountTracker] = 0; 
                this.ifCountTracker -= 1; 
            }
        }
        for (const pline of parsedLines) {
            console.log(pline);
        }
        return parsedLines;
    }
        

    tokenize(line) {
        if (/^\w+\s*<-.*$/.test(line)) {
            const match = line.match(/^(\w+)\s*<- (.+)$/);
            return ["SET", match[1], match[2]];
        } else if (/^\w+\s*=.*$/.test(line)) {
            const match = line.match(/^(\w+)\s*= (.+)$/);
            return ["SET", match[1], match[2]];
        } else if (/^SET\s+(\w+)\s+TO\s+(.+)$/.test(line)) {
            const match = line.match(/^SET\s+(\w+)\s+TO\s+(.+)$/);
            return ["SET", match[1], match[2]];
        } else if (line.startsWith("OUTPUT")) {
            const match = line.match(/^OUTPUT (.+)$/);
            const args = match[1].split(',').map(arg => arg.trim());
            return ["OUTPUT", args];
        } else if (line.startsWith("INPUT")) {
            const match = line.match(/^INPUT (\w+)$/);
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
        } else if (/^FOR (\w+)\s*<-?\s*(\w+|\d+)\s*TO\s*(\w+|\d+)$/.test(line)) {
            const match = line.match(/^FOR (\w+)\s*<-?\s*(\w+|\d+)\s*TO\s*(\w+|\d+)$/);
            return ["FOR", match[1], match[2], match[3]];
        } else if (/^FOR (\w+)\s*=?\s*(\w+|\d+)\s*TO\s*(\w+|\d+)$/.test(line)) {
            const match = line.match(/^FOR (\w+)\s*=?\s*(\w+|\d+)\s*TO\s*(\w+|\d+)$/);
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
        }
    
       throw new SyntaxError(`Unknown command: ${line}`);
    }
    

    evalExpression(expr) {
        // Replace <> with !=
        expr = expr.replace(/<>/g, '!=');

        // Replace AND with &&
        expr = expr.replace(/AND/g, '&&');

        // Replace OR with ||
        expr = expr.replace(/OR/g, '||');

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

        // Handle strings
        if (expr.startsWith('"') && expr.endsWith('"')) {
            return expr.slice(1, -1);
        }

        // Replace variables in the expression with their values
        expr = expr.replace(/\b\w+\b/g, (match) => {
            return this.variables[match] !== undefined ? this.variables[match] : match;
        });

        try {
            return eval(expr); // Evaluate mathematical and logical expressions
        } catch {
            throw new Error(`Invalid expression: ${expr}`);
        }
    }

    handleForLoop(parsedCode, i, varName, startVar, endVar) {
        // Handle a FOR loop and any nested loops.
        let forIndex = i;
        let loopI = 1;

        // Resolve start and end values
        let start = Number(startVar) ? Number(startVar) : (this.variables[startVar]);;
        let end = Number(endVar) ? Number(endVar) : (this.variables[endVar]);;
    
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

    execute(parsedCode) {
        let i = 0;
    
        while (i < parsedCode.length) {
            const token = parsedCode[i];

            switch (token[0]) {
                case "SET":
                    this.variables[token[1]] = this.evalExpression(token[2]);
                    break;
        
                case "OUTPUT":
                    const outputArgs = token[1]; // This is now an array of arguments
                    const outputValue = outputArgs.map(arg => this.evalExpression(arg)).join(''); // Concatenate evaluated values
                    document.getElementById('outputBox').value += outputValue + '\n'; // Output to text box
                    console.log(outputValue); // Output to console
                    break;
        
                case "INPUT":
                    const inputVal = prompt(`Enter value for ${token[1]}:`);
                    this.variables[token[1]] = isNaN(inputVal) ? inputVal : Number(inputVal);
                    break;
        
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

                case "IF":
                    const condition = this.evalExpression(token[1]);
                    i++;
                    let executableCode = [];
                    let ifCount = 1;
                
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

            case "WHILE":
                let loopCondition = token[1];
                let whileCount = 1;
                i++;
                let loopBody = [];
                while (parsedCode[i][0] !== "ENDWHILE" && whileCount === 1) {
                    if (parsedCode[i][0] === 'WHILE') {
                        whileCount++;
                    }
                    if (parsedCode[i][0] === 'ENDWHILE') {
                        whileCount--;
                    }
                    loopBody.push(parsedCode[i]);
                    i++;
                }
                while (this.evalExpression(loopCondition)) {
                    this.execute(loopBody);
                }
                break;

            case "REPEAT":
                var repeatCondition;
                let repeatCount = 1;
                i++;
                let repeatBody = [];
                while (parsedCode[i][0] !== "UNTIL" && repeatCount === 1) {
                    if (parsedCode[i][0] === 'REPEAT') {
                        repeatCount++;
                    }
                    if (parsedCode[i][0] === 'UNTIL') {
                        repeatCount--;
                    }
                    repeatBody.push(parsedCode[i]);
                    i++;
                }
                repeatCondition = parsedCode[i][1];
                do {
                    this.execute(repeatBody);
                } while (!this.evalExpression(repeatCondition));
                break;
            
            case "UNTIL":
                break;

            case "FOR":
                var varName = token[1];
                var start = token[2];
                var end = token[3];
                i = this.handleForLoop(parsedCode, i, varName, start, end);
                
            case "NEXT":
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
        interpreter.execute(parsedCode);
    } catch (error) {
        alert('Error during execution:\n' + error.message);
    }
}

// Function to handle indentation and backspace behavior
function handleIndentation(event) {
    const inputBox = document.getElementById('inputBox');
    const start = inputBox.selectionStart;
    const end = inputBox.selectionEnd;

    // Check if Tab key or Enter key is pressed
    if (event.key === 'Tab') {
        event.preventDefault(); // Prevent default tab behavior
        const indent = '    '; // 4 spaces for indentation
        const selectedText = inputBox.value.substring(start, end);

        if (event.shiftKey) {
            // Shift + Tab: Unindent entire lines of selected text
            const lines = inputBox.value.split('\n');
            const startLineIndex = inputBox.value.substr(0, start).split('\n').length - 1;
            const endLineIndex = inputBox.value.substr(0, end).split('\n').length - 1;

            let newStart = start; // Variable to track new cursor position

            // Unindent each line in the selection range
            for (let i = startLineIndex; i <= endLineIndex; i++) {
                if (lines[i].startsWith(indent)) {
                    lines[i] = lines[i].substring(indent.length); // Remove 4 spaces
                    newStart -= indent.length; // Adjust cursor position for each unindented line
                }
            }

            // Update the text area with unindented lines
            inputBox.value = lines.join('\n');
            // Move cursor to the position after unindentation
            inputBox.selectionStart = inputBox.selectionEnd = Math.max(newStart, 0); // Ensure cursor doesn't go negative
        } else {
            // Tab: Indent selected lines
            const indentedText = selectedText.split('\n').map(line => indent + line).join('\n');
            inputBox.setRangeText(indentedText, start, end, 'select');
            // Move cursor to the position after indentation
            inputBox.selectionStart = inputBox.selectionEnd = start + indent.length;
        }
    } else if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default new line behavior
        
        const lines = inputBox.value.split('\n');
        const currentLineIndex = inputBox.value.substr(0, start).split('\n').length - 1;

        if (currentLineIndex >= 0) {
            const currentLine = lines[currentLineIndex];
            const indentationMatch = currentLine.match(/^(\s*)/); // Get leading whitespace

            if (indentationMatch) {
                const indentation = indentationMatch[0]; // Leading whitespace of current line
                
                // Insert a new line with the same indentation as current line
                const newLineContent = '\n' + indentation;
                inputBox.setRangeText(newLineContent, start, end, 'select');

                // Move cursor to position after new line and indentation
                inputBox.selectionStart = inputBox.selectionEnd = start + indentation.length + 1; 
            } else {
                // If there's no indentation in current line, just insert a new line
                inputBox.setRangeText('\n', start, end, 'select');

                // Move cursor to position after new line
                inputBox.selectionStart = inputBox.selectionEnd = start + 1;
            }
        }
    } else if (event.key === 'Backspace') {
        event.preventDefault(); // Prevent default backspace behavior

        if (start > 0) { 
            const currentLineStartIndex = inputBox.value.lastIndexOf('\n', start - 1) + 1;
            const leadingSpaces = inputBox.value.substring(currentLineStartIndex, start);
            
            if (/^ *$/.test(leadingSpaces)) { // Check if all characters before cursor are spaces
                const spaceCount = leadingSpaces.length;
                
                // Calculate how many spaces to remove to reach the nearest multiple of 4.
                const spacesToRemove = spaceCount % 4 || Math.min(spaceCount, 4);

                // Update value by removing calculated spaces.
                const updatedValue =
                    inputBox.value.substring(0, currentLineStartIndex) +
                    leadingSpaces.substring(0, spaceCount - spacesToRemove) +
                    inputBox.value.substring(start);
                
                inputBox.value = updatedValue;

                // Move cursor to the new position after removing spaces.
                inputBox.selectionStart = inputBox.selectionEnd = currentLineStartIndex + spaceCount - spacesToRemove;
                return; 
            }
        }

        // If not all spaces or at the beginning of line, perform default backspace behavior.
        const selectedTextLength = end - start;
        if (selectedTextLength > 0) {
            // Delete selected text
            inputBox.setRangeText('', start, end, 'select');
            inputBox.selectionStart = inputBox.selectionEnd = start; 
        } else {
            // Default behavior: move cursor back by one character.
            const updatedValue =
                inputBox.value.substring(0, start - 1) +
                inputBox.value.substring(start);
                
            inputBox.value = updatedValue;

            // Move cursor back by one character.
            inputBox.selectionStart = inputBox.selectionEnd = start - 1; 
        }
    }
}

// Add event listener for keydown on the input box
document.getElementById('inputBox').addEventListener('keydown', handleIndentation);





