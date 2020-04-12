//import consumption from './consumption';

document.addEventListener('DOMContentLoaded',function(){
    //get information of device user
    var device = JSON.parse(localStorage.getItem('device'));
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
    var ctx = document.getElementById('myChart').getContext('2d');
    
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'doughnut',
        
        // The data for our dataset
        data: {
            labels: labels,
            datasets: [{
                label: 'Consumption chart',
                backgroundColor: [
                    window.chartColors.red,
                    window.chartColors.orange,
                    window.chartColors.yellow,
                    window.chartColors.green,
                    window.chartColors.blue,
                    window.chartColors.purple
                  ],
                borderColor: 'rgb(255, 255, 255)',
                data: data
            }]
        },

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

    Chart.pluginService.register({
        beforeDraw: function(chart) {
          var width = chart.chart.width,
              height = chart.chart.height,
              ctx = chart.chart.ctx;
      
          ctx.restore();
          
          var fontSize = (height / 220).toFixed(2);
          ctx.textAlign = "center";
          ctx.font = fontSize + "em sans-serif";
          ctx.textBaseline = "middle";
          
          var text = consum.getkwhString,
              textY = height / 2 - 70;

          ctx.fillStyle = window.chartColors.blue;
          
          ctx.fillText(text,width/2,textY-10);

          //
          var text1 = consum.getBytesString,
            
            textY1 = height / 2 - 70;
          
          fontSize = (height / 150).toFixed(2);
          ctx.font = fontSize + "em sans-serif";

          ctx.fillStyle = window.chartColors.red;
          ctx.fillText(text1, width/2, textY1+20);

          //
          var text2 = consum.getGHGString,
          textY2 = height / 2 - 70;
          
          fontSize = (height / 220).toFixed(2);
          ctx.font = fontSize + "em sans-serif";
          ctx.fillStyle = window.chartColors.green;
          ctx.fillText(text2,width/2,textY2+50);
          ctx.save();
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