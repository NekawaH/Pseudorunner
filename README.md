**PSEUDORUNNER by NekawaH**

**Instructions:**
1. Download the zip file
2. Unzip the file
3. Open index.html in a browser (e.g. Google Chrome)

**Supported Syntax:**

***INPUT***
INPUT <identifier>
*Example:* INPUT userInput

***OUTPUT***
OUTPUT <value>
*Example:* OUTPUT 'hello world', OUTPUT 114514, OUTPUT totalScore

***SET VALUE***
SET <identifier> TO <value> (also support <identifier> <- <value> and <identifier> = <value>)
*Example:* SET x TO 10, x <- 10, x = 10

***IF/ELSE IF/ELSE***
IF <condition> THEN
    <statements>
ELSE IF <condition>
    <statements>
ELSE
    <statements>
ENDIF

*Example:*
IF x > 10 THEN
    OUTPUT 'x is greater than 10'
ELSE IF x < 10
    OUTPUT 'x is less than 10'
ELSE
    OUTPUT 'x is equal to 10'
ENDIF

***WHILE***
WHILE <condition> DO
   <statements>
ENDWHILE

*Example:*
WHILE count < 5 DO
   OUTPUT count
   count <- count + 1
ENDWHILE

***FOR***
FOR <iterator> <- <start> TO <end> (also support FOR <iterator> = <start> TO <end>)
   <statements>
NEXT <iterator>

*Example:*
FOR i <- 1 TO 5
   OUTPUT i
NEXT i
