<?php
declare(strict_types=1);

function loadEnvFile(string $path): array {
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $env = [];
    if (!is_file($path)) {
        $cache = $env;
        return $cache;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!is_array($lines)) {
        $cache = $env;
        return $cache;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $pos = strpos($line, '=');
        if ($pos === false) {
            continue;
        }
        $key = trim(substr($line, 0, $pos));
        $value = trim(substr($line, $pos + 1));
        $value = trim($value, "\"'");
        if ($key !== '') {
            $env[$key] = $value;
        }
    }

    $cache = $env;
    return $cache;
}
