<?php
if (!empty($_GET['data'])) {
	$newData = json_decode($_GET['data'], TRUE);

	$username = $newData["username"];

	$dataFile = json_decode(file_get_contents("dataStore.txt"), TRUE);

	if (empty($dataFile[$username])) {
		echo json_encode(array("login" => FALSE));
	} else {
		if ($dataFile[$username]["password"] == $newData["password"]) {
			echo json_encode($dataFile[$username]);
		} else {
			echo json_encode(array("login" => FALSE));
		}
	}
}
?>