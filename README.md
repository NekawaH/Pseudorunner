<!DOCTYPE html>
<html lang="en">
<body>

<h1>PSEUDORUNNER by NekawaH</h1>

<h2>Instructions:</h2>
<ol>
    <li>Download the zip file or folder</li>
    <li>Unzip the file</li>
    <li>Open <code>index.html</code> in a browser (e.g. Google Chrome)</li>
</ol>

<p>(Only files <code>index.html</code>, <code>styles.css</code>, and <code>interpreter.js</code> are necessary)</p>

<h2>Supported Syntax:</h2>

<h3><strong>INPUT</strong></h3>
<pre><code>INPUT &lt;identifier&gt;</code></pre>
<p><strong>Example:</strong> <code>INPUT userInput</code></p>

<h3><strong>OUTPUT</strong></h3>
<pre><code>OUTPUT &lt;value&gt;</code></pre>
<p><strong>Example:</strong> <code>OUTPUT 'hello world'</code>, <code>OUTPUT 114514</code>, <code>OUTPUT totalScore</code></p>

<h3><strong>SET VALUE</strong></h3>
<pre><code>SET &lt;identifier&gt; TO &lt;value&gt; (also support &lt;identifier&gt; &lt;- &lt;value&gt; and &lt;identifier&gt; = &lt;value&gt;)</code></pre>
<p><strong>Example:</strong> <code>SET x TO 10</code>, <code>x &lt;- 10</code>, <code>x = 10</code></p>

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

<h3><strong>WHILE</strong></h3>
<pre><code>WHILE &lt;condition&gt; DO
   &lt;statements&gt;
ENDWHILE</code></pre>
<p><strong>Example:</strong></p>
<pre><code>WHILE count < 5 DO
   OUTPUT count
   count &lt;- count + 1
ENDWHILE</code></pre>

<h3><strong>FOR</strong></h3>
<pre><code>FOR &lt;identifier&gt; &lt;- &lt;value1&gt; TO &lt;value2&gt; (also support FOR &lt;identifier&gt; = &lt;value1&gt; TO &lt;value2&gt;)
   &lt;statements&gt;
NEXT &lt;identifier&gt;</code></pre>
<p><strong>Example:</strong></p>
<pre><code>FOR i &lt;- 1 TO 5
   OUTPUT i
NEXT i</code></pre>

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

<h3><strong>REPEAT-UNTIL</strong></h3>
<pre><code>REPEAT
    &lt;statements&gt;
UNTIL &lt;condition&gt;</code></pre>
<p><strong>Example:</strong></p>
<pre><code>count &lt;- 0
REPEAT
    OUTPUT count
    count &lt;- count + 1
UNTIL count = 5</code></pre>

<h3><strong>ARRAY</strong></h3>
<pre><code>DECLARE &lt;identifier&gt;:ARRAY[&lt;lower&gt;:&lt;upper&gt;] OF &ltdata type&gt;
DECLARE &lt;identifier&gt;:ARRAY[&lt;lower1&gt;:&lt;upper1&gt;,&lt;lower2&gt;:&lt;upper2&gt;] OF &ltdata type&gt;
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>DECLARE StudentNames : ARRAY[1:30] OF STRING
DECLARE NoughtsAndCrosses : ARRAY[1:3,1:3] OF CHAR
StudentNames[1] &lt;- "Ali"
NoughtsAndCrosses[2,3] &lt;- 'X'
StudentNames[n+1] &lt;- StudentNames[n]</code></pre>

<h3><strong>STRING</strong></h3>
<pre><code>LEFT&lpar;&lt;string&gt;,&lt;length&gt;&rpar;
RIGHT&lpar;&lt;string&gt;,&lt;length&gt;&rpar;
MID&lpar;&lt;string&gt;,&lt;position&gt;,&lt;length&gt;&rpar;
LENGTH&lpar;&lt;string&gt;&rpar;
UCASE&lpar;&lt;string&gt;&rpar;
LCASE&lpar;&lt;string&gt;&rpar;
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>LEFT&lpar;&quot;ABCDEFGH&quot;,3&rpar; // Returns &quot;ABC&quot;
RIGHT&lpar;&quot;ABCDEFGH&quot;,3&rpar; // Returns &quot;FGH&quot;
MID&lpar;&quot;ABCDEFGH&quot;,2,3&rpar; // Returns &quot;BCD&quot;
LENGTH&lpar;"HELLO world"&rpar; // Returns 11
UCASE&lpar;"HELLO world"&rpar; // Returns &quot;HELLO WORLD&quot;
LCASE&lpar;"HELLO world"&rpar; // Returns &quot;hello world&quot;
</code></pre>

<h3><strong>RANDOM</strong></h3>
<pre><code>RAND&lpar;&lt;number&gt;&rpar;
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>RAND&lpar;85&rpar; // Returns a real number between &#91;0,85&rpar;
</code></pre>

<h3><strong>FUNCTION</strong></h3>
<pre><code>FUNCTION &lt;identifier&gt;&lpar;&lt;param&gt; : &lt;data type&gt;&rpar; RETURNS &lt;data type&gt;
    &lt;statements&gt;
    ...
    RETURN &lt;value&gt;
ENDFUNCTION
</code></pre>
<p><strong>Example:</strong></p>
<pre><code>FUNCTION add&lpar;x : REAL, y : REAL&rpar; RETURNS REAL
    RETURN x + y
ENDFUNCTION
// Outputs 3
OUTPUT add&lpar;1,2&rpar;</code></pre>

</body>
</html>
