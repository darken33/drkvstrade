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

if (!isset($_GET['id_name_list'])) {
	http_response_code(400);
	exit;
}

if (!isset($_GET['risky'])) {
	http_response_code(400);
	exit;
}

$id_name_list = "'".join("', '",split(";",$_GET['id_name_list']))."'"; 
$risky = $_GET['risky'];

// on se connecte à la DB
mysql_connect($dbhost,$dbuser,$dbpasswd);
mysql_select_db($dbname);

// On recupère la liste des jeux ouverts
$requete="
SELECT * FROM (

SELECT 
	T1.product, 
	T1.name AS dname, 
	T2.name AS aname, 
	((T2.price - T2.price_v) - (T1.price + T1.price_v)) as gain_min, 
	((T2.price + T2.price_v) - (T1.price - T1.price_v)) gain_max, 
	((((T2.price - T2.price_v) - (T1.price + T1.price_v)) + ((T2.price + T2.price_v) - (T1.price - T1.price_v))) / 2) AS gain_moy, 
	T1.quantity
FROM (
	SELECT *
	FROM `vega_cargo`
	WHERE id_name
	IN (
		$id_name_list 
	)
	AND (quantity > 1.00 OR quantity_v > 1.00) AND (product NOT LIKE 'upgrades%' AND product NOT LIKE 'starships%')
	ORDER BY product ASC
) AS T1, 
(
	SELECT *
	FROM `vega_cargo`
	WHERE id_name
	IN (
		$id_name_list 
	)
	ORDER BY product ASC
) AS T2
WHERE T1.product = T2.product AND T1.id_name <> T2.id_name AND T1.price < T2.price  
ORDER BY T1.product, gain_moy DESC

) AS T3 
WHERE ".($risky == "1" ? "T3.gain_moy > 0" : "T3.gain_min >= 0"). 
" GROUP BY T3.product, T3.dname ORDER by T3.dname, T3.aname, T3.gain_moy DESC, T3.product;
";
//echo $requete."<br/>";
$result=mysql_query($requete);

$list = Array();
while ($row=mysql_fetch_array($result)) {
	array_push($list, Array(
		'product' => $row['product'],
		'dname' => $row['dname'],
		'aname' => $row['aname'],
		'gain_min' => $row['gain_min'],
		'gain_max' => $row['gain_max'],
		'gain_moy' => $row['gain_moy'],
		'quantity' => $row['quantity']
	));
}

/* on renvoie le resultat */
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode($list); 
?>
