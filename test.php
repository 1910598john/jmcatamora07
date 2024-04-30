<?php 
$value = "apple";
$haystack = "orange";

// Incorrect usage: $haystack is a string, not an array
$result = in_array($value, $haystack);

echo $result;
?>