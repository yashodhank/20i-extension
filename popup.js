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
			displayIP();
		});
}

function setStackUrl(event) {
	removeMessage("buttons","warning");
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
				addMessage("buttons","warning","Already StackStaging!");
			}
		});
}

function unsetStackUrl(event) {
	removeMessage("buttons","warning");
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
				addMessage("buttons","warning","Not on Stackstaging!");

			}
		});
}

function addMessage(element, childId="message", text) {
	message = document.createElement("p");
	message.innerHTML = text;
	message.id = childId;
	document.getElementById(element).appendChild(message);
}

function removeMessage(element, childId="message") {
	if (document.getElementById(element).contains(document.getElementById(childId))) {
		removed = document.getElementById(element).removeChild(document.getElementById(childId));
	}
}

function getRadioValue(name) {
	return document.querySelector(`input[name=${name}]:checked`).value;
}

//Get IP address from background script
function displayIP(){
	chrome.tabs.query({
		'active': true,
		'windowId': chrome.windows.WINDOW_ID_CURRENT
	},
	function (tabs) {
	chrome.runtime.sendMessage(tabs[0].url, function(response){
		removeMessage("ip-display","ip"); //Remove current IP (if present)
		if(response !== undefined){
		let currentIP = response.domainToIP;
		addMessage("ip-display","ip",currentIP);
		}
		else{
			addMessage("ip-display","ip","Loading...");
			//If IP isn't present (can happen on inital page load), re-run display() after 1s wait
			setTimeout(() => {
				displayIP();	
			}, 1000);
			
		}
	});
});
	
}

displayIP();
document.getElementById('stackstaging-button').addEventListener('click', setStackUrl);
document.getElementById('unstackstaging-button').addEventListener('click', unsetStackUrl);

