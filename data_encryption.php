<?php
$string = "admin123";

$ciphering = "AES-128-CTR";
$option = 0;
$encryption_iv = "1234567890123456";
$encryption_key = "1910598";
$encryption = openssl_encrypt($string, $ciphering, $encryption_key, $option, $encryption_iv);

echo "<br>encrypted data: " . $encryption;

$ciphering = "AES-128-CTR";
$option = 0;
$decryption_iv = "1234567890123456";
$decryption_key = "1910598";
$decryption = openssl_decrypt($encryption, $ciphering, $encryption_key, $option, $encryption_iv);

echo "<br>decrypted data: " . $decryption;
?>