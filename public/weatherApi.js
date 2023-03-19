let headerLocation = document.getElementById("heading-txt");
let cardLocation = document.getElementById("location-row-2");
let currentTime = document.querySelector(".current-time-row-1");
let updateTime = document.querySelector(".updated-time-row-1");
let updateTimeZone= document.querySelector(".timezone-row");

function getCurrentTime(){

  let timeAp;
  let today = new Date();
  let currentHour = today.getHours();
  let currentMin = today.getMinutes();

  if(!(currentHour >= 13)) 
  {  timeAp =" AM";
  currentTime.innerText = "Time Now: "+currentHour+":"+currentMin+""+timeAp;
  return;
    // return {currentHour, currentMin, timeAp};
}
  currentHour = currentHour - 12; 
  timeAp =" PM";
  if(!(currentMin>= 10))
  {
    currentTime.innerText = "Time Now: 0"+currentHour+": 0"+currentMin+""+timeAp;
    return;
  }
  currentTime.innerText = "Time Now: 0"+currentHour+":"+currentMin+""+timeAp;
//   return {currentHour, currentMin, timeAp};
}

function getLocation()
{
   
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition, handleError);
        

    } else{
        alert('Geolocation is not supported by your browser');
    }

}
// watch visitor's location
function watchLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(showPosition, handleError);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }
  
  function handleError(error) {
    let errorStr;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorStr = 'User denied the request for Geolocation.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorStr = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorStr = 'The request to get user location timed out.';
        break;
      case error.UNKNOWN_ERROR:
        errorStr = 'An unknown error occurred.';
        break;
      default:
        errorStr = 'An unknown error occurred.';
    }
    console.error('Error occurred: ' + errorStr);
  }

async function showPosition(position){

  const locURL = 'https://api.geoapify.com/v1/geocode/reverse?lat='+position.coords.latitude+'&lon='+position.coords.longitude+'&format=json&apiKey=e95ada9a60654680b049597fa4fa6ff7';
  const foreWeatherURL = 'https://api.weatherapi.com/v1/forecast.json?q='+position.coords.latitude+','+position.coords.longitude+'&key=b07b1a055500470e8f942328230503&days=7';

 
  try {
    const[locationRes, foreRes] = await Promise.all([
        fetch(locURL,{method:'GET'}),
        fetch(foreWeatherURL,{method: 'GET'})
    ]);
    
    const [locData, foreData] = await Promise.all([
         locationRes.json(),
         foreRes.json()
    ]);
    clearBlur();
    
    getWeatherBg(foreData.current.is_day, foreData.current.condition.code);
    processLocationReq(locData.results[0]);
    processForeReq(foreData.current);
    processParagraphReq(foreData.forecast.forecastday[0]);
   
 
  } catch (error) {
    console.error(error);
  }
}

function processParagraphReq(data){
    let infosection = document.querySelector('.location-row-4');
    let uvInfo = document.querySelector('#sun-txt');
    let rainAmt = document.querySelector('#amt-txt');
    let rainChance = document.querySelector('#rain-txt');
    let maxTemp = document.querySelector('.high-temp-txt');
    let minTemp = document.querySelector('.low-temp-txt');

    let getSunRise = data.astro.sunrise;
    let getSunSet = data.astro.sunset;
    let getConditionNow = data.day.condition.text;
    let getRain = data.day.daily_chance_of_rain;
    let getRainAmt = data.day.totalprecip_mm;
    let getVision = data.day.avgvis_km;
    let getMaxtemp = data.day.maxtemp_c;
    let getMintemp = data.day.mintemp_c;
    let getUv = data.day.uv;
    
    const {uvRate, uvRatingStr} = getUvInfo(getUv);

    infosection.innerHTML = getConditionNow + ' day. Sunrises at '+ getSunRise +'. Sun sets at '+ getSunSet+'. There is '+getRain+'% chances of rain'+ '. Average vision will be '+getVision+'KM. Also, check the UV index before leaving the house. Right now'+uvRatingStr;
    rainChance.innerText = getRain+'%';
    rainAmt.innerText = getRainAmt+'mm';
    uvInfo.innerText = uvRate.toUpperCase();
    maxTemp.innerText = getMaxtemp+'°C';
    minTemp.innerText = getMintemp+'°C';
}

