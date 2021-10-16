export const setPlaceholderText = () => {
    const input = document.getElementById("searchBar__text");
    window.innerWidth < 400
    ? (input.placeholder = "City, State, Country")
    : (input.placeholder = "City, State, Country, or Zip Code")
}
export const addSpinner = (elem) => {
    animateButton(elem);
    setTimeout(animateButton, 1000, elem);
}

const animateButton = (elem) => {
    elem.classList.toggle("none");
    elem.nextElementSibling.classList.toggle("block");
    elem.nextElementSibling.classList.toggle("none");
}

export const displayError = (headerMsg, scrnReaderMsg) => {
    updateWeatherLocationHeader(headerMsg)
    updateScrnReaderConfirmation(scrnReaderMsg)
}

export const displayApiError = (statusCode) => {
    const properCasedMsg = toProperCase(statusCode.message);
    updateWeatherLocationHeader(properCasedMsg)
    updateScrnReaderConfirmation(`${properCasedMsg}. Please try again`) 
}
const toProperCase = (text) => {
    const words = text.split(" ");
    const properWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return properWords.join(" ");
}
const updateWeatherLocationHeader = (headerMsg) => {
    const h1 = document.getElementById("currentForecast__location");
    if(headerMsg.indexOf("Lat:") != -1 && headerMsg.indexOf("Long:") != -1){
        const msgArray = headerMsg.split(" ");
        const mapArray = msgArray.map(msg => {
            return msg.replace(":", ": ");
        });
        const lat = mapArray[1].indexOf("-") === -1
        ? mapArray[1].slice(0, 10)
        : mapArray[1].slice(0, 11);
        
        const lon = mapArray[3].indexOf("-") === -1
        ? mapArray[1].slice(0, 10)
        : mapArray[1].slice(0, 11);

        h1.textContent = `Lat: ${lat} and Lon: ${lon}`
    }else{
        h1.textContent = headerMsg;
    }
}
export const updateScrnReaderConfirmation = (scrnReaderMsg) => {
    const confirmation = document.getElementById("confirmation");
    confirmation.textContent = scrnReaderMsg;
}

export const updateDisplay = (weatherJson, locationObj) => {
    fadeDisplay();
    clearDispaly();
    const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
    setBGImage(weatherClass);
    const scrnReaderWeather = buildScrnReaderWeather(weatherJson, locationObj);
    updateScrnReaderConfirmation(scrnReaderWeather);
    updateWeatherLocationHeader(locationObj.getName());

    const currentConditionsArray = createCurrentConditionsDivs(weatherJson, locationObj.getUnit()); 
    displayCurrentConditions(currentConditionsArray);
    displaySixDayForecast(weatherJson);
    setFocusOnSearch();
    fadeDisplay();
}

const clearDispaly = () => {
    const currentConditions = document.getElementById("currentForecast__conditions");
    currentConditions.innerHTML = "";
    const sixDayForecast = document.getElementById("dailyForecast__contents");
    sixDayForecast.innerHTML = "";
}

const getWeatherClass = (icon) => { 
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    const weatherLookup = {
        "09": "snow",
        "10": "rain",
        "11": "rain",
        "13": "snow",
        "50": "fog",
    }
    let weatherClass;
    if(weatherLookup[firstTwoChars]){
        weatherClass = weatherLookup[firstTwoChars];
    }else if(lastChar === "d"){
        weatherClass = "clouds";
    }else{
        weatherClass = "night";
    }

    return weatherClass;
} 


const setBGImage = (weatherClass) => {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach((img) => {
      if (img !== weatherClass) document.documentElement.classList.remove(img);
    });
};

const buildScrnReaderWeather = (weatherJson, locationObj) =>{
    const location = locationObj.getName();
    const unit = locationObj.getUnit();
    const tempUnit = unit === "imperial"
    ? "F"
    : "C";
    return `${weatherJson.current.weather[0].description} and ${Math.round(Number(weatherJson.current.temp))}°${tempUnit} in ${location}`;
}

const fadeDisplay = () => {
    const cc = document.getElementById("currentForecast");
    cc.classList.toggle("zero-visibility");
    cc.classList.toggle("fade-in");

    const sixDay = document.getElementById("dailyForecast");
    sixDay.classList.toggle("zero-visibility");
    sixDay.classList.toggle("fade-in");
}

const setFocusOnSearch = () => {
    document.getElementById("searchBar__text").focus();
}

