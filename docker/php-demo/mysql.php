<?php

$con = mysql_connect("mysql", "admin", "admin");
if (!$con) {
  echo ('Could not connect mysql: ' . mysql_error());
} else {
  echo 'Mysql connected!';
}
