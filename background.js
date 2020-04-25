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
var pushnoti = 10;// 10gb -> 20gb -> ...
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

var device = null;
var mbvalueJson = null ;
var total = 0;
var totalkwh =0;
var totalghg = 0;
var mbvaluedayJson = null;
var mbvaluemonthJson = null;
var mbvalueyearJson = null;
setStorage = ()=>{
    localStorage.setItem('mbperdomain', JSON.stringify(mbvalueJson));
    localStorage.setItem('total', JSON.stringify(total));
    localStorage.setItem('totalkwh', JSON.stringify(totalkwh));
    localStorage.setItem('totalghg', JSON.stringify(totalghg));

    localStorage.setItem('mbperhour', JSON.stringify(mbvaluehourJson));
    localStorage.setItem('mbperday', JSON.stringify(mbvaluedayJson));
    localStorage.setItem('mbpermonth', JSON.stringify(mbvaluemonthJson));
    localStorage.setItem('mbperyear', JSON.stringify(mbvalueyearJson));
}
getStorage = ()=>{
    const mbvalue = localStorage.getItem('mbperdomain');
    const _total = localStorage.getItem('total');
    const _totalkwh = localStorage.getItem('totalkwh');
    const _totalghg = localStorage.getItem('totalghg');
    device = JSON.parse(localStorage.getItem('device'));
    mbvalueJson = null === mbvalue ? {} : JSON.parse(mbvalue);
    total = null === _total ? 0 : parseInt(_total);
    totalkwh = null === _totalkwh ? 0 : parseFloat(_totalkwh);
    totalghg = null === _totalghg ? 0 : parseFloat(_totalghg);

    if (device === null)
    {
        createInfoDevice();
        device = JSON.parse(localStorage.getItem('device'));
    }

    const mbperhour = localStorage.getItem('mbperhour');
    const mbperday = localStorage.getItem('mbperday');
    const mbpermonth = localStorage.getItem('mbpermonth');
    const mbperyear = localStorage.getItem('mbperyear');

    mbvaluehourJson = null === mbperhour ? {} : JSON.parse(mbperhour);
    mbvaluedayJson = null === mbperday ? {} : JSON.parse(mbperday);
    mbvaluemonthJson = null === mbpermonth ? {} : JSON.parse(mbpermonth);
    mbvalueyearJson = null === mbperyear ? {} : JSON.parse(mbperyear);
}
getStorage();
var time = 1;
storeData = (domain, requestSize,types) => {

    if (device === null)
    {
        createInfoDevice();
        device = JSON.parse(localStorage.getItem('device'));
    }

    let bytePerDomain = undefined === mbvalueJson[domain] ? 0 : parseInt(mbvalueJson[domain]);
    
    mbvalueJson[domain] = bytePerDomain + requestSize;
    total += requestSize;
    kwh =requestSize * (kWhPerByteDataCenter+kWhPerByteNetwork);
    
    totalkwh += kwh;
    totalghg += kwh * device.GHG;
    
    chrome.browserAction.setBadgeText({"text":convertB(total)});
    chrome.browserAction.setTitle({
        title:convertB(total)
    });

    if (total*1e-9 > pushnoti){
        chrome.notifications.create('', {
            title: 'You spent '+pushnoti+' GB',
            message: 'Reduce web surfing to save the earth',
            iconUrl: 'icon/icon128.png',
            type: 'basic'
          });
        pushnoti= parseInt((total*1e-9)/10)*10+10;
    }

    //sent msg to popup
    //var views = chrome.extension.getViews({
    //    type: "popup"
    //});
    //for (var i = 0; i < views.length; i++) {
    //    views[i].document.getElementById('total').innerHTML = convertB(total);
    //}

    //save data folow by day month year
    const date = new Date(); 
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth()+1;
    const year = date.getFullYear();

    let bytePerhour = undefined === mbvaluehourJson[hour] ? 0 : parseInt(mbvaluehourJson[hour][1]);
    if (undefined === mbvaluehourJson[hour])
        mbvaluehourJson[hour] = [];
    mbvaluehourJson[hour][0] = hour.toString();
    mbvaluehourJson[hour][1] = bytePerhour + requestSize;

    let bytePerday = undefined === mbvaluedayJson[day] ? 0 : parseInt(mbvaluedayJson[day][1]);
    if (undefined === mbvaluedayJson[day])
        mbvaluedayJson[day] = [];
    mbvaluedayJson[day][0] = day.toString()+'/'+month.toString()+'/'+year.toString();
    mbvaluedayJson[day][1] = bytePerday + requestSize;
    
    let bytePermonth = undefined === mbvaluemonthJson[month] ? 0 : parseInt(mbvaluemonthJson[month][1]);
    if (undefined === mbvaluemonthJson[month])
        mbvaluemonthJson[month] = [];
    mbvaluemonthJson[month][0] = month.toString()+'/'+year.toString();
    mbvaluemonthJson[month][1] = bytePermonth + requestSize;
    
    let bytePeryear = undefined === mbvalueyearJson[year] ? 0 : parseInt(mbvalueyearJson[year]);
    mbvalueyearJson[year] = bytePeryear + requestSize;

    //10 times -> save to localStoage
    if(time % 100 == 0){
        setStorage();
        time = 1;
    }else 
        time++;
};


headersReceivedListener = (details) => {
    
    const domain = getDomain(!details.initiator ? details.url : details.initiator);
    const content = details.responseHeaders.find(element => element.name.toLowerCase() === "content-length");
    const type = details.responseHeaders.find(element => element.name.toLowerCase() === "content-type");
    const size = undefined === content ? {value: 0} : content;
    const requestSize = parseInt(size.value, 10);
    if (requestSize != 0.0){
        storeData(domain, requestSize,type);
        //console.log( convertB(requestSize),details);
    }
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

