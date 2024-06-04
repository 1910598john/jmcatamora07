<?php 

session_start();

echo $_SESSION['test'];
// date_default_timezone_set('Asia/Manila');
// $calc = 0;
//         $out_emp = strtotime('16:00:00');
//         $in_emp = strtotime('17:50:00');
//         $s = new DateTime("@$out_emp");
//         $e = new DateTime("@$in_emp");
//         $interv = $s->diff($e);
//         $calc = $interv->h;
//         $calc += $interv->i / 60;
//         $isExceeds = round($calc * 60);
//         echo $isExceeds;

?>