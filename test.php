<?php 
date_default_timezone_set('Asia/Manila');

$calc = 0;
$out_emp = strtotime('12:00:00');
$in_emp = strtotime('13:30:00');
$s = new DateTime("@$out_emp");
$e = new DateTime("@$in_emp");
$interv = $s->diff($e);
$calc = $interv->h;
$calc += $interv->i / 60;
$consumed_time = round($calc * 60);


$hr_prday = 8;
$start = new DateTime('10:00:00');
$end = new DateTime('19:00:00');
$interval = $start->diff($end);
$hrs = $interval->h;
$mis = $interval->i;
$total_hrs = $hrs + ($mis / 60);

$free_time = $total_hrs - $hr_prday;



echo $consumed_time - ($free_time * 60);
?>