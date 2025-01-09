// Function to format HTML with 4-space indentation
function formatHTML(html) {
    // Split the HTML by lines
    const lines = html.split('\n');
 
    // Variable to keep track of current indentation level
    let indentLevel = 0;
    const formattedLines = [];
 
    // Regular expression patterns to detect opening and closing tags
    const openingTagPattern = /<[^\/!][^>]*>/;
    const closingTagPattern = /<\/[^>]+>/;
 
    lines.forEach(line => {
        // Trim the line to prevent leading/trailing whitespace issues
        line = line.trim();
 
        if (line.match(closingTagPattern)) {
            // If the line contains a closing tag, decrease the indent level before adding it
            indentLevel--;
        }
 
        // Add the current line with the correct indentation
        formattedLines.push('    '.repeat(indentLevel) + line); // Use four spaces for indentation
 
        if (line.match(openingTagPattern) && !line.match(closingTagPattern)) {
            // If the line contains an opening tag and not a self-closing tag, increase the indent level
            indentLevel++;
        }
    });
 
    // Join the formatted lines into a single string with newlines
    return formattedLines.join('\n');
}
 
// Function to read from the input textarea, format HTML, and display it in the output textarea
function formatAndDisplayHTML() {
    const inputBox = document.getElementById('inputBox');
    const outputBox = document.getElementById('outputBox');
 
    const rawHTML = inputBox.value; // Get raw HTML from the input textbox
    const formattedHTML = formatHTML(rawHTML); // Format the HTML using formatHTML function
 
    outputBox.value = formattedHTML; // Display the formatted HTML in the output textbox
}
 
// Function to handle tab key for input box - adding or removing indentation
function handleTab(event) {
    const inputBox = document.getElementById('inputBox');
 
    if (event.key === "Tab") {
        event.preventDefault(); // Prevent the default tab behavior
        const start = inputBox.selectionStart;
        const end = inputBox.selectionEnd;
 
        // Get the text in the input box
        const lines = inputBox.value.split('\n');
        // Check if Shift key is pressed to determine tabbing back
        if (event.shiftKey) {
            // Handle Shift + Tab to remove indentation
            if (start !== end) {
                const startLine = inputBox.value.substring(0, start).split('\n').length - 1; // Get line index for the start
                const endLine = inputBox.value.substring(0, end).split('\n').length - 1; // Get line index for the end
 
                // Remove spaces from the beginning of each selected line
                for (let i = startLine; i <= endLine; i++) {
                    // Remove up to four leading spaces
                    const leadingSpaces = lines[i].match(/^( {1,4})/); // Get leading spaces (1 to 4)
                    if (leadingSpaces) {
                        lines[i] = lines[i].substring(leadingSpaces[0].length); // Remove those spaces
                    }
                }
 
                // Join the modified lines back into a single string with newlines
                inputBox.value = lines.join('\n');
 
                // Move cursor to the end of the last modified line
                inputBox.selectionStart = inputBox.selectionEnd = start; // Adjust cursor
            } else {
                // If no text is selected, remove up to four spaces from the current line
                const currentLineIndex = inputBox.value.substring(0, start).split('\n').length - 1;
 
                // Remove spaces from the beginning of the current line
                const leadingSpaces = lines[currentLineIndex].match(/^( {1,4})/); // Get leading spaces
                if (leadingSpaces) {
                    lines[currentLineIndex] = lines[currentLineIndex].substring(leadingSpaces[0].length); // Remove those spaces
                    inputBox.value = lines.join('\n'); // Update the input box value
                    inputBox.selectionStart = inputBox.selectionEnd = start - leadingSpaces[0].length; // Adjust cursor position
                }
            }
        } else {
            // Handle Tab to add indentation
            if (start !== end) {
                const startLine = inputBox.value.substring(0, start).split('\n').length - 1; // Get line index for the start
                const endLine = inputBox.value.substring(0, end).split('\n').length - 1; // Get line index for the end
                // Add four spaces to the beginning of each line in the selected range
                for (let i = startLine; i <= endLine; i++) {
                    lines[i] = '    ' + lines[i]; // Add four spaces
                }
 
                // Join the modified lines back into a single string with newlines
                inputBox.value = lines.join('\n');
 
                // Move cursor to the end of the last modified line
                inputBox.selectionStart = inputBox.selectionEnd = start + (4 * (endLine - startLine + 1));
            } else {
                // If no text is selected, insert four spaces at the current cursor position
                const newPosition = start + 4; // Calculate the new cursor position
                inputBox.value = inputBox.value.substring(0, start) + '    ' + inputBox.value.substring(end);
                inputBox.selectionStart = inputBox.selectionEnd = newPosition; // Move cursor to the new position
            }
        }
    }
}
 
// Attach the handlers to the textarea
document.getElementById('inputBox').addEventListener('keydown', handleTab);