function getUvInfo(uvRes) {
    let uvRatingStr;
    let uvRate;
    switch (uvRes) {
      case 1:
      case 2:
        uvRate = 'low';
        uvRatingStr = ' it is ' + uvRate + ', meaning it\'s safe to be outdoors unprotected.';
        break;
      case 3:
      case 4:
      case 5:
        uvRate = 'moderate';
        uvRatingStr = ' it is ' + uvRate + ', meaning it\'s safe to be outdoors. Sunscreen might needed.';
        break;
      case 6:
      case 7:
        uvRate = 'high';
        uvRatingStr = ' it is ' + uvRate + ', meaning it\'s not safe to be outdoors unprotected. Sunscreen needed.';
        break;
      case 8:
      case 9:
      case 10:
        uvRate = 'very high';
        uvRatingStr = ' it is ' + uvRate + ', meaning it\'s not safe to be outdoors unprotected. Take extra caution.';
        break;
      case 11:
        uvRate = 'extreme';
        uvRatingStr = ' it is ' + uvRate + ', meaning it\'s very not safe to be outdoors.';
        break;
      default:
        uvRatingStr = 'No information';
        break;
    }
  
    return { uvRate, uvRatingStr };
  }

function getWeatherBg(isDay, condition)
{
    let getday = isDay;
    let getCode = condition;
    
    fetch('/images/icon.json')
    .then(response=> response.json())
    .then(datas=>
        {
            const result = datas.find(data=>
                data.code === getCode
            );
            checkIcon(result, getday);
        } )

    .catch(error => console.error(error));
}

function checkIcon(res, dayNight)
{

   let weatherBg = document.querySelector('#main-section');
   if(dayNight == 1){
    console.log(res.imageDay);
    weatherBg.style.backgroundImage = 'url(/images/'+res.imageDay+')';
    return;
   }
   weatherBg.style.backgroundImage = 'url(/images/'+res.imageNight+')';

}
  
function processLocationReq(data){
    let getSuburb = data.suburb;
    let getAddress = data.address_line2;
    let getTimeZone = data.timezone.abbreviation_STD;

    headerLocation.innerText = getAddress;
    cardLocation.innerText = getSuburb;
    updateTimeZone.innerText = getTimeZone;

  
}
function processForeReq(data){
    let humidity = document.querySelector('#hum-cl');    
    let gust = document.querySelector('#gust-cl');    
    let pressure = document.querySelector('#pre-cl');    
    let winddir = document.querySelector('#wind-cl-1');    
    let windSpeed = document.querySelector('#wind-cl-2');    
    let feelsTemp = document.querySelector('#location-row-2-temp');
    let currentTemp = document.querySelector('#current-temp-row-4');
    let currentCondn = document.querySelector('.current-condition-row-3');
    let weatherIcon = document.querySelector('.current-weather-info img');

    let getUpdatedTime = data.last_updated;
    let getFeels = data.feelslike_c;
    let getTemp = data.temp_c;
    let getHum = data.humidity;
    let getWindgust = data.gust_kph;
    let getPressure = data.pressure_mb;
    let getWind = data.wind_kph;
    let getDir = data.wind_dir;
    let getCond = data.condition.text;
    let getIcon = data.condition.icon;

    updateTime.innerText = 'UPDATED '+getUpdatedTime;
    humidity.innerText = getHum+'%';
    gust.innerText = getWindgust+'km/h';
    pressure.innerText = getPressure+'hpa';
    windSpeed.innerText = getWind+'km/h';
    winddir.innerText = getDir;
    feelsTemp.innerText = getFeels+'°C';
    currentTemp.innerText = getTemp+'°C';
    currentCondn.innerText = getCond;
    weatherIcon.src = getIcon;
    
}

function clearBlur()
{
    let blurred = document.querySelector('.main-container');
    let getblur = blurred.dataset.beforeLoad;
    getblur = 'unblur';
    blurred.setAttribute('data-before-load', getblur);
}
getLocation();
getCurrentTime();
watchLocation();
