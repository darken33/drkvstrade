<?php
// Serving the manifest file 'manifest.webapp' with the appropriate header
header('Content-type: application/x-web-app-manifest+json');
readfile('manifest.webapp');
?>