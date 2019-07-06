function modifyUrlString(url){
	if (!url.includes("stackstaging")){
		var protocolRegex = /^(http|https):\/\//;
		var wwwRegex = /www\./;
		var dotRegex = /\./;

		url = url.replace(protocolRegex, "")
		url = url.replace(wwwRegex, "")
		
		slashIndex = url.indexOf("/");
		query = url.substring(slashIndex != -1 ? slashIndex : url.length, url.length)

		url = url.substring(0, slashIndex != -1 ? slashIndex : url.length)

		url = url.replace(dotRegex, "-");
		
		url = "http://" + url + ".stackstaging.com" + query;
		return url;
	}
	else {return -1;}
}

function setUrl(event) {
	chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
	function(tab){
		url = tab[0].url
		
		modified_url = modifyUrlString(url)
		if(modified_url!=-1){
		chrome.tabs.update(tab.id, {url: modified_url});
		}
		else {
			if(document.getElementById("main-popup").contains(document.getElementById("warning"))){
				removed = document.getElementById("main-popup").removeChild(document.getElementById("warning"));
			}
			warning = document.createElement("p");
			warning.innerHTML = "Already StackStaging!"
			warning.id = "warning";
			document.getElementById('main-popup').appendChild(warning);
		}
	});
}
document.getElementById('stackstaging').addEventListener('click', setUrl);

