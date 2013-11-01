<?php
if (!empty($_GET['data'])) {
	$newData = json_decode($_GET['data'], TRUE);

	$username = $newData["username"];

	$dataFile = json_decode(file_get_contents("dataStore.txt"), TRUE);

	if (empty($dataFile[$username])) {
		$dataFile[$username] = $newData;
		file_put_contents("dataStore.txt", json_encode($dataFile));
		echo json_encode($dataFile[$username]);
	} else {
		if ($dataFile[$username]["password"] == $newData["password"]) {
			$serverLists = $dataFile[$username]["lists"];
			foreach ($newData["lists"] as $localListKey => $localList) {
				if (empty($serverLists[$localListKey])) {
					$serverLists[$localListKey] = $localList;
				} else {
					foreach ($localList["items"] as $localItemKey => $localItem) {
						$foundItem = FALSE;
						foreach ($serverLists[$localListKey]["items"] as $serverItemKey => $serverItem) {
							if($localItem == $serverItem) {
								$foundItem = TRUE;
							}
						}
						if(!$foundItem) {
							$serverLists[$localListKey]["items"][] = $localItem;
						}
					}
				}
			}
			$dataFile[$username]["lists"] = $serverLists;
			file_put_contents("dataStore.txt", json_encode($dataFile));
			echo json_encode($dataFile[$username]);
		}
	}
}
?>