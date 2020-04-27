var total=0;
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if(message.action == 'data')
  {
    total+= parseInt(message.data);
    //console.log('Got message',total);
  }else if (message.action == 'getdata')
  {
    //console.log(total);
    chrome.runtime.sendMessage({ action: 'senddata',value: total});
  }
});
