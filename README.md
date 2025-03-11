<html lang="en">
<body>

<h1>PSEUDORUNNER by NekawaH & inkalbert</h1>

<h2>Instructions:</h2>
<ol>
    <li>Download the zip file or folder</li>
    <li>Unzip the file</li>
    <li>Open <code>index.html</code> in a browser (e.g. Google Chrome)</li>
</ol>
<img width="401" alt="Screenshot 2025-02-09 at 20 33 49" src="https://github.com/user-attachments/assets/403489dc-743e-4745-9ec8-fece1b67647e" />
<p>Alternatively, go to Github Pages: https://nekawah.github.io/Pseudorunner/</p>

<h2>Supported Syntax:</h2>
<h3><strong>OPERATORS</strong></h3>
<pre><code>a + b     // Addition
a - b     // Subtraction
a * b     // Multiplication
a / b     // Division
a ** b    // Power
a DIV b   // Floor Division
a MOD b   // Remainder
a == b    // Equal
a <> b    // Not Equal To
a > b     // Greater Than
a < b     // Less Than
a >= b    // Greater Than or Equal To
a <= b    // Less Than or Equal To</code></pre>

<h3><strong>INPUT</strong></h3>
<pre><code>INPUT &lt;identifier&gt;</code></pre>
<p><strong>Example:</strong> <code>INPUT userInput</code></p>

<h3><strong>OUTPUT</strong></h3>
<pre><code>OUTPUT &lt;value&gt;</code></pre>
<p><strong>Example:</strong> <code>OUTPUT "hello world"</code>, <code>OUTPUT 114514</code>, <code>OUTPUT totalScore</code></p>

<h3><strong>ASSIGNMENT</strong></h3>
<pre><code>SET &lt;identifier&gt; TO &lt;value&gt;
&lt;identifier&gt; &lt;- &lt;value&gt;
&lt;identifier&gt; = &lt;value&gt;
</code></pre>
<p><strong>Example:</strong> <code>SET x TO 10</code>, <code>x &lt;- 10</code>, <code>x = 10</code></p>

<h3><strong>WHILE</strong></h3>
<pre><code>WHILE &lt;condition&gt; DO
   &lt;statements&gt;
ENDWHILE</code></pre>
<p><strong>Example:</strong></p>
<pre><code>WHILE count < 5 DO
   OUTPUT count
   count &lt;- count + 1
ENDWHILE</code></pre>

<h3><strong>REPEAT</strong></h3>
<pre><code>REPEAT
    &lt;statements&gt;
UNTIL &lt;condition&gt;</code></pre>
<p><strong>Example:</strong></p>
<pre><code>count &lt;- 0
REPEAT
    OUTPUT count
    count &lt;- count + 1
UNTIL count = 5</code></pre>

<h3><strong>FOR</strong></h3>
<pre><code>FOR &lt;identifier&gt; &lt;- &lt;value1&gt; TO &lt;value2&gt; (also support FOR &lt;identifier&gt; = &lt;value1&gt; TO &lt;value2&gt;)
   &lt;statements&gt;
NEXT &lt;identifier&gt;</code></pre>
<p><strong>Example:</strong></p>
<pre><code>FOR i &lt;- 1 TO 5
   OUTPUT i
NEXT i</code></pre>

<h3><strong>IF/ELSE IF/ELSE</strong></h3>
<pre><code>IF &lt;condition&gt; THEN
    &lt;statements&gt;
ELSE IF &lt;condition&gt;
    &lt;statements&gt;
ELSE
    &lt;statements&gt;
ENDIF</code></pre>
<p><strong>Example:</strong></p>
<pre><code>IF x > 10 THEN
    OUTPUT 'x is greater than 10'
ELSE IF x < 10
    OUTPUT 'x is less than 10'
ELSE
    OUTPUT 'x is equal to 10'
ENDIF</code></pre>

<h3><strong>CASE</strong></h3>
<pre><code>CASE OF &lt;identifier&gt;
    &ltvalue 1&gt; : &lt;statement&gt;
    &ltvalue 2&gt; : &lt;statement&gt;
    ...
    OTHERWISE: &lt;statement&gt;
ENDCASE</code></pre>
<p><strong>Example:</strong></p>
<pre><code>CASE OF Score
    90 TO 100 : OUTPUT "Grade: A"
    80 TO 89  : OUTPUT "Grade: B"
    70 TO 79  : OUTPUT "Grade: C"
    60 TO 69  : OUTPUT "Grade: D"
    0 TO 59   : OUTPUT "Grade: F"
    OTHERWISE : OUTPUT "Score out of range"
ENDCASE</code></pre>

<h3><strong>VARIABLE</strong></h3>
<pre><code>DECLARE &lt;identifier&gt; : &lt;data type&gt;
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>DECLARE Count : INTEGER
DECLARE Name : STRING
DECLARE Finished : BOOLEAN
</code></pre>

<h3><strong>CONSTANT</strong></h3>
<pre><code>CONSTANT &lt;identifier&gt; &lt;- &lt;value&gt;
CONSTANT &lt;identifier&gt; = &lt;value&gt;
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>CONSTANT const &lt;- 114514
OUTPUT const // 114514
const &lt;- const + 1 // Error: Cannot change constant value
</code></pre>

<h3><strong>USER DEFINED DATA TYPE</strong></h3>
<pre><code>TYPE &lt;identifier&gt;
    DECLARE &lt;attribute&gt; : &lt;data type&gt;
    ...
