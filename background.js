getDomain = (url) => {
    let domain = url.indexOf("//") > -1 ? url.split('/')[2] : url.split('/')[0];
    domain = domain.split(':')[0];
    domain = domain.split('?')[0];
    domain = domain.replace("www.","");
    return domain;
};

convertB = (bytes) => {
    if (bytes*1e-6 < 1)
        return bytes.toString() + " bytes"
    else if (bytes*1e-6 < 1000)
        return (bytes*1e-6).toFixed(2).toString() + " MB"
    else
        return (bytes*1e-9).toFixed(2).toString() + " GB"
}
storeData = (domain, requestSize,types) => {
    var today = new Date();
    const mbvalue = localStorage.getItem('mbperdomain');
    const _total = localStorage.getItem('total');

    const mbvalueJson = null === mbvalue ? {} : JSON.parse(mbvalue);
    var total = null === _total ? 0 : parseInt(_total);

    let bytePerDomain = undefined === mbvalueJson[domain] ? 0 : parseInt(mbvalueJson[domain]);
    
    mbvalueJson[domain] = bytePerDomain + requestSize;
    total += requestSize;

    localStorage.setItem('mbperdomain', JSON.stringify(mbvalueJson));
    //console.log("Total: ",convertB(total));
    
    localStorage.setItem('total', JSON.stringify(total));

    chrome.browserAction.setBadgeText({"text":convertB(total)});

    //sent msg to popup
    var views = chrome.extension.getViews({
        type: "popup"
    });
    for (var i = 0; i < views.length; i++) {
        views[i].document.getElementById('total').innerHTML = convertB(total);
    }
};


headersReceivedListener = (details) => {
    
    const domain = getDomain(!details.initiator ? details.url : details.initiator);
    const content = details.responseHeaders.find(element => element.name.toLowerCase() === "content-length");
    const type = details.responseHeaders.find(element => element.name.toLowerCase() === "content-type");
    const size = undefined === content ? {value: 0} : content;
    const requestSize = parseInt(size.value, 10);
    
    storeData(domain, requestSize,type);

    console.log(details);
    return {};
};

handleMessage = (request, sender, sendResponse) => {
    chrome.webRequest.onHeadersReceived.addListener(
        headersReceivedListener,
        {urls: ["<all_urls>"]},
        ["blocking", "responseHeaders"]
    );
};

//localStorage.removeItem('mbvalue')
//localStorage.removeItem('total')

chrome.runtime.onMessage.addListener(handleMessage);
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

