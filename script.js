var total=0;
var tabid = 0;
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if(message.action == 'data')
  {
    total+= parseInt(message.data);
    tabid = message.tabid;
    chrome.runtime.sendMessage({ action: 'senddata2bgtochangeicon',value: total, tabid:tabid});
  }else if (message.action == 'getdata')
  {
    chrome.runtime.sendMessage({ action: 'senddata',value: total});
  }
});
