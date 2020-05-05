//chrome.runtime.sendMessage({ action: 'start' });
//import consumption from './consumption';
var chart = null;
var bg = chrome.extension.getBackgroundPage();
document.getElementById('html').style.backgroundColor = bg.levelColors[bg.lev];
// init var consumption
var consum = null ;
document.addEventListener('DOMContentLoaded',function(){
    // init var consumption
    consum = new consumption() ;
    document.getElementById('ip').innerHTML = consum.getIP;
    document.getElementById('ctr').innerHTML = consum.getCountry;
    document.getElementById('ghg').innerHTML = consum.getGHG;
    // draw chart
    var list = getTopDomain();
    var data =[];
    var labels = [];
    for (var a in list){
        data.push(list[a].val);
        labels.push(list[a].key);
    }
    var doughnutCenterText ={
        beforeDraw: function(chart) {
          var width = chart.chart.width,
              height = chart.chart.width + 80,
              ctx = chart.chart.ctx;
      
          ctx.restore();
          
          var fontSize = (width / 220).toFixed(2);
          ctx.textAlign = "center";
          ctx.font = fontSize + "em sans-serif";
          ctx.textBaseline = "middle";
          
          var text = consum.getkwhString,
              textY = height / 2 - 80;

          ctx.fillStyle = window.chartColors.blue;
          
          ctx.fillText(text,width/2,textY-10);

          //
          var text1 = consum.getBytesString,
            
            textY1 = height / 2 - 80;
          
          fontSize = (width / 150).toFixed(2);
          ctx.font = fontSize + "em sans-serif";

          ctx.fillStyle = window.chartColors.red;
          ctx.fillText(text1, width/2, textY1+15);

          //
          var text2 = consum.getGHGString,
          textY2 = height / 2 - 80;
          
          fontSize = (width / 220).toFixed(2);
          ctx.font = fontSize + "em sans-serif";
          ctx.fillStyle = window.chartColors.green;
          ctx.fillText(text2,width/2,textY2+40);
          ctx.save();
        }
      };
    var ctx = document.getElementById('myChart').getContext('2d');
    
    var chartcicle = new Chart(ctx, {
        // The type of chart we want to create
        type: 'doughnut',
        
        // The data for our dataset
        data: {
            labels: labels,
            datasets: [{
                label: 'Consumption chart',
                backgroundColor: [
                    window.chartColors.red,
                    window.chartColors.blue,
                    window.chartColors.yellow,
                    window.chartColors.green,
                    window.chartColors.orange,
                    window.chartColors.purple
                  ],
                borderColor: 'rgb(255, 255, 255)',
                data: data
            }]
        },
        plugins: [doughnutCenterText],
        // Configuration options go here
        options: {
            //rotation: 1 * Math.PI,
            //circumference: 1 * Math.PI,
            responsive: true,
				legend: {
					position: 'bottom',
				},
            tooltips: {
                callbacks: {
                  title: function(tooltipItem, data) {
                    return data['labels'][tooltipItem[0]['index']];
                  },
                  label: function(tooltipItem, data) {
                    return convertB(data['datasets'][0]['data'][tooltipItem['index']]);
                  },
                  afterLabel: function(tooltipItem, data) {
                    var dataset = data['datasets'][0];
                    var percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]['total']) * 100)
                    return '(' + percent + '%)';
                  }
                }
            }
        }
    });

    
    //document.getElementById('total').innerHTML = convertB(parseInt(localStorage.getItem('total')));
    //load metaphores
    document.getElementById('battery').innerHTML = consum.getbatteryString;
    document.getElementById('money').innerHTML = consum.getmoneyString;
    document.getElementById('cake').innerHTML = consum.getcakeString;
    
    [document.getElementById('plane').innerHTML,document.getElementById('planedv').innerHTML] = consum.getplanekmString;
    [document.getElementById('car').innerHTML,document.getElementById('cardv').innerHTML] = consum.getcarkmString;
    [document.getElementById('cycling').innerHTML,document.getElementById('cyclingdv').innerHTML] = consum.getcyclingkmString;
    [document.getElementById('walking').innerHTML,document.getElementById('walkingdv').innerHTML] = consum.getwalkingkmString;
    [document.getElementById('light').innerHTML,document.getElementById('lightdv').innerHTML] = consum.getlightString;

    //tab3
    const [lable_day,data_day] = getbyhour();
    var tk = document.getElementById('tk').getContext('2d');
    
    chart = new Chart(tk, {
        // The type of chart we want to create
        type: 'line',
        
        // The data for our dataset
        data: {
            labels: lable_day,
            datasets: [{
                label: "Capacity utilization(GB)",
                data: data_day,
                fill: true,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)'
            }]
        }
    });
    //tab 4
    var status = localStorage.getItem('status');
    if (status == 1)
    {
        localStorage.setItem('status',JSON.stringify(1))
        btstatus.style.backgroundColor = "green";
        btstatus.innerHTML = "on";
        //chrome.browserAction.setBadgeText({"text":consum.getBytesString});
    }
    else{
        localStorage.setItem('status',JSON.stringify(0))
        btstatus.style.backgroundColor = "gray";
        btstatus.innerHTML = "off";
        //chrome.browserAction.setBadgeText({"text":"off"});
    }
})

