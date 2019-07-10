var currentIPList = {};

// Save all IP addresses by URLs in a temporary object
chrome.webRequest.onCompleted.addListener(
    function (info) {
        url = info.url;
        ip = info.ip;
        id = info.tabId;
        currentIPList[url] = {
            ip,
            id
        }
        return;
    }, {
        urls: [],
        types: []
    },
    []
);
//Garbage collection - remove objects for closed tabs
chrome.tabs.onRemoved.addListener(
    function (tabId, removeInfo) {
        console.table(currentIPList)
        for (object in currentIPList){
            if(currentIPList[object].id == tabId){
                console.log("Deleted!")
                delete currentIPList[object]
            }
        }
        console.table(currentIPList)
        
    }
);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        var currentURL = request;
        if (currentIPList[currentURL].ip !== undefined) {
            sendResponse({
                domainToIP: currentIPList[currentURL].ip //Send back current IP based on provided URL
            });
        } else {
            //IP not found in array (maybe an iframe has been loaded).
            sendResponse({
                domainToIP: null
            });
        }
        // Note: Returning true is required here!
        //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
        return true;
    });