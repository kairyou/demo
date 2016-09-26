<?php

require dirname(__FILE__).'/vendor/autoload.php';
// require 'predis/autoload.php';
// Predis\Autoloader::register();
$redis = new Predis\Client([
    'scheme' => 'tcp',
    'host'   => 'redis',
    'port'   => 6379,
]);
try {
    echo $redis->ping('Successfully connected to Redis.<br>');
} catch (Exception $e) {
    echo "Couldn't connected to Redis.<br>";
    echo $e->getMessage();
}
