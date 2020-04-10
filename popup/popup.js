const kWhPerByteDataCenter = 7.20e-11;
const kWhPerByteNetwork = 1.52e-10;
const kWhPerMin = 3.2e-04;
window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

convertB = (bytes) => {
    if (bytes*1e-6 < 1)
        return bytes.toString() + " bytes"
    else if (bytes*1e-6 < 1000)
        return (bytes*1e-6).toFixed(2).toString() + " MB"
    else
        return (bytes*1e-9).toFixed(2).toString() + " GB"
}

computeKWh = (byte) => {
    return ((kWhPerByteDataCenter+kWhPerByteNetwork)*byte)
}
convertKWh = (byte) => {
    return computeKWh(byte).toFixed(2).toString()+" kWh";
}

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

getTopDomain = ()=>{
    var data = JSON.parse(localStorage.getItem('mbperdomain'))
    
    var arr = [];

    for (var key in data) {
        var a = new Object();
        a.key = key;
        a.val = data[key];
        arr.push(a);
    }
    masterList = arr.sort(function (a, b) {
        return b.val - a.val;
    });
    result = masterList.slice(0,5);
    var sum = 0;
    for(var a of masterList.slice(5,masterList.length)){
        sum+= a.val;
    }
    if (sum >0){
        result.push({key:"other",val: sum});}
    return result;
}
document.addEventListener('DOMContentLoaded',function(){
    //get information of device user
    var device = JSON.parse(localStorage.getItem('device'));
    document.getElementById('ip').innerHTML = device.IP;
    document.getElementById('ctr').innerHTML = device.country;

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
          bytes = parseInt(localStorage.getItem('total'));
          var fontSize = (height / 220).toFixed(2);
          ctx.textAlign = "center";
          ctx.font = fontSize + "em sans-serif";
          ctx.textBaseline = "middle";
          
          var text = convertKWh(bytes),
              //textX = Math.round((width - ctx.measureText(text).width) / 2),
              textY = height / 2 - 60;

          ctx.fillStyle = window.chartColors.blue;
          
          ctx.fillText(text,width/2,textY-10);

          //
          var text1 = convertB(bytes),
            //textX1 = Math.round((width - ctx.measureText(text).width) / 2)-11,
            textY1 = height / 2 - 60;
          
          fontSize = (height / 150).toFixed(2);
          ctx.font = fontSize + "em sans-serif";

          ctx.fillStyle = window.chartColors.red;
          ctx.fillText(text1, width/2, textY1+20);

          //
          var text2 = (device.GHG*computeKWh(bytes)).toFixed(3).toString()+" kgCO2e",
          //textX2 = Math.round((width - ctx.measureText(text).width) / 2),
          textY2 = height / 2 - 60;
          
          fontSize = (height / 220).toFixed(2);
          ctx.font = fontSize + "em sans-serif";
          ctx.fillStyle = window.chartColors.green;
          ctx.fillText(text2,width/2,textY2+50);
          ctx.save();
        }
      });
    
    //console.log("hello");
    //document.getElementById('total').innerHTML = convertB(parseInt(localStorage.getItem('total')));
})
createInfoDevice();
//hi Pratvi



  // Or with jQuery




  $(document).ready(function(){
    $('.tabs').tabs();
  });