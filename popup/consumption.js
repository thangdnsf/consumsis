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
        createInfoDevice();
        var bg = chrome.extension.getBackgroundPage();
        this.bytes = bg.total;//parseInt(localStorage.getItem('total'));
        this.kwh = bg.totalkwh;//parseFloat(localStorage.getItem('totalkwh'));
        this.ghg = bg.totalghg;//parseFloat(localStorage.getItem('totalghg'));
        this.device = bg.device;
    }
    get getIP(){
        return this.device == null ? "unknown":this.device.IP;
    }
    get getCountry(){
        return this.device == null ? "unknown":this.device.country;
    }
    get getGHG(){
        return this.device == null ? "unknown":this.device.GHG;
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
        return (this.kwh/kwhperbattery).toFixed(0).toString();
    }
    get getmoneyString(){
        return (this.kwh*kwhpereuro).toFixed(1).toString();
    }
    get getplanekmString(){
        console.log(this.bytes,this.kwh,this.ghg)
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
    var bg = chrome.extension.getBackgroundPage();
    var data = bg.mbvalueJson;//JSON.parse(localStorage.getItem('mbperdomain'))
    
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
    var bg = chrome.extension.getBackgroundPage();
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
        bg.device = obj;
    });
};

getnumofmonth = (month,year) => {
    switch(month){
        case 1:case 3:case 5:case 7:case 8:case 10:case 12:
            return 31;
        case 4: case 6: case 9: case 11:
            return 30;
        case 2:
            if((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)
                return 29;
            else
                return 28;
    }
}

getbyhour = ()=>{
    var bg = chrome.extension.getBackgroundPage();
    var mbbyhour = bg.mbvaluehourJson;

    const date = new Date(); 
    const hour = date.getHours();

    var data = [];
    var data_id = [];

    for (let i = 22-hour; i >= 0; i--){
        data.push((mbbyhour[23-i] === undefined ? 0: parseInt((mbbyhour[23-i][1])*1e-9*10)/10));
        data_id.push((23-i).toString()+':00');
    }
    for (let i = 0; i <= hour; i++){
        data.push((mbbyhour[i]=== undefined ? 0:parseInt((mbbyhour[i][1])*1e-9*10)/10));
        data_id.push(i.toString()+':00');
    }
    return [data_id,data];
}

getbyday = ()=>{
    var bg = chrome.extension.getBackgroundPage();
    var mbbyday = bg.mbvaluedayJson;

    const date = new Date(); 
    const day = date.getDate();
    const month = date.getMonth()+1;
    const year = date.getFullYear();

    var data = [];
    var data_id = [];
    const nblastmonth = getnumofmonth(month - 1 <= 0?12:month-1, year);
    for (let i = 27-day; i >= 0; i--){
        data.push((mbbyday[nblastmonth-i] === undefined ? 0: parseInt((mbbyday[nblastmonth-i][1])*1e-9*100)/100));
        data_id.push((nblastmonth-i).toString()+'/'+(month-1).toString()+'/'+year.toString().slice(2,4));
    }
    for (let i = 1; i <= day; i++){
        data.push((mbbyday[i]=== undefined ? 0:parseInt((mbbyday[i][1])*1e-9*100)/100));
        data_id.push(i.toString()+'/'+month.toString()+'/'+year.toString().slice(2,4));
    }
    return [data_id,data];
}

getbymonth = ()=>{
    var bg = chrome.extension.getBackgroundPage();
    var mbbymonth = bg.mbvaluemonthJson;

    const date = new Date(); 
    const month = date.getMonth()+1;
    const year = date.getFullYear();

    var data = [];
    var data_id = [];
    
    for (let i = 11-month; i >= 0; i--){
        data.push((mbbymonth[12-i] === undefined ? 0: parseInt((mbbymonth[12-i][1])*1e-9*100)/100));
        data_id.push((12-i).toString()+'/'+(year-1).toString().slice(2,4));
    }
    for (let i = 1; i <= month; i++){
        data.push((mbbymonth[i]=== undefined ? 0:parseInt((mbbymonth[i][1])*1e-9*100)/100));
        data_id.push(i.toString()+'/'+year.toString().slice(2,4));
    }
    return [data_id,data];
}

getbyyear = ()=>{
    var bg = chrome.extension.getBackgroundPage();
    var mbbyyear = bg.mbvalueyearJson;

    var data = [];
    var data_id = [];

    for (var key in mbbyyear) {
        data.push(parseInt((mbbyyear[key])*1e-9*100)/100);
        data_id.push(key);
    }
    return [data_id,data];
}