import {
    setPlaceholderText,
    addSpinner,
    displayError,
    displayApiError,
    updateScrnReaderConfirmation,
    updateDisplay
} from "./domFunctions.js";

import {
    setLocationObject,
    getHomeLocation,
    getWeatherFromCoords,
    cleanText,
    getCoordsFromApi
} from "./dataFunctions.js";

import CurrentLocation from "./CurrentLocation.js";

const currentLoc = new CurrentLocation();

const initApp = () => {
    const geoButton = document.getElementById("getLocation");
    geoButton.addEventListener("click", getGeoWeather);

    const homeButton = document.getElementById("home");
    homeButton.addEventListener("click", loadWeather);

    const saveButton = document.getElementById("saveLocation");
    saveButton.addEventListener("click", saveLocation);

    const unitButton = document.getElementById("changeUnits");
    unitButton.addEventListener("click", setUnitPref);

    const refreshButton = document.getElementById("refresh");
    refreshButton.addEventListener("click", refreshWeather);

    const locationEntry = document.getElementById("searchBar__form");
    locationEntry.addEventListener("submit", submitNewLocation);

    setPlaceholderText();
}

document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (e) => {
    if(e){
        if(e.type === "click"){
            const mapIcon = document.querySelector(".fa-map-marker-alt");
            addSpinner(mapIcon);
        }
    }

    if(!navigator.geolocation){
        return geoError();
    }else{
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    }
}

const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geo Location not supported";
    displayError(errMsg, errMsg);
}

const geoSuccess = (position) => {
    const coordsObj = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: `Lat: ${position.coords.latitude} Long: ${position.coords.longitude}`,
    }
    setLocationObject(currentLoc, coordsObj);
    updateDataAndDisplay(currentLoc);    
}

const loadWeather = (event) => {
    const savedLocation  = getHomeLocation();
    if(!savedLocation && !event){
        return getGeoWeather();
    }

    if(!savedLocation && event.type == "click") {
        displayError(
            "No home location saved", 
            "Sorry, please save your home location first"
        )
    }else if(savedLocation && !event) {
        displayHomeLocationWeather(savedLocation);
    }else{
        const homeIcon = document.querySelector(".fas.fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);
    }
}
const displayHomeLocationWeather = (home) => {
    if(!typeof home === "string"){
        const locationJson = JSON.parse(home);
        const coordsObj = {
            lat: locationJson.lat,
            lon: locationJson.lon,
            name: locationJson.name,
            unit: locationJson.unit,
        }
        setLocationObject(currentLoc, coordsObj);
        updateDataAndDisplay(currentLoc);
    }
}

const saveLocation = () => {
    if(currentLoc.getLat && currentLoc.getLon){
        const saveIcon = document.querySelector(".fa-save");
        addSpinner(saveIcon);

        const location = {
            name: currentLoc.getName(),
            lat: currentLoc.getLat(),
            lon: currentLoc.getLon(),
            unit: currentLoc.getUnit()
        }

        localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
        updateScrnReaderConfirmation(`Saved ${currentLoc.getName} as home location`);
    }
}

const setUnitPref = () => {
    const unitIcon = document.querySelector(".fas.fa-chart-bar");
    addSpinner(unitIcon);
    currentLoc.toggleUnit();
    updateDataAndDisplay(currentLoc);
}

const refreshWeather = () => {
    const refreshIcon = document.querySelector(".fas.fa-redo");
    addSpinner(refreshIcon);
    updateDataAndDisplay(currentLoc);
}

const submitNewLocation = async (e) =>{
    e.preventDefault();
    const text = document.getElementById("searchBar__text").value;
    const entryText = cleanText(text);

    if(!entryText.length){
        return;
    }

    const locationIcon = document.querySelector(".fa.fa-search");
    addSpinner(locationIcon);

    const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
    if(coordsData){
        if(coordsData.cod === 200){
            const coordsObj = {
                lat: coordsData.coord.lat,
                lon: coordsData.coord.lon,
                name: coordsData.sys.country 
                ? `${coordsData.name}, ${coordsData.sys.country}`
                : coordsData.name
            };
            setLocationObject(currentLoc, coordsObj)
            updateDataAndDisplay(currentLoc);
        }else{
            displayApiError(coordsData);
        }
    }else{
        displayError("Connection Error", "Connection Error");
    }
}

const updateDataAndDisplay = async (locationObj) => {
    const weatherJson = await getWeatherFromCoords(locationObj);
    if(weatherJson) {
        updateDisplay(weatherJson, locationObj)
    }
};