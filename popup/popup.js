//import consumption from './consumption';
var chart = null;

document.addEventListener('DOMContentLoaded',function(){
    

    //get information of device user
    var device = JSON.parse(localStorage.getItem('device'));
    if (device === null)
    {
        createInfoDevice();
        device = JSON.parse(localStorage.getItem('device'));
    }
    document.getElementById('ip').innerHTML = device.IP;
    document.getElementById('ctr').innerHTML = device.country;
    // init var consumption
    var consum = new consumption() ;

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
          ctx.fillText(text1, width/2, textY1+20);

          //
          var text2 = consum.getGHGString,
          textY2 = height / 2 - 80;
          
          fontSize = (width / 220).toFixed(2);
          ctx.font = fontSize + "em sans-serif";
          ctx.fillStyle = window.chartColors.green;
          ctx.fillText(text2,width/2,textY2+50);
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
    var link = document.getElementById('refresh');
    // onClick's logic below:
    link.addEventListener('click', function() {
        localStorage.clear();
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