const createCurrentConditionsDivs = (weatherObj, unit) => {
    const tempUnit = unit === "imperial" ? "F" : "C";
    const windUnit = unit === "imperial" ? "mph" : "m/s";
    const icon = createMainImgDiv(
        weatherObj.current.weather[0].icon,
        weatherObj.current.weather[0].description
        );

    const temp = createElem(
        "div",
        "temp",
        `${Math.round(Number(weatherObj.current.temp))}°`        
    )

    const properCasedDescription = toProperCase(weatherObj.current.weather[0].description);
    const desc = createElem("div", properCasedDescription);
    const feels = createElem("div", "feels", `Feels like ${Math.round(Number(weatherObj.current.feels_like))}°`);
    const maxTemp = createElem("div", "maxtemp", `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°`);
    const minTemp = createElem("div", "mintemp", `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°`);
    const humidity = createElem("div", "humidity", `Humidity ${Math.round(Number(weatherObj.current.humidity))}`)
    const wind = createElem("div", "wind", `Wind ${Math.round(Number(weatherObj.current.wind_speed))}${windUnit}`);

    return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
}

const createMainImgDiv = (icon, altText) => {
    const iconDiv = createElem("div", "icon");
    iconDiv.id = "icon";
    const faIcon = translateIconToFontAwesome(icon);
    faIcon.ariaHidden = true;
    faIcon.title = altText;
    iconDiv.appendChild(faIcon);
    return iconDiv;
}

const createElem = (tagName, divClass, divText, unit) => {
    const div = document.createElement(tagName);
    div.className = divClass;
    if(divText){
        div.textContent = divText;
    }
    if(divClass === "temp") {
        const unitDiv = document.createElement("div");
        unitDiv.classList.add("unit");
        unitDiv.textContent = unit;
        div.appendChild(unitDiv);
    }

    return div;
}

const translateIconToFontAwesome = (icon) => {
    const i = document.createElement("i");

    const iconMap = {
        "01d": "far fa-sun",
        "01n": "far fa-moon",
        "02d": "fas fa-cloud-sun",
        "02n": "fas fa-moon",
        "03d": "fas fa-cloud",
        "03n": "fas fa-cloud",
        "04d": "fas fa-cloud-meatball",
        "04n": "fas fa-cloud-meatball",
        "09d": "fas fa-cloud-rain",
        "09n": "fas fa-cloud-rain",
        "10d": "fas fa-cloud-sun-rain",
        "10n": "fas fa-moon-rain", 
        "11n": "fas fa-poo-storm", 
        "11d": "fas fa-poo-storm", 
        "13d": "far fa-snowflake",
        "13n": "far fa-snowflake",
        "50d": "fas fa-smog",
        "50n": "fas fa-smog",
    }
    if(iconMap[icon] === undefined){
        i.classList.add("fas", "fa-question-circle");
    }else{
        i.classList.add(...iconMap[icon].split(" "));
    }
    return i;
}

const displayCurrentConditions = (currentConditionsArray) => {
    const ccContainer = document.getElementById("currentForecast__conditions");
    currentConditionsArray.forEach(cc => {
        ccContainer.appendChild(cc);
    });
}

const displaySixDayForecast = (weatherJson) => {
    for(let i=1; i<=6; i++){
        const dfArray = createDailyForecastDivs(weatherJson.daily[i]);
        displayDailyForecast(dfArray);
    }
} 

const createDailyForecastDivs = (dayWeather) => {
    const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
    const dayAbbreviation = createElem("p", "dayAbbreviation", dayAbbreviationText);
    const dayIcon = createDailyForecastIcon(dayWeather.weather[0].icon, dayWeather.weather[0].description);
    const dayHigh = createElem("p", "dayHigh", `${Math.round(Number(dayWeather.temp.max))}°`);
    const dayLow = createElem("p", "dayLow", `${Math.round(Number(dayWeather.temp.min))}°`);
    return [dayAbbreviation, dayIcon, dayHigh, dayLow];
}

const getDayAbbreviation = (data) => {
    const dateObj = new Date(data * 1000);
    const utcString = dateObj.toUTCString();
    return utcString.slice(0,3).toUpperCase();
}
const createDailyForecastIcon = (icon) => {
    const img = document.createElement("img");
    if(window.innerWidth < 768 || window.innerHeight < 1025){
        img.src = `https://openweathermap.org/img/wn/${icon}.png`
    }else{
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    return img;
}

const displayDailyForecast = (dfArray) => {
    const dayDiv = createElem("div", "forecastDay");
    dfArray.forEach((el) => {
        dayDiv.appendChild(el);
    });

    const dailyForecastContainer = document.getElementById("dailyForecast__contents");
    dailyForecastContainer.appendChild(dayDiv);
}
