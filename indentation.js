// Function to handle tab key for input box - adding or removing indentation
function handleIndentation(event) {
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
                
                let linesMove = 0;
                let firstLineMoved = 0;

                // Remove spaces from the beginning of each selected line
                for (let i = startLine; i <= endLine; i++) {
                    // Remove up to four leading spaces
                    const leadingSpaces = lines[i].match(/^( {1,4})/); // Get leading spaces (1 to 4)
                    if (leadingSpaces) {
                        lines[i] = lines[i].substring(leadingSpaces[0].length); // Remove those spaces
                        linesMove++;
                        if (i == startLine) firstLineMoved = 4;
                    }
                }
 
                // Join the modified lines back into a single string with newlines
                inputBox.value = lines.join('\n');
 
                // Move the selection range
                inputBox.selectionStart = start - firstLineMoved;
                inputBox.selectionEnd = end - linesMove * 4;
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
                
                // Move the selection range
                inputBox.selectionStart = start + 4;
                inputBox.selectionEnd = end + (endLine - startLine + 1) * 4;
            } else {
                // If no text is selected, insert four spaces at the current cursor position
                const newPosition = start + 4; // Calculate the new cursor position
                inputBox.value = inputBox.value.substring(0, start) + '    ' + inputBox.value.substring(end);
                inputBox.selectionStart = inputBox.selectionEnd = newPosition; // Move cursor to the new position
            }
        }
    }

    if (event.key === "Backspace") {
        const start = inputBox.selectionStart;
        const end = inputBox.selectionEnd;
 
        // Get the text in the input box
        const lines = inputBox.value.split('\n');
        const currentLineIndex = inputBox.value.substring(0, start).split('\n').length - 1;
        const leadingSpaces = lines[currentLineIndex].match(/^( {1,4})/); // Get leading spaces
        const subLines = inputBox.value.substring(0, start).split('\n');
        
        // Handle Backspace to remove indentation
        if (start === end) {
            // Remove 4 spaces from the beginning of the current line
            if (!subLines[subLines.length - 1].trim() && subLines[subLines.length - 1] !== "") {
                event.preventDefault(); // Prevent the default tab behavior
                lines[currentLineIndex] = lines[currentLineIndex].substring(leadingSpaces[0].length); // Remove those spaces
                inputBox.value = lines.join('\n'); // Update the input box value
                inputBox.selectionStart = inputBox.selectionEnd = start - leadingSpaces[0].length; // Adjust cursor position
            }
        }
    }

    if (event.key === "Enter") {
        // If text is selected, let the browser handle the event as usual.
        if (inputBox.selectionStart !== inputBox.selectionEnd) {
            return;
        }

        // Prevent the default action
        event.preventDefault();

        // Get the current cursor position
        const start = inputBox.selectionStart;
        const end = inputBox.selectionEnd;

        // Get everything in the textarea before the cursor
        const textBeforeCursor = inputBox.value.substring(0, start);

        // Find the beginning of the previous line (last newline before the cursor)
        const lastNewline = textBeforeCursor.lastIndexOf("\n");
        // Get the current line text
        const currentLine = textBeforeCursor.substring(lastNewline + 1);

        // Use a regex to match the leading whitespace in the current line
        const indentMatch = currentLine.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : "";

        // Prepare the new text: newline + same indentation as found
        const newText = "\n" + indent;

        // Insert the newText at the cursor position
        const textAfterCursor = inputBox.value.substring(inputBox.selectionEnd);
        inputBox.value = textBeforeCursor + newText + textAfterCursor;

        // Move the cursor to the end of the inserted indentation
        const newCursorPos = start + newText.length;
        inputBox.selectionStart = inputBox.selectionEnd = newCursorPos;
    }
}
 
// Attach the handlers to the textarea
document.getElementById('inputBox').addEventListener('keydown', handleIndentation);

// Line Number
function updateLineNumbers() {
    const inputBox = document.getElementById('inputBox');
    const lineNumbers = document.getElementById('lineNumbers');
    let lines = inputBox.value.split('\n');
    lineNumbers.innerHTML = lines.map((_, i) => '<div>' + (i + 1) + '</div>').join('');
}

const inputBox = document.getElementById('inputBox');
const lineNumbers = document.getElementById('lineNumbers');

// Add event listeners for input and scroll
inputBox.addEventListener('keydown', updateLineNumbers);
inputBox.addEventListener('input', updateLineNumbers);

// Control scroll
inputBox.addEventListener('scroll', function() {
    lineNumbers.scrollTop = inputBox.scrollTop;
});
lineNumbers.addEventListener('scroll', function() {
    inputBox.scrollTop = lineNumbers.scrollTop;
});

window.onload = function() {
    updateLineNumbers()
};
