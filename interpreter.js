class PseudoInterpreter {
    constructor() {
        this.continueFlag = false;
        this.breakFlag = false;
        this.variables = {};
        this.constants = {};
        this.arrays = {};
        this.procedures = {};
        this.functions = {};
        this.files = {};
        this.ifCountTracker = 0;
        this.elseIfTracker = [];
        this.inMultilineComment = false;
        this.globalReturnValue = null;
        this.tempArgs = [];
        this.types = {};
        this.declareTypeName = null;
        this.popup = false;
    }

    tokenize(line) {
        if (line.startsWith("POPUP")) {
            const match = line.match(/^POPUP\s+(.*)$/);
            return ["POPUP", match[1]];
        } else if (line.startsWith("OUTPUT")) {
            const match = line.match(/^OUTPUT\s+(.*)$/);
            if (match) {
                const argsString = match[1];
                const args = [];
                let currentArg = "";
                let inQuotes = false;
                let parenLevel = 0;
                let bracketLevel = 0;
    
                for (let i = 0; i < argsString.length; i++) {
                    const char = argsString[i];
    
                    if (char === '"') {
                        inQuotes = !inQuotes;
                        currentArg += char;
                    } else if (char === '(') {
                        parenLevel++;
                        currentArg += char;
                    } else if (char === ')') {
                        parenLevel--;
                        currentArg += char;
                    } else if (char === '[') {
                        bracketLevel++;
                        currentArg += char;
                    } else if (char === ']') {
                        bracketLevel--;
                        currentArg += char;
                    } else if (char === ',' && !inQuotes && parenLevel === 0 && bracketLevel === 0) {
                        args.push(currentArg.trim());
                        currentArg = "";
                    } else {
                        currentArg += char;
                    }
                }
                args.push(currentArg.trim()); // Add the last argument
                return ["OUTPUT", args];
            }
            return null; // Or handle the case where the regex doesn't match as needed
        } else if (line.startsWith("INPUT")) {
            const match = line.match(/^INPUT\s+(.*)$/);
            return ["INPUT", match[1]];
        } else if (line.startsWith("IF")) {
            const match = line.match(/^IF (.*?)(?: THEN)?$/);
            this.ifCountTracker++;
            this.elseIfTracker.push(0);
            return ["IF", match[1].trim()];
        } else if (line.startsWith("THEN")) {
            return ["THEN"];
        } else if (line.startsWith("ELSE IF")) {
            const match = line.match(/^ELSE IF (.+)$/);
            this.elseIfTracker[this.ifCountTracker - 1]++;
            return ["ELSE IF", match[1]];
        } else if (line === "ELSE") {
            return ["ELSE"];
        } else if (line === "ENDIF") {
            return ["ENDIF"];
        } else if ((/^WHILE (.*?)(?: DO)?$/).test(line)) {
            const match = line.match(/^WHILE (.*?)(?: DO)?$/);
            return ["WHILE", match[1]];
        } else if (line === "DO") {
            return ["DO"];
        } else if (line === "ENDWHILE") {
            return ["ENDWHILE"];
        } else if (/^FOR (\w+)\s*(<-|=)\s*(.+?)\s*TO\s*(.+?)(\s*STEP\s*(.+?))?$/.test(line)) {
            const match = line.match(/^FOR (\w+)\s*(<-|=)\s*(.+?)\s*TO\s*(.+?)(\s*STEP\s*(.+?))?$/);
            const stepValue = match[6] ? match[6] : '1'; // Default to '1' if STEP is not present
            return ["FOR", match[1], match[3], match[4], stepValue];
        } else if (line.startsWith("NEXT")) {
            const match = line.match(/^NEXT (\w+)$/);
            return ["NEXT", match[1]];
        } else if (line.startsWith("CASE OF")) {
            const match = line.match(/^CASE OF\s+(.*)$/);
            return ["CASE", match[1]];
        } else if (line.startsWith("OTHERWISE")) {
            const match = line.match(/^OTHERWISE\s*(?::\s*)?(.*)/);
            return ["OTHERWISE", match ? match[1].trim() : ""];
        } else if (/^(\S+)\s*TO\s*(\S+)\s*:\s*/.test(line)) {
            const match = line.match(/^(.*?)\s*TO\s*(.*?)\s*:\s*(.*)/);
            return ["RANGECASE", match[1].trim(), match[2].trim(), match[3].trim()];
        } else if (/^\S+\s*:\s*/.test(line)) {
            const match = line.match(/^(.*?)\s*:\s*(.*)/);
            return ["CASEVALUE", match[1].trim(), match[2].trim()];
        } else if (line === "ENDCASE") {
            return ["ENDCASE"];
        } else if (line === "REPEAT") {
            return ["REPEAT"];
        } else if (/^UNTIL\s+(.*)$/.test(line)) {
            const match = line.match(/^UNTIL\s+(.*)$/);
            return ["UNTIL", match[1]];
        } else if (/^DECLARE\s+([\w\s,]+)\s+(?:OF|:)\s+(\w+)$/.test(line)) {
            const match = line.match(/^DECLARE\s+([\w\s,]+)\s+(?:OF|:)\s+(\w+)$/);
            if (match) {
              const variables = match[1].split(',').map(v => v.trim());
              const dataType = match[2];
              return ["DECLAREVAR", variables, dataType];
            }
            return null; // Or handle the error case appropriately
        } else if (/^DECLARE\s+(\w+)\s*:\s*ARRAY\s*\[\s*(\d+)\s*:\s*(\d+)\s*]\s*OF\s+(\w+)\s*$/.test(line)) {
            const match = line.match(/^DECLARE\s+(\w+)\s*:\s*ARRAY\s*\[\s*(\d+)\s*:\s*(\d+)\s*]\s*OF\s+(\w+)\s*$/);
            return ["DECLAREARRAY", match[1], [parseInt(match[2], 10), parseInt(match[3], 10)], match[4]];
        } else if (/^DECLARE\s+(\w+)\s*:\s*ARRAY\s*\[\s*(\d+)\s*:\s*(\d+)\s*,\s*(\d+)\s*:\s*(\d+)\s*]\s*OF\s+(\w+)\s*$/.test(line)) {
            const match = line.match(/^DECLARE\s+(\w+)\s*:\s*ARRAY\s*\[\s*(\d+)\s*:\s*(\d+)\s*,\s*(\d+)\s*:\s*(\d+)\s*]\s*OF\s+(\w+)\s*$/);
            return ["DECLARE2DARRAY", match[1], [parseInt(match[2], 10), parseInt(match[3], 10)], [parseInt(match[4], 10), parseInt(match[5], 10)], match[6]];
        } else if (line === "CONTINUE") {
            return ["CONTINUE"];
        } else if (line === "BREAK") {
            return ["BREAK"];
        } else if (line === "PASS") {
            return ["PASS"];
        } else if (/^CONSTANT (.+?)\s*(<-|=) (.+)$/.test(line)) {
            const match = line.match(/^CONSTANT (.+?)\s*(<-|=) (.+)$/);
            return ["CONSTANT", match[1], match[3]];
        } else if (/^(.+?)\s*(<-|=) (.+)$/.test(line)) {
            const match = line.match(/^(.+?)\s*(<-|=) (.+)$/);
            return ["SET", match[1], match[3]];
        } else if (/^SET\s+(.+?)\s+TO\s+(.+)$/.test(line)) {
            const match = line.match(/^SET\s+(.+?)\s+TO\s+(.+)$/);
            return ["SET", match[1], match[2]];
        } else if (/^PROCEDURE\s+(\w+)\((.*?)\)$/.exec(line)) {
            const match = /^PROCEDURE\s+(\w+)\((.*?)\)$/.exec(line);
            const procedureName = match[1];
            const rawArgs = match[2];
            const parseArguments = (argString) => {
                if (argString.trim() === '') return [];
                const args = [];
                let lastMode = "BYVAL"; // Default mode
                argString.split(',').forEach(arg => {
                    arg = arg.trim(); // Clean up whitespace
                    let typePart = null;
                    let varName = null;
                    // Check for BYREF or BYVAL using a single if statement
                    const modeMatch = /^(BYREF|BYVAL)?\s*(.*)$/.exec(arg);
                    if (modeMatch) {
                        const mode = modeMatch[1];
                        varName = modeMatch[2].trim();
                        lastMode = mode ? mode : lastMode; // Update lastMode or keep previous
                    }
                    // Split on the first colon to separate variable name from type
                    if (varName.includes(':')) {
                        [varName, typePart] = varName.split(':').map(s => s.trim());
                    }
                    args.push([varName, typePart, lastMode]); // Append (varname, type, mode)
                });
                return args;
            };
            const args = parseArguments(rawArgs);
            return ["PROCEDUREDEF", procedureName, args];
        } else if (line === "ENDPROCEDURE") {
            return ["ENDPROCEDURE"];
        } else if (/^CALL\s+(\w+)\((.*)\)$/.test(line)) {
            const match = line.match(/^CALL\s+(\w+)\((.*)\)$/);
            const args = match[2] ? match[2].split(",").map(a => a.trim()) : [];
            return ["CALLPROCEDURE", match[1], args];
        } else if (/^FUNCTION\s+(\w+)\((.*?)\)\s+RETURNS\s+(\w+)$/.test(line)) {
            const match = line.match(/^FUNCTION\s+(\w+)\((.*?)\)\s+RETURNS\s+(\w+)$/);
            const functionName = match[1];
            const rawArgs = match[2];
            const returnType = match[3];
            const parseArguments = (argString) => {
                if (argString.trim() === '') return [];
                return argString.split(',').map(arg => {
                    const [name, type] = arg.split(':').map(s => s.trim());
                    return [name, type];
                });
            };
            const args = parseArguments(rawArgs);
            return ["FUNCTIONDEF", functionName, args, returnType];
        } else if (line === "ENDFUNCTION") {
            return ["ENDFUNCTION"];
        } else if (/^RETURN\s+(.*)$/.test(line)) {
            const match = line.match(/^RETURN\s+(.*)$/);
            return ["RETURN", match[1]];
        } else  if (line.startsWith("TYPE")) {
            const match = line.match(/^TYPE\s+(.*)$/);
            return ["TYPEDEF", match[1]];
        } else if (line === "ENDTYPE") {
            return ["ENDTYPE"];
        } else if (/^OPENFILE\s+(.*?)\s+FOR\s+(.*)$/.test(line)) {
            const match = line.match(/^OPENFILE\s+(.*?)\s+FOR\s+(.*)$/);
            return ["OPENFILE", match[1], match[2]];
        } else if (/^READFILE\s+(.*?),\s*(.*)$/.test(line)) {
            const match = line.match(/^READFILE\s+(.*?),\s*(.*)$/);
            return ["READFILE", match[1], match[2]];
        } else if (/^WRITEFILE\s+(.*?),\s*(.*)$/.test(line)) {
            const match = line.match(/^WRITEFILE\s+(.*?),\s*(.*)$/);
            return ["WRITEFILE", match[1], match[2]];
        } else if (/^CLOSEFILE\s+(.*)$/.test(line)) {
            const match = line.match(/^CLOSEFILE\s+(.*)$/);
            return ["CLOSEFILE", match[1]];
        } else if (/^DOWNLOAD\s+(.*)$/.test(line)) {
            const match = line.match(/^DOWNLOAD\s+(.*)$/);
            return ["DOWNLOAD", match[1]];
        }

       throw new SyntaxError(`Unknown command: ${line}`);
    }

    // Utilities

    findInitialValue(expr) {
        if (expr === "INTEGER" || expr === "INT" || expr === "REAL" || expr === "FLOAT") {
            return 0
        }
        if (expr === "CHARACTER" || expr === "CHAR" || expr === "STRING" || expr === "STR") {
            return "";
        }
        if (expr === "BOOLEAN" || expr === "BOOL") {
            return false;
        }
        if (this.types[expr] !== undefined) {
            return this.types[expr];
        }
        return null;
    }

    replaceAttributes(expr) {
        expr = String(expr);
    
        const regex = /(\w+)\.(\w+)/g;

        expr = expr.replace(regex, (match, object, attribute) => {
            return attribute === "txt" || !isNaN(object) && !isNaN(Number(attribute)) ? object + "." + attribute : this.variables[object][attribute];
        });

        return expr;
    }

    replaceVariables(expr) {
        expr = String(expr);
    
        // First pass: replace using topArgs (excluding quoted parts)
        expr = expr.replace(/(?:'([^']*)'|"([^"]*)")|\b\w+\b/g, (match, singleQuoteContent, doubleQuoteContent) => {
            if (singleQuoteContent !== undefined || doubleQuoteContent !== undefined) {
                return match; // It's a quoted string, so return it as is
            }
    
            const topArgs = this.tempArgs.length > 0 ? this.tempArgs[this.tempArgs.length - 1] : null;
            return topArgs && topArgs[match] !== undefined ? topArgs[match] : match;
        });
    
        // Second pass: replace using this.variables (excluding quoted parts)
        expr = expr.replace(/(?:'([^']*)'|"([^"]*)")|\b\w+\b/g, (match, singleQuoteContent, doubleQuoteContent) => {
            if (singleQuoteContent !== undefined || doubleQuoteContent !== undefined) {
                return match; // It's a quoted string, so return it as is
            }
            return this.variables[match] !== undefined ? this.variables[match] : match;
        });
    
        return expr;
    }

    replaceConstants(expr) {
        expr = String(expr);
    
        expr = expr.replace(/(?:'([^']*)'|"([^"]*)")|\b\w+\b/g, (match, singleQuoteContent, doubleQuoteContent) => {
            if (singleQuoteContent !== undefined || doubleQuoteContent !== undefined) {
                return match; // It's a quoted string, so return it as is
            }
            return this.constants[match] !== undefined ? this.constants[match] : match;
        });
    
        return expr;
    }

    replaceArrays(expr) {
        expr = String(expr);
    
        // Regular expression to match 1D and 2D array references, excluding those in quotes
        const arrayPattern = /(?:'([^']*)'|"([^"]*)")|(\w+)\[([^\]]+?)(?:,\s*([^\]]+?))?\]/g;

        // Function to replace array references with their evaluated values
        const replaceArray = (match, singleQuoteContent, doubleQuoteContent, arrayName, index1, index2) => {
            if (singleQuoteContent !== undefined || doubleQuoteContent !== undefined) {
                return match; // It's a quoted string, so return it as is
            }

            if (index2 !== undefined) { // 2D array reference
                return this.evalArray(`${arrayName}[${this.evalExpression(index1)},${this.evalExpression(index2)}]`);
            } else { // 1D array reference
                return this.evalArray(`${arrayName}[${this.evalExpression(index1)}]`);
            }
        };

        // Replace all array references in the expression
        expr = expr.replace(arrayPattern, replaceArray);

        return expr;
    }

    replaceReferences(expr) {
        if (expr !== this.replaceAttributes(expr)) return this.replaceAttributes(expr);
        if (expr !== this.replaceVariables(expr)) return this.replaceVariables(expr);
        if (expr !== this.replaceConstants(expr)) return this.replaceConstants(expr);
        if (expr !== this.replaceArrays(expr)) return this.replaceArrays(expr);
        return expr;
    }
    
    transformArrayIndexes(expr) {
        const arrayIndexRegex = /(\w+)\[([^\]]+(?:,[^\]]+)?)\]/g; // Matches Array[i] or Table[i, j]
        let transformedExpr = expr;
        let match;

        while ((match = arrayIndexRegex.exec(expr)) !== null) {
        const arrayName = match[1];
        const indicesString = match[2];
        const fullMatch = match[0]; // The entire matched string (e.g., "Grid[i, j]")

        const indices = indicesString.split(',').map(index => {
            const trimmedIndex = index.trim();
            const evaluatedIndex = this.evalExpression(trimmedIndex);

            if (evaluatedIndex !== null && evaluatedIndex !== undefined) {
                return evaluatedIndex;
            } else {
                return trimmedIndex; // Keep the original if evaluation fails
            }
        });

        const replacement = `${arrayName}[${indices.join(', ')}]`;
        transformedExpr = transformedExpr.replace(fullMatch, replacement);
        }

        return transformedExpr;
    }
    
    parseReference(expr) {
        while (this.replaceReferences(expr) !== this.replaceReferences(this.replaceReferences(expr))) {
            expr = this.replaceReferences(expr);
        }
        const pattern1 = /^(.*)\[(.+?)\]$/;
        const pattern2 = /^(.*)\[(.+?),(.+?)\]$/;
        const pattern3 = /(\w+)\.(\w+)/;
        let match;
        if (pattern3.test(expr)) { // Object attribute
            match = expr.match(pattern3);
            return ["OBJECTATTRIBUTE", match[1], match[2]]
        } else if (pattern2.test(expr)) { // 2D array
            match = expr.match(pattern2)
            return ["2DARRAY", match[1], this.evalExpression(match[2]), this.evalExpression(match[3])]
        } else if (pattern1.test(expr)) { // 1D array
            match = expr.match(pattern1);
            return ["1DARRAY", match[1], this.evalExpression(match[2])]
        } else {
            return [expr];
        }
    }

    isReference(expr) {
        return this.parseReference(expr).length > 1 || this.replaceReferences(expr) !== expr;
    }

    evalArray(expr) {
        const pattern1 = /^(.*)\[(.+?)\]$/;
        const pattern2 = /^(.*)\[(.+?),(.+?)\]$/;
        let match;
        if (pattern2.test(expr)) { // 2D array
            match = expr.match(pattern2);
            return this.arrays[match[1]][this.evalExpression(match[2])][this.evalExpression(match[3])];
        } else if (pattern1.test(expr)) { // 1D array
            match = expr.match(pattern1);
            return this.arrays[match[1]][this.evalExpression(match[2])]
        } else {
            return expr;
        }
    }

    removeQuotes(expr) {
        let exprString = String(expr);
        if (this.isValidStringExpression(exprString)) {
            return exprString.slice(1, -1);
        } else {
            return expr;
        }
    }
      
    turnBooleanCapitalized(expr) {
        if (typeof expr === "boolean") return expr ? "TRUE" : "FALSE"
        if (expr === "true") return "TRUE";
        if (expr === "false")  return "FALSE";
        return expr;
    }

    callFunction(funcName, args) {
        if (!this.functions[funcName]) {
            throw new Error(`Function ${funcName} not defined.`);
        }
    
        const funcDef = this.functions[funcName];
        const funcParams = funcDef["defParams"];
        const funcBody = funcDef["funcBody"];
    
        // Ensure the correct number of arguments
        if (funcParams.length !== args.length) {
            throw new Error(`Expected ${funcParams.length} arguments, got ${args.length}.`);
        }
        
        let storedArgs = {};
        funcParams.forEach(([paramName, paramType], index) => {
            const argValue = this.evalExpression(args[index]);
            storedArgs[paramName] = argValue; // Assign argument value to parameter name
        });
        this.tempArgs.push(storedArgs);
    
        // Clear any previous return value
        this.globalReturnValue = null;
    
        // Execute function body
        this.execute(funcBody);

        // Save return value
        let returnValue = this.globalReturnValue;
        this.globalReturnValue = null;;
        this.tempArgs.pop();
    
        // Return the value set by RETURN statement
        return returnValue;
    }

    callProcedure(procName, args) {
        if (!this.procedures[procName]) {
            throw new Error(`Procedure ${procName} not defined.`);
        }
        
        const procDef = this.procedures[procName];
        const procParams = procDef["defParams"];
        const procBody = procDef["procBody"];

        // Ensure the correct number of arguments
        if (procParams.length !== args.length) {
            throw new Error(`Expected ${procParams.length} arguments, got ${args.length}.`);
        }

        let storedArgs = {};
        procParams.forEach(([paramName, paramType, paramValOrRef], index) => {
            if (paramValOrRef === "BYREF" && this.isReference(args[index])) {
                storedArgs[paramName] = args[index];
            } else if (paramName.startsWith('^')) {
                storedArgs[paramName.substring(1)] = args[index];
            } else {
                storedArgs[paramName] = this.evalExpression(args[index]);
            }
        });
        this.tempArgs.push(storedArgs);

        // Execute procedure body
        this.execute(procBody);
        
        procParams.forEach(([paramName, paramType, paramValOrRef], index) => {
            if (paramValOrRef === "BYREF" && this.isReference(args[index])) {
                this.execute([["SET", args[index], this.tempArgs[this.tempArgs.length - 1][paramName]]]);
            } else if (paramName.startsWith('^')) {
                this.execute([["SET", args[index], this.tempArgs[this.tempArgs.length - 1][paramName.substring(1)]]]);
            }
        });

        this.tempArgs.pop();
        return;
    }

    isValidStringExpression(expr) {
        // Regular expression to check for a valid string expression
        const regex = /^(["'])(?:(?!\1).)*\1$/;
      
        // Test the string against the regular expression
        return regex.test(expr);
    }

    replaceSTR(expr) {
        let stack = [];
        let start = -1;
        let end = -1;
    
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] === '(') {
                if (stack.length === 0 && expr.substring(i - 3, i) === 'STR') {
                    start = i;
                }
                stack.push('(');
            } else if (expr[i] === ')') {
                stack.pop();
                if (stack.length === 0 && start !== -1) {
                    end = i;
                    break;
                }
            }
        }
    
        if (start !== -1 && end !== -1) {
            let argExpr = expr.substring(start + 1, end);
            let result = '"' + String(this.evalExpression(argExpr.trim())) + '"';
            expr = expr.substring(0, start - 3) + result + expr.substring(end + 1);
        }
    
        return expr;
    }

    replaceNUM(expr) {
        let stack = [];
        let start = -1;
        let end = -1;
    
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] === '(') {
                if (stack.length === 0 && expr.substring(i - 3, i) === 'NUM') {
                    start = i;
                }
                stack.push('(');
            } else if (expr[i] === ')') {
                stack.pop();
                if (stack.length === 0 && start !== -1) {
                    end = i;
                    break;
                }
            }
        }
    
        if (start !== -1 && end !== -1) {
            let argExpr = expr.substring(start + 1, end);
            let result;
            try {
                if (String(this.evalExpression(argExpr.trim())).toUpperCase() === "TRUE") result = "1";
                else if (String(this.evalExpression(argExpr.trim())).toUpperCase() === "FALSE") result = "0";
                else result = parseFloat(this.evalExpression(argExpr.trim()));
            } catch {
                throw new Error(`Invalid expression: ${argExpr}`);
            }
            expr = expr.substring(0, start - 3) + result + expr.substring(end + 1);
        }
    
        return expr;
    }

    replaceBOOL(expr) {
        let stack = [];
        let start = -1;
        let end = -1;
    
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] === '(') {
                if (stack.length === 0 && expr.substring(i - 4, i) === 'BOOL') {
                    start = i;
                }
                stack.push('(');
            } else if (expr[i] === ')') {
                stack.pop();
                if (stack.length === 0 && start !== -1) {
                    end = i;
                    break;
                }
            }
        }
    
        if (start !== -1 && end !== -1) {
            let argExpr = expr.substring(start + 1, end);
            let result = this.evalExpression(argExpr.trim()) ? "TRUE" : "FALSE";
            expr = expr.substring(0, start - 4) + result + expr.substring(end + 1);
        }
    
        return expr;
    }
    
    evalExpression(expr) {
        expr = String(expr);

        // Handle strings and file names
        if (this.isValidStringExpression(expr) || expr.endsWith('.txt')) return expr;

        // Handle references
        if (expr.startsWith('^')) return expr.substring(1);

        // Replace variables, constants and array references in the expression with their values
        while (expr !== this.replaceReferences(expr))  expr = this.replaceReferences(expr);

        // Detect user-defined function calls using regex (e.g., myFunc(arg1, arg2)), excluding those in quotes
        const userFuncRegex = /(?:'([^']*)'|"([^"]*)")|([A-Za-z_]\w*)\(([^()]*)\)/g;
        let match;

        while ((match = userFuncRegex.exec(expr)) !== null) {
            const singleQuoteContent = match[1];
            const doubleQuoteContent = match[2];
            const fullMatch = match[0];
            const funcName = match[3];   // e.g., "myFunc"
            const argString = match[4];  // e.g., "a + 1, b"

            if (singleQuoteContent !== undefined || doubleQuoteContent !== undefined) continue;

            if (this.functions[funcName]) {
                // Split arguments by comma and evaluate each
                const argValues = argString.split(",").map(arg => arg.trim());

                // Call the user-defined function and get its result
                const result = this.callFunction(funcName, argValues);

                // Replace function call in expression with its result
                expr = expr.replace(fullMatch, result);

                // Reset regex index for further matches in modified expression
                userFuncRegex.lastIndex = 0;
            }
        }

        // Replace logical and comparison operators
        expr = expr.replace(/(?<!&)&(?!&)/g, '+');                          // String Concatenation
        expr = expr.replace(/<>/g, '!=');                                   // Not equal to
        expr = expr.replace(/\bAND\b/g, '&&');                              // And
        expr = expr.replace(/OR/g, '||');                                   // Or
        expr = expr.replace(/NOT/g, '!');                                   // Not
        expr = expr.replace(/TRUE/g, 'true');                               // True
        expr = expr.replace(/FALSE/g, 'false');                             // False
        // expr = expr.replace(/\^/g, '**');                                // Exponentiation
        expr = expr.replace(/MOD/g, '%');                                   // Remainder
        expr = expr.replace(/(\w+)\s+DIV\s+(\w+)/g, 'Math.floor($1 / $2)'); // Floor division
        expr = expr.replace(/(^|[^=!<>])=([^=]|$)/g, '$1==$2');             // Equal to

        // Handle LENGTH, LEFT, RIGHT, MID functions
        while (expr.includes("LENGTH(")) {
            expr = expr.replace(/LENGTH\(([^)]*\(.*?\)[^)]*|[^()]+)\)/g, (match, strExpr) => {
                const evaluatedString = this.removeQuotes(this.evalExpression(strExpr.trim()));
                return evaluatedString.length;
            });
        }

        while (expr.includes("LEFT(")) {
            expr = expr.replace(/LEFT\(([^,]+),\s*([^\)]+)\)/g, (match, strExpr, lenExpr) => {
                const str = this.removeQuotes(String(this.evalExpression(strExpr.trim())));
                const len = parseInt(this.evalExpression(lenExpr.trim()));
                return '"' + String(str.substring(0, len)) + '"';
            });
        }

        while (expr.includes("RIGHT(")) {
            expr = expr.replace(/RIGHT\(([^,]+),\s*([^\)]+)\)/g, (match, strExpr, lenExpr) => {
                const str = this.removeQuotes(String(this.evalExpression(strExpr.trim())));
                const len = parseInt(this.evalExpression(lenExpr.trim()));
                return '"' + String(str.substring(str.length - len)) + '"';
            });
        }

        while (expr.includes("MID(")) {
            expr = expr.replace(/MID\(([^,]+),\s*([^\s,]+),\s*([^\)]+)\)/g, (match, strExpr, startExpr, lenExpr) => {
                const str = this.removeQuotes(String(this.evalExpression(strExpr.trim())));
                const start = parseInt(this.evalExpression(startExpr.trim()));
                const len = parseInt(this.evalExpression(lenExpr.trim()));
                return '"' + String(str.substring(start - 1, start - 1 + len)) + '"';
            });
        }

        // Handle UCASE and LCASE functions
        while (expr.includes("UCASE(") || expr.includes("LCASE(")) {
            expr = expr.replace(/UCASE\(([^)]*\(.*?\)[^)]*|[^()]+)\)/g, (match, strExpr) => {
                const evaluatedString = this.removeQuotes(this.evalExpression(strExpr.trim()));
                return '"' + evaluatedString.toUpperCase() + '"'; // Convert to uppercase
            });
            
            expr = expr.replace(/LCASE\(([^)]*\(.*?\)[^)]*|[^()]+)\)/g, (match, strExpr) => {
                const evaluatedString = this.removeQuotes(this.evalExpression(strExpr.trim()));
                return '"' + evaluatedString.toLowerCase()+ '"'; // Convert to lowercase
            });
        }

        // Handle INT function
        while (expr.includes("INT(")) {
            expr = expr.replace(/INT\(([^)]*\(.*?\)[^)]*|[^()]+)\)/g, (match, numExpr) => {
                const evaluatedNumber = this.evalExpression(numExpr.trim());
                return Math.floor(evaluatedNumber); // Return integer part
            });
        }

        // Handle RAND function
        while (expr.includes("RAND(")) {
            expr = expr.replace(/RAND\(([^)]*\(.*?\)[^)]*|[^()]+)\)/g, (match, numExpr) => {
                const upperLimit = this.evalExpression(numExpr.trim());
                return Math.random() * upperLimit; // Return a random float in [0,x)
            });
        }

        // Handle EOF function
        while (expr.includes("EOF(")) {
            expr = expr.replace(/EOF\(([^)]*\(.*?\)[^)]*|[^()]+)\)/g, (match, fileName) => {
                fileName = this.removeQuotes(this.evalExpression(fileName));
                let file = this.files[fileName];
                let fileLines = file[1].split("\n");
                return file[0] >= fileLines.length ? "true" : "false";
            });
        }

        // Handle MIN and MAX functions
        while (expr.includes("MIN(")) {
            expr = expr.replace(/MIN\(([^,]+?)(,(?![^[]*]))([^,]+?)\)/g, (match, expr1, comma, expr2) => {
                const val1 = this.evalExpression(expr1.trim());
                const val2 = this.evalExpression(expr2.trim());
                return Math.min(val1, val2);
            });
        }

        while (expr.includes("MAX(")) {
            expr = expr.replace(/MAX\(([^,]+?)(,(?![^[]*]))([^,]+?)\)/g, (match, expr1, comma, expr2) => {
                const val1 = this.evalExpression(expr1.trim());
                const val2 = this.evalExpression(expr2.trim());
                return Math.max(val1, val2);
            });
        }

        // Handle STR function
        while (expr.includes("STR(")) {
            expr = this.replaceSTR(expr);
        }  

        // Handle NUM function
        while (expr.includes("NUM(")) {
            expr = this.replaceNUM(expr);
        }

        // Handle BOOL function
        while (expr.includes("BOOL(")) {
            expr = this.replaceBOOL(expr);
        }        

        // Handle strings
        if (this.isValidStringExpression(expr)) return expr;

        try {
            if (!isNaN(expr) && !isNaN(Number(expr)) || expr.toUpperCase() === 'TRUE' || expr.toUpperCase() === 'FALSE') return expr;
            expr = eval(expr);
            if (!isNaN(expr) && !isNaN(Number(expr)) || expr.toUpperCase() === 'TRUE' || expr.toUpperCase() === 'FALSE') return expr;
            else return `"${expr}"`;
        } catch {
            throw new Error(`Invalid expression: ${expr}`);
        }
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
            if (line.includes("//")) line = line.split("//")[0].trim();
            
            // Remove inline comments with #
            if (line.includes("#"))  line = line.split("#")[0].trim();

            if (line === "") continue;

            const parsedLine = this.tokenize(line);

            // Preprocess ELSE IF into ELSE and IF
            if (parsedLine[0] === "ELSE IF") {
                parsedLines.push(["ELSE"]);
                parsedLine[0] = "IF";
            }

            // Handle ENDIF logic
            if(parsedLine[0] === "ENDIF") { 
                for(let j = 0; j < this.elseIfTracker[this.ifCountTracker - 1]; j++) { 
                    parsedLines.push(["ENDIF"]); 
                }
                this.elseIfTracker[this.ifCountTracker - 1] = 0; 
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
                    if (caseParsed[0] === "CASEVALUE") {
                        caseLines.push(caseParsed); // Store individual case actions
                        continue;
                    }

                    // Handle range cases
                    if (caseParsed[0] === "RANGECASE") {
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

                    if (caseLine.length === 4 && caseLine[0] === "RANGECASE") { 
                        parsedLines.push(["IF", `${caseExpression} <= ${caseLine[2]} && ${caseExpression} >= ${caseLine[1]}`]); 
                        caseAction = caseLine[3].toString().trim();
                        caseAction = this.tokenize(caseAction);
                        parsedLines.push(caseAction); 
                        parsedLines.push(["ELSE"]); 
                    }
                    
                    // For individual cases 
                    else { 
                        parsedLines.push(["IF", `${caseExpression} == ${caseLine[1]}`]);
                        caseAction = caseLine[2].toString().trim();
                        caseAction = this.tokenize(caseAction);
                        parsedLines.push(caseAction); 
                        parsedLines.push(["ELSE"]); 
                    }
                }

                // Handle OTHERWISE action
                if (otherwiseLine) {
                    caseAction = otherwiseLine[1].toString().trim();
                    caseAction = this.tokenize(caseAction);
                    parsedLines.push(caseAction); 
                }
                
                for (let j = 0; j < caseCount; j++) {
                    parsedLines.push(["ENDIF"]);
                }
            }

            if (parsedLine[0] !== "CASE" && parsedLine[0] !== "OTHERWISE") {
                parsedLines.push(parsedLine);
            }
        }
        return parsedLines;
    }

    execute(parsedCode) {
        let i = 0;
        let whileCount;
        let repeatCount;
        let forCount;
        let ifCount;
        let currentBlock;
        let funcName;
        let returnType;
        let procName;
        let defParams;
        let topArgs;
        let initialValue;
        let typeName;
        let file;
        let fileLine;
        let fileLines;
        let fileName;
        let val;
    
        while (i < parsedCode.length) {
            const token = parsedCode[i];
            let reference;

            switch (token[0]) {
                case "POPUP":
                    this.popup = this.evalExpression(token[1]);
                    break;

                case "PASS":
                    break;

                case "SET":
                    reference = this.parseReference(token[1]);
                    val = this.evalExpression(token[2]);
                
                    topArgs = this.tempArgs.length > 0 ? this.tempArgs[this.tempArgs.length - 1] : null;
                    
                    if (reference.length === 1) {
                        if (topArgs && reference[0] in topArgs) {
                            topArgs[reference[0]] = val;
                        } else {
                            if (this.constants[reference[0]] === undefined) {
                                this.variables[reference[0]] = val;
                            } else throw new SyntaxError(`Cannot overwrite constant: ${reference[0]}`);
                        }
                    } else if (reference[0] === "1DARRAY") {
                        this.arrays[reference[1]][reference[2]] = val;
                    } else if (reference[0] === "2DARRAY") {
                        this.arrays[reference[1]][reference[2]][reference[3]] = val;
                    } else if (reference[0] === "OBJECTATTRIBUTE") {
                        if (this.variables[reference[1]][reference[2]] === undefined) throw new SyntaxError(`Undefined attribute: ${reference[2]}`);
                        this.variables[reference[1]][reference[2]] = val;
                    }
                    break;

                case "CONSTANT":
                    if (this.isValidStringExpression(token[2])) {
                        val = token[2];
                    } else if (!isNaN(token[2]) && !isNaN(Number(token[2]))) {
                        val = Number(token[2]);
                    } else if (token[2].toUpperCase() === 'TRUE' || token[2].toUpperCase() === 'FALSE') {
                        val = token[2].toUpperCase();
                    } else {
                        const date = new Date(token[2]);
                        if (!isNaN(date.getTime())) {
                            val = date;
                        } else {
                            val = `"${token[2]}"`;
                        }
                    }
                    this.constants[token[1]] = val;
                    break;
                    
                case "OUTPUT":
                    const outputArgs = token[1]; // This is now an array of arguments
                    const outputValue = outputArgs.map(arg => this.turnBooleanCapitalized(this.removeQuotes(this.evalExpression(arg)))).join(''); // Concatenate evaluated values
                    document.getElementById('outputBox').value += outputValue + '\n'; // Output to text box
                    console.log(outputValue); // Output to console
                    if (this.popup) alert(outputValue); // Browser popup
                    break;
        
                case "INPUT":
                    const inputVal = prompt(`Enter value for ${this.transformArrayIndexes(token[1])}:`);
                    if (this.isValidStringExpression(inputVal)) {
                        val = inputVal;
                    } else if (!isNaN(inputVal) && !isNaN(Number(inputVal))) {
                        val = Number(inputVal);
                    } else if (inputVal.toUpperCase() === 'TRUE' || inputVal.toUpperCase() === 'FALSE') {
                        val = inputVal.toUpperCase();
                    } else {
                        const date = new Date(inputVal);
                        if (!isNaN(date.getTime())) {
                            val = date;
                        } else {
                            val = `"${inputVal}"`;
                        }
                    }
                    this.execute([["SET", token[1], val]]);
                    break;

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
                            if (ifCount === 1 && parsedCode[i][0] === 'ELSE') { // Skip the ELSE block
                                executableCode.pop();
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
                    i--; // IF block will skip an extra line
                    break;

                case "THEN":
                    break;  
                
                case "ELSE":
                    break;        

                case "ENDIF":
                    break;

                case "WHILE":
                    let loopCondition = token[1];
                    whileCount = 1;
                    repeatCount = 0;
                    forCount = 0;
                    ifCount = 0;
                    i++;
                    let loopBody = [];
                    currentBlock = [];
                    while (!(parsedCode[i][0] === "ENDWHILE" && whileCount === 1)) {
                        if (parsedCode[i][0] === 'WHILE') {
                            whileCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDWHILE') {
                            whileCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 1 && repeatCount === 0 && forCount === 0 && ifCount === 0) {
                                loopBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'REPEAT') {
                            repeatCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'UNTIL') {
                            repeatCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 1 && repeatCount === 0 && forCount === 0 && ifCount === 0) {
                                loopBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'FOR') {
                            forCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'NEXT') {
                            forCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 1 && repeatCount === 0 && forCount === 0 && ifCount === 0) {
                                loopBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'IF') {
                            ifCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDIF') {
                            ifCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 1 && repeatCount === 0 && forCount === 0 && ifCount === 0) {
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
                            if (this.continueFlag || this.breakFlag) break;
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

                case "DO":
                    break; 

                case "REPEAT":
                    let repeatCondition;
                    whileCount = 0;
                    repeatCount = 1;
                    forCount = 0;
                    ifCount = 0;
                    i++;
                    let repeatBody = [];
                    currentBlock = [];
                    while (!(parsedCode[i][0] === "UNTIL" && repeatCount === 1)) {
                        if (parsedCode[i][0] === 'WHILE') {
                            whileCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDWHILE') {
                            whileCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 1 && forCount === 0 && ifCount === 0) {
                                repeatBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'REPEAT') {
                            repeatCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'UNTIL') {
                            repeatCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 1 && forCount === 0 && ifCount === 0) {
                                repeatBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'FOR') {
                            forCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'NEXT') {
                            forCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 1 && forCount === 0 && ifCount === 0) {
                                repeatBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'IF') {
                            ifCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDIF') {
                            ifCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 1 && forCount === 0 && ifCount === 0) {
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
                    do {
                        for (const currentBlock of repeatBody) {
                            this.execute(currentBlock);
                            if (this.continueFlag || this.breakFlag) break;
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

                case "FOR":
                    whileCount = 0;
                    repeatCount = 0;
                    forCount = 1;
                    ifCount = 0;
                    i++;
                    let forBody = [];
                    currentBlock = [];
                    let iteratorName = token[1];
                    let start = token[2];
                    let end = token[3];
                    let stepValue = token[4];
                    while (!(parsedCode[i][0] === "NEXT" && forCount === 1)) {
                        if (parsedCode[i][0] === 'WHILE') {
                            whileCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDWHILE') {
                            whileCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 0 && forCount === 1 && ifCount === 0) {
                                forBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'REPEAT') {
                            repeatCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'UNTIL') {
                            repeatCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 0 && forCount === 1 && ifCount === 0) {
                                forBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'FOR') {
                            forCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'NEXT') {
                            forCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 0 && forCount === 1 && ifCount === 0) {
                                forBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (parsedCode[i][0] === 'IF') {
                            ifCount++;
                            currentBlock.push(parsedCode[i]);
                        } else if (parsedCode[i][0] === 'ENDIF') {
                            ifCount--;
                            currentBlock.push(parsedCode[i]);
                            if (whileCount === 0 && repeatCount === 0 && forCount === 1 && ifCount === 0) {
                                forBody.push(currentBlock);
                                currentBlock = [];
                            }
                        } else if (currentBlock.length === 0) {
                            currentBlock = [parsedCode[i]];
                            forBody.push(currentBlock);
                            currentBlock = [];
                        } else {
                            currentBlock.push(parsedCode[i]);
                        }
                        i++;
                    }
                    for (let forIterator = this.evalExpression(start); forIterator <= this.evalExpression(end); forIterator += this.evalExpression(stepValue)) {
                        this.variables[iteratorName] = forIterator;
                        for (const currentBlock of forBody) {
                            this.execute(currentBlock);
                            if (this.continueFlag || this.breakFlag) break;
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

                case "NEXT":
                    break;
                
                case "CONTINUE":
                    this.continueFlag = true;
                    break;
                    
                case "BREAK":
                    this.breakFlag = true;
                    break;

                case "DECLAREVAR":
                    initialValue = this.findInitialValue(token[2]);
                    if (this.declareTypeName === null) {
                        if (Array.isArray(token[1])) {
                            token[1].forEach(varName => {
                                this.variables[varName] = initialValue;
                            });
                        } else {
                            // Handle the case where token[1] is not an array (e.g., a single variable)
                            this.variables[token[1]] = initialValue;
                        }
                    } else {
                        if (Array.isArray(token[1])) {
                            token[1].forEach(varName => {
                                this.types[this.declareTypeName][varName] = initialValue;
                            });
                        } else {
                            // Handle the case where token[1] is not an array (e.g., a single variable)
                            this.types[this.declareTypeName][token[1]] = initialValue;
                        }
                    }
                    break;

                case "DECLAREARRAY":
                    initialValue = this.findInitialValue(token[3]);
                    if (this.declareTypeName === null) {
                        this.arrays[token[1]] = Array(token[2][1] + 1);
                        this.arrays[token[1]].fill(initialValue);
                    } else {
                        this.types[this.declareTypeName][token[1]] = Array(token[2][1] + 1);
                        this.types[this.declareTypeName][token[1]].fill(initialValue);
                    }
                    break;
                
                case "DECLARE2DARRAY":
                    initialValue = this.findInitialValue(token[4]);
                    if (this.declareTypeName === null) {
                        this.arrays[token[1]] = Array(token[2][1] + 1);
                        for (let i = 0; i < token[2][1] + 1; i++) {
                            this.arrays[token[1]][i] = Array(token[3][1] + 1);
                            this.arrays[token[1]][i].fill(initialValue);
                        }
                    } else {
                        this.types[this.declareTypeName][token[1]] = Array(token[2][1] + 1);
                        for (let i = 0; i < token[2][1] + 1; i++) {
                            this.types[this.declareTypeName][token[1]][i] = Array(token[3][1] + 1);
                            this.types[this.declareTypeName][token[1]][i].fill(initialValue);
                        }
                    }
                    break;
                
                case "FUNCTIONDEF":
                    funcName = token[1];
                    defParams = token[2];
                    returnType = token[3];
                    
                    // Collect all lines until "ENDFUNCTION" as the function body
                    const funcBody = [];
                    i++;
                    while (i < parsedCode.length && parsedCode[i][0] !== "ENDFUNCTION") {
                        funcBody.push(parsedCode[i]);
                        i++;
                    }
                
                    // Store function definition in functions object
                    this.functions[funcName] = {
                        defParams: defParams,       // Array of [paramName, paramType]
                        returnType: returnType,
                        funcBody: funcBody,
                    };
                    break;

                case "ENDFUNCTION":
                    break;
                
                case "RETURN":
                    // Evaluate the return expression and store it as the global return value
                    this.globalReturnValue = this.evalExpression(token[1]);
                    return; // Exit immediately from function execution
                
                case "PROCEDUREDEF":
                    procName = token[1];
                    defParams = token[2];
                
                    // Collect procedure body
                    const procBody = [];
                    i++;
                    while (parsedCode[i][0] !== "ENDPROCEDURE") {
                        procBody.push(parsedCode[i]);
                        i++;
                    }
                
                    // Store procedure in the interpreter's procedures object
                    this.procedures[procName] = { defParams, procBody: procBody };
                    break;
                    
                case "ENDPROCEDURE":
                    break;

                case "CALLPROCEDURE":
                    procName = token[1];
                    const args = token[2];
                    this.callProcedure(procName, args);
                    break;

                case "TYPEDEF":
                    typeName = token[1];
                    this.declareTypeName = typeName;
                    this.types[typeName] = {};
                    while (parsedCode[i][0] !== "ENDTYPE") {
                        i++;
                        if (parsedCode[i][0].startsWith("DECLARE")) this.execute([parsedCode[i]]);
                    }
                    this.declareTypeName = null;
                    break;

                case "ENDTYPE":
                    break;

                case "OPENFILE":
                    fileName = this.removeQuotes(this.evalExpression(token[1]));
                    file = this.files[fileName];
                    if (!file) {
                        this.files[fileName] = [0, ""];
                        file = this.files[fileName];
                    }
                    if (token[2] === "READ") {
                        this.files[fileName] = [0, file[1]];
                    } else if (token[2] === "WRITE") {
                        this.files[fileName] = [0, ""];
                    } else if (token[2] === "APPEND") {
                        let fileLines = file[1].split("\n");
                        this.files[fileName] = [fileLines.length - 1, file[1]];
                    }
                    break;

                case "READFILE":
                    fileName = this.removeQuotes(this.evalExpression(token[1]));
                    file = this.files[fileName];
                    fileLines = file[1].split("\n");
                    fileLine = '"' + fileLines[file[0]] + '"';
                    this.execute([["SET", token[2], fileLine]]);
                    this.files[fileName] = [file[0] + 1, file[1]];
                    break;

                case "WRITEFILE":
                    fileName = this.removeQuotes(this.evalExpression(token[1]));
                    file = this.files[fileName];
                    fileLines = file[1].split("\n");
                    fileLine = fileLines[file[0]];
                    let newFileContent = file[1] ? file[1] + "\n" : "";
                    newFileContent = newFileContent + this.removeQuotes(this.evalExpression(token[2]));
                    this.files[fileName] = [file[0] + 1, newFileContent];
                    break;

                case "CLOSEFILE":
                    fileName = this.removeQuotes(this.evalExpression(token[1]));
                    this.files[fileName][0] = 0;
                    break;

                case "DOWNLOAD":
                    fileName = this.removeQuotes(this.evalExpression(token[1]));
                    let text = this.files[fileName][1];
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    break;

                default:
                    throw new SyntaxError(`Unknown command: ${token[0]}`);
            }

            i++;
        }
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
