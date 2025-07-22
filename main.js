// Selecting elements from the DOM
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-SearchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-SearchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const searchInput = document.querySelector("[data-searchInput]");
const grantAccessButton = document.querySelector("[data-grantAccess]");

// Initial setup
let currentTab = userTab;
const API_KEY = "151e9984ae65a82eb6299c31a426f9bf";
currentTab.classList.add("current-tab");

// Fetch weather information from session storage (if available)
getFromSessionStorage();

function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if (clickedTab === searchTab) {
            // Switch to search form
            searchForm.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchInput.value = "";
        } else {
            // Switch back to user's weather
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            loadingScreen.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

// Event listeners
userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
        userInfoContainer.classList.remove("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        // First get location details (reverse geocoding)
        const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );

        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            throw new Error("Location not found");
        }

        // Then get weather data
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const weatherData = await weatherResponse.json();

        // Merge location data with weather data
        weatherData.name = geoData[0]?.name || weatherData.name || "Current Location";
        weatherData.sys = weatherData.sys || {};
        weatherData.sys.country = geoData[0]?.country || weatherData.sys.country || "";

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(weatherData);
    } catch (err) {
        console.error("Error fetching weather:", err);
        loadingScreen.classList.remove("active");
        alert("Failed to fetch weather data. Please try again.");
    }
}

function renderWeatherInfo(weatherInfo) {
    // Validate weather data
    if (!weatherInfo || !weatherInfo.weather || !weatherInfo.weather[0]) {
        console.error("Invalid weather data:", weatherInfo);
        return;
    }

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // Set weather data
    cityName.innerText = weatherInfo.name || "Unknown Location";
    desc.innerText = weatherInfo.weather[0].description || "Weather data not available";
    temp.innerText = weatherInfo.main?.temp ? `${Math.round(weatherInfo.main.temp)} °C` : "N/A";
    windspeed.innerText = weatherInfo.wind?.speed ? `${weatherInfo.wind.speed} m/s` : "N/A";
    humidity.innerText = weatherInfo.main?.humidity ? `${weatherInfo.main.humidity}%` : "N/A";
    cloudiness.innerText = weatherInfo.clouds?.all ? `${weatherInfo.clouds.all}%` : "N/A";


    if (weatherInfo.weather[0].icon) {
        weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`;
        weatherIcon.style.display = "block";
    } else {
        weatherIcon.style.display = "none";
    }


    if (weatherInfo.sys?.country) {
        const countryCode = weatherInfo.sys.country.toLowerCase();

        countryIcon.src = `https://flagcdn.com/w80/${countryCode}.png`;


        countryIcon.onerror = () => {

            countryIcon.src = `https://flagcdn.com/w40/${countryCode}.svg`;
            countryIcon.onerror = () => {

                countryIcon.src = "images/location.png";
            };
        };
        countryIcon.style.display = "block";
        countryIcon.alt = `${weatherInfo.sys.country} flag`;
    } else {
        countryIcon.style.display = "none";
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            showPosition,
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location. Please enable location services.");
            },
            { timeout: 10000 }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

// Grant access button
grantAccessButton.addEventListener("click", getLocation);

// Search form
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cityName = searchInput.value.trim();

    if (!cityName) return;

    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        // First get coordinates for the city
        const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
        );

        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            throw new Error("City not found");
        }

        // Then get weather using coordinates
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${geoData[0].lat}&lon=${geoData[0].lon}&appid=${API_KEY}&units=metric`
        );

        const weatherData = await weatherResponse.json();
        weatherData.name = geoData[0].name || cityName;
        weatherData.sys = weatherData.sys || {};
        weatherData.sys.country = geoData[0]?.country || "";

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(weatherData);
    } catch (err) {
        console.error("Search error:", err);
        loadingScreen.classList.remove("active");
        alert("Could not find weather for that city. Please check the name and try again.");
    }
});

// Digital Clock
function updateClock() {
    const date = new Date();
    const options = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    };

    document.getElementById("date").textContent = date.toLocaleDateString('en-US', options);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    document.getElementById("hour").textContent = hours;
    document.getElementById("minute").textContent = minutes;
    document.getElementById("second").textContent = seconds;
}

setInterval(updateClock, 1000);
updateClock(); // Initial call