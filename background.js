getDomain = (url) => {
    let domain = url.indexOf("//") > -1 ? url.split('/')[2] : url.split('/')[0];
    domain = domain.split(':')[0];
    domain = domain.split('?')[0];
    domain = domain.replace("www.","");
    return domain;
};
createInfoDevice = () => {
    $.getJSON('http://www.geoplugin.net/json.gp', function(data) {
        var obj = new Object();
        obj.IP = data['geoplugin_request'];
        obj.country =  data["geoplugin_countryName"];
        if (data["geoplugin_continentName"] === "Europe"){
            if (obj.country === "France")
                obj.GHG = 0.035;
            else{
                obj.GHG = 0.276;
            }
        }
        else if (obj.country === "United States")
            obj.GHG = 0.493;
        else if (obj.country === "China")
            obj.GHG = 0.681;
        else 
            obj.GHG = 0.519;
        localStorage.setItem('device', JSON.stringify(obj));
    });
};

const kWhPerByteDataCenter = 7.20e-11;
const kWhPerByteNetwork = 1.52e-10;
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
    const _totalkwh = localStorage.getItem('totalkwh');
    const _totalghg = localStorage.getItem('totalghg');
    var device = JSON.parse(localStorage.getItem('device'));
    if (device === null)
    {
        createInfoDevice();
        device = JSON.parse(localStorage.getItem('device'));
    }
        

    const mbvalueJson = null === mbvalue ? {} : JSON.parse(mbvalue);
    var total = null === _total ? 0 : parseInt(_total);
    var totalkwh = null === _totalkwh ? 0 : parseInt(_totalkwh);
    var totalghg = null === _totalghg ? 0 : parseInt(_totalghg);

    let bytePerDomain = undefined === mbvalueJson[domain] ? 0 : parseInt(mbvalueJson[domain]);
    
    mbvalueJson[domain] = bytePerDomain + requestSize;
    total += requestSize;
    kwh =requestSize * (kWhPerByteDataCenter+kWhPerByteNetwork);
    
    totalkwh += kwh;
    totalghg += kwh * device.GHG;
    localStorage.setItem('mbperdomain', JSON.stringify(mbvalueJson));
    localStorage.setItem('total', JSON.stringify(total));
    localStorage.setItem('totalkwh', JSON.stringify(totalkwh));
    localStorage.setItem('totalghg', JSON.stringify(totalghg));

    chrome.browserAction.setBadgeText({"text":convertB(total)});

    //sent msg to popup
    //var views = chrome.extension.getViews({
    //    type: "popup"
    //});
    //for (var i = 0; i < views.length; i++) {
    //    views[i].document.getElementById('total').innerHTML = convertB(total);
    //}
};


headersReceivedListener = (details) => {
    
    const domain = getDomain(!details.initiator ? details.url : details.initiator);
    const content = details.responseHeaders.find(element => element.name.toLowerCase() === "content-length");
    const type = details.responseHeaders.find(element => element.name.toLowerCase() === "content-type");
    const size = undefined === content ? {value: 0} : content;
    const requestSize = parseInt(size.value, 10);
    if (requestSize != 0.0)
        storeData(domain, requestSize,type);

    //console.log(details);
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