ENDTYPE</code></pre>
<p><strong>Example:</strong></p>
<pre><code>TYPE Player
    DECLARE username : STRING
    DECLARE password : STRING
    DECLARE score : INTEGER
ENDTYPE

DECLARE nekawah : Player
nekawah.username &lt;- "NekawaH"
nekawah.password &lt;- "hello114514_world1919810"
nekawah.score &lt;- 114514
</code></pre>

<h3><strong>ARRAY</strong></h3>
<pre><code>DECLARE &lt;identifier&gt;:ARRAY[&lt;lower&gt;:&lt;upper&gt;] OF &ltdata type&gt;
DECLARE &lt;identifier&gt;:ARRAY[&lt;lower1&gt;:&lt;upper1&gt;,&lt;lower2&gt;:&lt;upper2&gt;] OF &ltdata type&gt;
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>DECLARE StudentNames : ARRAY[1:30] OF STRING
DECLARE NoughtsAndCrosses : ARRAY[1:3,1:3] OF CHAR
StudentNames[1] &lt;- "Ali"
NoughtsAndCrosses[2,3] &lt;- 'X'
n &lt;- 1
StudentNames[n+1] &lt;- StudentNames[n]</code></pre>

<h3><strong>REFERENCE</strong></h3>
<pre><code>^&lt;identifier&gt;</code></pre>
<p><strong>Example:</strong></p>
<pre><code>Ref &lt;- ^Val
Val &lt;- 114
OUTPUT Ref // 114
Val &lt;- 514
OUTPUT Ref // 514
Ref &lt;- 1919
OUTPUT Ref // 1919
OUTPUT Val // 1919
</code></pre>

<h3><strong>DATA TYPE CONVERSION</strong></h3>
<pre><code>STR(&lt;argument&gt;)
NUM(&lt;argument&gt;)
BOOL(&lt;argument&gt;)
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>OUTPUT STR(1) & STR(2) // 12
OUTPUT NUM("12") + NUM(TRUE) // 13
OUTPUT BOOL(1 AND 0) // FALSE
</code></pre>

<h3><strong>STRING</strong></h3>
<pre><code>LEFT(&lt;string&gt;,&lt;length&gt;)
RIGHT(&lt;string&gt;,&lt;length&gt;)
MID(&lt;string&gt;,&lt;position&gt;,&lt;length&gt;)
LENGTH(&lt;string&gt;)
UCASE(&lt;string&gt;)
LCASE(&lt;string&gt;)
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>OUTPUT LEFT("ABCDEFGH",3) // "ABC"
OUTPUT RIGHT("ABCDEFGH",3) // "FGH"
OUTPUT MID("ABCDEFGH",2,3) // "BCD"
OUTPUT LENGTH("HELLO world") // 11
OUTPUT UCASE("HELLO world") // "HELLO WORLD"
OUTPUT LCASE("HELLO world") // "hello world"
</code></pre>

<h3><strong>RANDOM</strong></h3>
<pre><code>RAND(&lt;number&gt;)
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>OUTPUT RAND(85) // a real number between [0,85)
</code></pre>

<h3><strong>FUNCTION</strong></h3>
<pre><code>FUNCTION &lt;identifier&gt;(&lt;param&gt; : &lt;data type&gt;) RETURNS &lt;data type&gt;
    &lt;statements&gt;
    ...
    RETURN &lt;value&gt;
ENDFUNCTION
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>FUNCTION add(x : REAL, y : REAL) RETURNS REAL
    RETURN x + y
ENDFUNCTION
OUTPUT add(1,2) // 3</code></pre>

<h3><strong>PROCEDURE</strong></h3>
<pre><code>PROCEDURE &lt;identifier&gt;(&lt;BYVAL/BYREF&gt; &lt;param&gt; : &lt;data type&gt; ...)
    &lt;statements&gt;
    ...
ENDPROCEDURE
CALL &lt;identifier&gt;(&lt;params&gt;)
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>PROCEDURE swap(BYREF x : REAL, y : REAL) // Also support using reference sign: PROCEDURE swap(^x : REAL, ^y : REAL)
    temp &lt;- x
    x &lt;- y
    y &lt;- temp
ENDPROCEDURE
a &lt;- 1
b &lt;- 2
CALL swap(a,b)
OUTPUT a, " ", b // 2 1</code></pre>

<h3><strong>FILE HANDLING</strong></h3>
<pre><code>OPENFILE &lt;file identifier&gt; FOR &lt;file mode&gt;
READFILE &lt;file identifier&gt;, &lt;variable&gt;
WRITEFILE &lt;file identifier&gt;, &lt;data&gt;
CLOSEFILE &lt;file identifier&gt;
DOWNLOAD &lt;file identifier&gt;
EOF(&lt;file identifier&gt;)
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>OPENFILE "File.txt" FOR WRITE
WRITEFILE "File.txt", "Hello world"
CLOSEFILE "File.txt"
OPENFILE "File.txt" FOR APPEND
WRITEFILE "File.txt", "Another line"
CLOSEFILE "File.txt"

OPENFILE "File.txt" FOR READ
WHILE NOT EOF("File.txt")
    READFILE "File.txt", text
    OUTPUT text
ENDWHILE
DOWNLOAD "File.txt"
CLOSEFILE "File.txt"</code></pre>

<h3><strong>BROWSER POPUP</strong></h3>
<pre><code>POPUP &lt;boolean&gt;</code></pre>
<p><strong>Example:</strong></p>
<pre><code>POPUP TRUE
OUTPUT "This message will pop up in your browser"
POPUP FALSE
OUTPUT "But this one will not"
</code></pre>

</body>
</html>