updateInfoDevice = () => {
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

//update device
updateInfoDevice();

// enable tab navigation with jQuery
$(document).ready(function(){
    $('.tabs').tabs();
});

document.addEventListener('DOMContentLoaded', function() {
    var btstatus  = document.getElementById('btstatus');
    var status = localStorage.getItem('status');
    btstatus.addEventListener('click', function() {
        if (status == 0)
        {
            status = 1;
            localStorage.setItem('status',JSON.stringify(1))
            btstatus.style.backgroundColor = "green";
            btstatus.innerHTML = "on";
            chrome.browserAction.setBadgeText({"text":""});//consum.getBytesString});
            chrome.browserAction.setIcon({path: '../icon/lv0.png'})
        }
        else{
            localStorage.setItem('status',JSON.stringify(0))
            btstatus.style.backgroundColor = "gray";
            btstatus.innerHTML = "off";
            //chrome.browserAction.setBadgeText({"text":"off"});
            chrome.browserAction.setIcon({path: '../icon/off.png'})
        }
    });
    var link = document.getElementById('refresh');
    // onClick's logic below:
    link.addEventListener('click', function() {
        localStorage.clear();
        bg.device = {"IP":"unknown","country":"unknown","GHG":0};
        bg.mbvalueJson = {} ;
        bg.total = 0;
        bg.totalkwh =0;
        bg.totalghg = 0;
        bg.mbvaluedayJson = {};
        bg.mbvaluemonthJson = {};
        bg.mbvalueyearJson = {};
        //chrome.browserAction.setBadgeText({"text":""});
        chrome.browserAction.setTitle({
            title:""
        });
        location.reload();
    });
    var btday = document.getElementById("btday");
    var btmonth = document.getElementById("btmonth");
    var btyear = document.getElementById("btyear");
    var btyears = document.getElementById("btyears");
    btday.addEventListener('click', function() {
        if( btday.className != "btn-small"){
            btday.className = "btn-small";
            btmonth.className = "btn-flat";
            btyear.className = "btn-flat";
            btyears.className = "btn-flat";
            const [lable_day,data_day] = getbyhour();
            var tk = document.getElementById('tk').getContext('2d');
            chart.destroy();
            chart = new Chart(tk, {
                // The type of chart we want to create
                type: 'line',
                
                // The data for our dataset
                data: {
                    labels: lable_day,
                    datasets: [{
                        label: "Capacity utilization(GB)",
                        data: data_day,
                        fill: true,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)'
                    }]
                }
            });
        }
    });
    btmonth.addEventListener('click', function() {
        if( btmonth.className != "btn-small"){
            btday.className = "btn-flat";
            btmonth.className = "btn-small";
            btyear.className = "btn-flat";
            btyears.className = "btn-flat";
            const [lable_day,data_day] = getbyday();
            var tk = document.getElementById('tk').getContext('2d');
            chart.destroy();
            chart = new Chart(tk, {
                // The type of chart we want to create
                type: 'line',
                
                // The data for our dataset
                data: {
                    labels: lable_day,
                    datasets: [{
                        label: "Capacity utilization(GB)",
                        data: data_day,
                        fill: true,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)'
                    }]
                }
            });
        }
    });
    btyear.addEventListener('click', function() {
        if( btyear.className != "btn-small"){
            btday.className = "btn-flat";
            btmonth.className = "btn-flat";
            btyear.className = "btn-small";
            btyears.className = "btn-flat";
            const [lable_day,data_day] = getbymonth();
            var tk = document.getElementById('tk').getContext('2d');
            chart.destroy();
            chart = new Chart(tk, {
                // The type of chart we want to create
                type: 'line',
                
                // The data for our dataset
                data: {
                    labels: lable_day,
                    datasets: [{
                        label: "Capacity utilization(GB)",
                        data: data_day,
                        fill: true,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)'
                    }]
                }
            });
        }
    });
    btyears.addEventListener('click', function() {
        
        if( btyears.className != "btn-small"){
            btday.className = "btn-flat";
            btmonth.className = "btn-flat";
            btyear.className = "btn-flat";
            btyears.className = "btn-small";
            const [lable_day,data_day] = getbyyear();
            var tk = document.getElementById('tk').getContext('2d');
            chart.destroy();
            chart = new Chart(tk, {
                // The type of chart we want to create
                type: 'line',
                
                // The data for our dataset
                data: {
                    labels: lable_day,
                    datasets: [{
                        label: "Capacity utilization(GB)",
                        data: data_day,
                        fill: true,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)'
                    }]
                }
            });
        }
    });
});
var domain_ = "";
var icon_ = "";
var title_ = "";
var levelColors = {
	0: 'rgb(75, 192, 192)',//green
    1: 'rgb(255, 205, 86)',//yellow
    2: 'rgb(255, 159, 64)',//orange
    3: 'rgb(255, 99, 132)'//red
};
var levelstrings = {
	0: 'light',
    1: 'medium',
    2: 'heavy',
    3: 'very heavy'
};
convertBv2 = (bytes) => {
    if (bytes*1e-6 < 0.1)
        return bytes.toString() + " bytes"
    else if (bytes*1e-6 < 1000)
        return (bytes*1e-6).toFixed(2).toString() + " MB"
    else
        return (bytes*1e-9).toFixed(2).toString() + " GB"
}
convertghgv2 = (value) => {
    if(value < 0.00001)
        return (value*1000*1000).toFixed(0).toString()+" mgCO2e";
    if(value < 0.1)
        return (value*1000).toFixed(2).toString()+" gCO2e";
    return value.toFixed(2).toString()+" kgCO2e";
}
convertkwhv2 = (value) =>{
    const temp = value*1e6
    if(temp < 1e5)
        return (value*1e6).toFixed(0).toString()+" Wh";
    return value.toFixed(2).toString()+" kWh";
}
const kWhPerByteDataCenter = 7.20e-11;
const kWhPerByteNetwork = 1.52e-10;
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if(message.action == 'senddata')
    {
      //console.log('Got message',message.value);
      const mb = message.value;
      const kwh =mb * (kWhPerByteDataCenter+kWhPerByteNetwork);
      const ghg = kwh*bg.device.GHG;
      const temp = message.value*1e-6;
      var lev = 0;
      if (temp<2){//2mb
            lev = 0;
        }else if (temp<10){
            lev = 1;
        }else if (temp<20){
            lev = 2;
        }else{
            lev = 3;
        }
      document.getElementById('tabpage').style.visibility = "visible";
      //document.getElementById('currentpage').innerHTML = "<span class=\"badge\"style=\"color: white;font-size: 13px;\">"+convertBv2(message.value)+"(Lv:"+lev+")"+"</span>"+domain_;
      //document.getElementById('currentpage').style.backgroundColor = bg.levelColors[lev];
      const _img = "<img src=\""+icon_+"\" style=\"vertical-align: middle;height: 35px;\"> ";
      document.getElementById('currentpage_m').innerHTML =_img + domain_ + "<i id=\"closatb_m\" class=\"material-icons right\">close</i>";
      document.getElementById('title_m').innerHTML =title_;
      document.getElementById('stamp_m').src ="../icon/lv"+lev.toString()+".png";
      document.getElementById('mb_m').innerHTML =convertBv2(mb);
      document.getElementById('co2_m').innerHTML =convertghgv2(ghg);
      document.getElementById('kw_m').innerHTML =convertkwhv2(kwh);
      document.getElementById('label_').innerHTML =levelstrings[lev];
      document.getElementById('label_').style.backgroundColor = bg.levelColors[lev];
      document.getElementById('gotoplugin').addEventListener('click', function() {
        document.getElementById('tabpage').style.visibility = "hidden";
        
      });
      document.getElementById('closatb_m').addEventListener('click', function() {
        document.getElementById('tabpage').style.visibility = "hidden";
        
      });
    }
  });

getDomain = (url) => {
    let domain = url.indexOf("//") > -1 ? url.split('/')[2] : url.split('/')[0];
    domain = domain.split(':')[0];
    domain = domain.split('?')[0];
    domain = domain.replace("www.","");
    return domain;
};
chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    domain_ = getDomain(tabs[0].url);
    icon_ = tabs[0].favIconUrl;
    title_ = tabs[0].title;
    //console.log(tabs[0]);
    chrome.tabs.sendMessage(tabs[0].id, {action: "getdata"}, function(response) {});
    
});
