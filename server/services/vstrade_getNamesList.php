<?php
/**
 * Simple Webservice REST en PHP / JSON
 * Renvoi la liste des Installation, Planets et Vessel disponibles
 */
 include("http_response_code.php");
 include("config.inc.php");

// Si la clé n'est pas fournie => 403
if (!isset($_GET['key']) || $id_key != $_GET['key']) {
	http_response_code(403);
	exit;
}

// on se connecte à la DB
mysql_connect($dbhost,$dbuser,$dbpasswd);
mysql_select_db($dbname);

// On recupère la liste des jeux ouverts
$requete="SELECT DISTINCT `id_name`, `name`, `type` FROM `vega_cargo` ORDER BY `type`, `name`";
$result=mysql_query($requete);

$list = Array();
while ($row=mysql_fetch_array($result)) {
	array_push($list, Array(
		'id_name' => $row['id_name'],
		'name' => $row['name'],
		'type' => $row['type']
	));
}

/* on renvoie le resultat */
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode($list); 
?>
