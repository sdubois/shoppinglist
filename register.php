<?php
if (!empty($_GET['data'])) {
	$newData = json_decode($_GET['data'], TRUE);

	$username = $newData["username"];

	$dataFile = json_decode(file_get_contents("dataStore.txt"), TRUE);

	if (empty($dataFile[$username])) {
		$dataFile[$username] = $newData;
		file_put_contents("dataStore.txt", json_encode($dataFile));
		echo json_encode(array("register" => TRUE));
	} else {
		echo json_encode(array("register" => FALSE));
	}
}
?>