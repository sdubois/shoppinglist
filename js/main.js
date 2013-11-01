/**
 * @author John Constance
 */
$(document).ready(function() {
	if (!localStorage.jrc452grocery) {
		setAppStorage({});
	} else {
		$("#loginUsername").val(getAppStorage().lastUser);
		var appStorage = getAppStorage();
		appStorage.loggedUser = "";
		setAppStorage(appStorage);
	}
	$("#formLogin .submit").on("click", function(e) {
		e.preventDefault();
		var username = $("#loginUsername").val();
		var appStorage = getAppStorage();
		var password = hash($("#loginPassword").val());
		$.get("login.php", {
			"data" : JSON.stringify({
				"username" : username,
				"password" : password
			})
		}, function(data) {
			var result = JSON.parse(data);
			if (!result.login) {
				appStorage[username] = result;
				appStorage.lastUser = username;
				appStorage.loggedUser = username;
				goToStage({
					stage : 2
				});
			} else {
				alert("I couldn't find that combination of username and password. Please double check that you entered everything correctly.");
			}

			$("#loginPassword").val("");
			setAppStorage(appStorage);
		});
	});
	$("#formLogin .register").on("click", function(e) {
		e.preventDefault();
		goToStage({
			stage : 3
		});
	});
	$("#registerForm .submit").on("click", function(e) {
		e.preventDefault();
		var email = $("#registerEmail").val();
		var username = $("#registerUsername").val();
		var password = hash($("#registerPassword").val());
		var storedUser = {
			"email" : email,
			"password" : password,
			"lists" : {},
			"username" : username
		};
		$.get("register.php", {
			"data" : JSON.stringify(storedUser)
		}, function(data) {
			var result = JSON.parse(data);
			if (result.register == true) {
				var appStorage = getAppStorage();
				appStorage[username] = storedUser;
				appStorage.lastUser = username;
				appStorage.loggedUser = username;
				setAppStorage(appStorage);
				goToStage({
					stage : 2
				});
			} else {
				alert("A user with that name already exists! Please pick a different one.");
			}
		});
	});
	$("#stage-2 .newList").on("click", function(e) {
		e.preventDefault();
		var name = prompt("Name of List?");
		if (name != null) {
			createList(name, "grocery");
			goToStage({
				stage : 6,
				title : name
			});
		}
	});
	$("#stage-2 .viewLists").on("click", function(e) {
		e.preventDefault();
		var appStorage = getAppStorage();
		if (Object.keys(appStorage[appStorage.loggedUser].lists).length > 0) {
			loadLists();
			goToStage({
				stage : 5
			});
		} else {
			alert("You need to create a list first.");
		}
	});
	$("#stage-5 .lists-container").on("click", ".list", function(e) {
		e.stopPropagation();
		loadList($(this).attr('data-name'));
		goToStage({
			stage : 6,
			title : $(this).attr('data-name')
		});
	});
	$("#stage-5 .lists-container").on("click", ".list .delete", function(e) {
		e.stopPropagation();
		var listElem = $(e.target).parent().parent();

		deleteList(listElem.attr("data-name"));
		listElem.remove();
	});
	$("#stage-5 .lists-container").on("click", ".list .share", function(e) {
		e.stopPropagation();

		shareList($(e.target).parent().parent().attr("data-name"));
	});
	$("#stage-5 .lists-container").on("click", ".list .reset", function(e) {
		e.stopPropagation();

		resetList($(e.target).parent().parent().attr("data-name"));
	});
	$("#listsSearch").on("keyup", function(e) {
		var text = $(this).val();
		if (text == "") {
			$("#stage-5 .lists-container .list").show(0);
		} else {
			$("#stage-5 .lists-container .list").each(function(index) {
				if (stringContains(text, $(this).attr("data-name"))) {
					$(this).hide(0);
				} else {
					$(this).show(0);
				}
			});
		}
	});
	$("#listSearch").on("keyup", function(e) {
		var text = $(this).val();
		if (text == "") {
			$("#stage-6 .items-container .item").show(0);
		} else {
			$("#stage-6 .items-container .item").each(function(index) {
				if (stringContains(text, $(this).attr("data-name"))) {
					$(this).hide(0);
				} else {
					$(this).show(0);
				}
			});
		}
	});
	$("#newListItem").on("change", function(e) {
		var appStorage = getAppStorage();
		var list = appStorage[appStorage.loggedUser].lists[$("#stage-6").attr("data-name")];

		var item = {
			name : $(this).val(),
			selected : 0
		};
		list.items.unshift(item);

		var itemElem = $("<div class='item clearfix' data-name='" + item.name + "'></div>");
		itemElem.append("<span>" + item.name + "</span>");
		itemElem.append("<span class='checkbox pull-right'><input type='checkbox' /></span>");

		if (item.selected) {
			itemElem.filter("input[type=checkbox]").prop("checked", true);
		}

		$("#stage-6 .items-container").append(itemElem);

		$(this).val("");

		setAppStorage(appStorage);
	});
	$(".items-container").on("click", ".item input[type=checkbox]", function(e) {
		var appStorage = getAppStorage();
		var list = appStorage[appStorage.loggedUser].lists[$("#stage-6").attr("data-name")];

		for (var i = list.items.length - 1; i >= 0; i--) {
			var item = list.items[i];

			if (item.name == $(this).parent().parent().attr("data-name")) {
				item.selected ^=1;
			}
		};
		setAppStorage(appStorage);
	});
	$("#homeButton").on("click", function(e) {
		if (getAppStorage().loggedUser != "") {
			goToStage({
				stage : 2
			});
		} else {
			goToStage({
				stage : 1
			});
		}
	});
	$("#stage-6 .list-buttons .share").on("click", function(e) {
		shareList($("#stage-6").attr("data-name"));
	});
	$("#stage-6 .list-buttons .reset").on("click", function(e) {
		resetList($("#stage-6").attr("data-name"));
		loadList($("#stage-6").attr("data-name"));
	});
	$("#stage-6 .list-buttons .sync").on("click", function(e) {
		syncList($("#stage-6").attr("data-name"));
	});
});

