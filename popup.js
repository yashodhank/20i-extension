function modifyUrlStringToStack(url) {
	if (!url.includes("stackstaging")) {
		var protocolRegex = /^(http|https):\/\//;
		var wwwRegex = /www\./;
		var dotRegex = /\./g;

		url = url.replace(protocolRegex, "");
		url = url.replace(wwwRegex, "");

		slashIndex = url.indexOf("/");
		query = url.substring(slashIndex != -1 ? slashIndex : url.length, url.length);

		url = url.substring(0, slashIndex != -1 ? slashIndex : url.length);

		url = url.replace(dotRegex, "-");

		url = "http://" + url + ".stackstaging.com" + query;
		return url;
	} else {
		return -1;
	}
}

function modifyUrlStringFromStack(url, https) {
	if (url.includes("stackstaging")) {
		var protocolRegex = /^(http|https):\/\//;
		var dashRegex = /\-/g;

		url = url.replace(protocolRegex, "");

		slashIndex = url.indexOf("/");
		query = url.substring(slashIndex != -1 ? slashIndex : url.length, url.length);

		dotIndex = url.indexOf(".");
		url = url.substring(0, dotIndex != -1 ? dotIndex : url.length);

		url = url.replace(dashRegex, ".");

		https ? url = "https://" + url + query : url = "http://" + url + query;
		return url;
	} else {
		return -1;
	}
}

function setUrl(url) {
	chrome.tabs.query({
			'active': true,
			'windowId': chrome.windows.WINDOW_ID_CURRENT
		},
		function (tab) {
			chrome.tabs.update(tab.id, {
				url: modified_url
			});
		});
}

function setStackUrl(event) {
	removeMessage();
	chrome.tabs.query({
			'active': true,
			'windowId': chrome.windows.WINDOW_ID_CURRENT
		},
		function (tab) {
			url = tab[0].url;
			modified_url = modifyUrlStringToStack(url);
			if (modified_url != -1) {
				setUrl(modified_url)
			} else {
				addMessage("Already StackStaging!");
			}
		});
}

function unsetStackUrl(event) {
	removeMessage();
	var https;
	getRadioValue("protocol") == "HTTPS" ? https = true : https = false;
	chrome.tabs.query({
			'active': true,
			'windowId': chrome.windows.WINDOW_ID_CURRENT
		},
		function (tab) {
			url = tab[0].url;
			modified_url = modifyUrlStringFromStack(url, https);
			if (modified_url != -1) {
				setUrl(modified_url)
			} else {
				addMessage("Not on Stackstaging!");

			}
		});
}

function addMessage(text) {
	message = document.createElement("p");
	message.innerHTML = text;
	message.id = "message";
	document.getElementById('main-popup').appendChild(message);
}

function removeMessage() {
	if (document.getElementById("main-popup").contains(document.getElementById("message"))) {
		removed = document.getElementById("main-popup").removeChild(document.getElementById("message"));
	}
}

function getRadioValue(name) {
	return document.querySelector(`input[name=${name}]:checked`).value;
}
document.getElementById('stackstaging-button').addEventListener('click', setStackUrl);
document.getElementById('unstackstaging-button').addEventListener('click', unsetStackUrl);