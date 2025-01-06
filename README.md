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

</body>
</html>
