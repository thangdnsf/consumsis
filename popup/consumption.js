const kwhperbattery= 0.01504; //iphone 11 pro max
const kwhpereuro = 0.1765; // France
const co2perplanekm = 38.7;//airbus 380:75g/passenger/km * 516 seats = 38700g
const co2percarkm = 0.224;//Toyota Avensis, 2.0 VVT-i Tourer 224g/km
const co2percyclingkm = 0.021;//21g per km
const co2perwalkingkm = 0.75;//21g per km
const wattsperlignt = 23;//Philips 23W - CFL light
const co2percandy = 0.0106;//8.13 grams/candy * 5 *8.13/352*1100 = 127g/hours ~ 10.6g/5 ms
class consumption {
    constructor() {
        this.bytes = parseInt(localStorage.getItem('total'));
        this.kwh = parseFloat(localStorage.getItem('totalkwh'));
        this.ghg = parseFloat(localStorage.getItem('totalghg'));
    }
    get getBytesString(){
        if (this.bytes*1e-6 < 1)
            return this.bytes.toString() + " bytes";
        else if (this.bytes*1e-6 < 1000)
            return (this.bytes*1e-6).toFixed(2).toString() + " MB";
        else
            return (this.bytes*1e-9).toFixed(2).toString() + " GB";
    }

    get getkwhString(){
        return this.kwh.toFixed(2).toString()+" kWh";
    }

    get getGHGString(){
        if(this.ghg < 0.1)
            return (this.ghg*1000).toFixed(0).toString()+" gCO2e";
        return this.ghg.toFixed(2).toString()+" kgCO2e";
    }
    get getbatteryString(){
        return (this.kwh/kwhperbattery).toFixed(1).toString();
    }
    get getmoneyString(){
        return (this.kwh*kwhpereuro).toFixed(1).toString();
    }
    get getplanekmString(){
        const d = this.ghg/co2perplanekm; //km
        if(d < 1)
            return [(d*1000).toFixed(2).toString(),"m"];
        else
            return [d.toFixed(2).toString(), "km"];
    }
    get getcarkmString(){
        const d = this.ghg/co2percarkm; //km
        if(d < 1)
            return [(d*1000).toFixed(2).toString(),"m"];
        else
            return [d.toFixed(2).toString(), "km"];
    }
    get getcyclingkmString(){
        const d = this.ghg/co2percyclingkm; //km
        if(d < 1)
            return [(d*1000).toFixed(2).toString(),"m"];
        else
            return [d.toFixed(2).toString(), "km"];
    }
    get getwalkingkmString(){
        const d = this.ghg/co2perwalkingkm; //km
        if(d < 1)
            return [(d*1000).toFixed(2).toString(),"m"];
        else
            return [d.toFixed(2).toString(), "km"];
    }
    get getlightString(){
        const d = (this.kwh*1000/wattsperlignt); //hours
        if(d < 24)
            return [(d).toFixed(2).toString(),"hours"];
        else
            return [(d/24).toFixed(2).toString(), "days"];
    }
    get getcakeString(){
        return (this.ghg/co2percandy).toFixed(0).toString();
    }
  }

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