function goToStage(opts) {
	var stage = ".stage[data-stage=" + opts.stage + "]";
	if (!$(stage).is(":visible")) {
		if (opts.title) {
			var title = opts.title;
		} else {
			var title = $(stage).attr('data-title');
		}
		$(".stage:visible").slideUp("slow");
		$(stage).slideDown("slow");
		$("#pageTitle h3").text(title);
	}
}

function createList(name, type) {
	var appStorage = getAppStorage();
	var list = {};
	list.name = name;
	list.type = type;
	list.items = [];
	appStorage[appStorage.loggedUser].lists[name] = list;
	setAppStorage(appStorage);
	loadList(name);
}

function loadList(name) {
	var appStorage = getAppStorage();
	var list = appStorage[appStorage.loggedUser].lists[name];
	var items = list.items;
	$("#stage-6 .items-container").empty();
	for (var i = items.length - 1; i >= 0; i--) {
		var item = items[i];

		var itemElem = $("<div class='item clearfix' data-name='" + item.name + "'></div>");
		itemElem.append("<span>" + item.name + "</span>");
		itemElem.append("<span class='checkbox pull-right'><input type='checkbox' /></span>");

		if (item.selected) {
			itemElem.children(".checkbox").children().prop("checked", true);
		}

		$("#stage-6 .items-container").append(itemElem);
	}
	$("#stage-6").attr("data-name", list.name);
}

function loadLists() {
	var appStorage = getAppStorage();
	var lists = appStorage[appStorage.loggedUser].lists;
	$("#stage-5 .lists-container").empty();
	for (key in lists) {
		if (!lists.hasOwnProperty(key)) {
			continue;
		}
		var list = lists[key];

		var listElem = $("<div class='list clearfix' data-name='" + list.name + "'></div>");
		listElem.append("<span>" + list.name + "</span>");
		listElem.append("<span class='reset pull-right'><img src='img/reset.png' alt='Reset'/></span>");
		listElem.append("<span class='share pull-right'><img src='img/mail.png' alt='Share'/></span>");
		listElem.append("<span class='delete pull-right'><img src='img/delete.png' alt='Delete'/></span>");

		$("#stage-5 .lists-container").append(listElem);
	}
}

function resetList(name) {
	var appStorage = getAppStorage();
	var items = appStorage[appStorage.loggedUser].lists[name].items;
	for (var i = items.length - 1; i >= 0; i--) {
		items[i].selected = 0;
	}
	setAppStorage(appStorage);
}

function shareList(name) {
	var appStorage = getAppStorage();
	var list = appStorage[appStorage.loggedUser].lists[name];
	var items = list.items;
	var message = "List Name: " + list.name + "%0D%0D\n\n";
	for (var i = items.length - 1; i >= 0; i--) {
		var item = items[i];
		message += item.name + "%0D\n";
	}
	var email = prompt("Email address of the recipient?", appStorage[appStorage.loggedUser].email);
	if (email != null) {
		window.open("mailto:" + email + "?body=" + message);
	}
}

function syncList(name) {
	syncUser();
	loadList(name);
}

function syncUser() {
	var appStorage = getAppStorage();
	var user = appStorage[appStorage.loggedUser];
	user.username = appStorage.loggedUser;
	$.get("sync.php", {
		data : JSON.stringify(user)
	}, function(syncedUser) {
		appStorage[appStorage.loggedUser] = JSON.parse(syncedUser);
		setAppStorage(appStorage);
	});

}

function deleteList(name) {
	var appStorage = getAppStorage();
	var lists = appStorage[appStorage.loggedUser].lists;
	delete lists[name];
	setAppStorage(appStorage);
}

function hash(string) {
	var salt = "p9ePLnNS";
	return CryptoJS.SHA1(string + salt);
}

function getAppStorage() {
	return JSON.parse(localStorage.getItem("jrc452grocery"));
}

function setAppStorage(appStorage) {
	localStorage.setItem("jrc452grocery", JSON.stringify(appStorage));
}

function compareArray(arr1, arr2) {
	return $(arr1).not(arr2).length == 0 && $(arr2).not(arr1).length == 0;
}

function stringContains(needle, haystack) {
	return haystack.toString().toUpperCase().indexOf(needle.toString().toUpperCase()) == -1;
}
