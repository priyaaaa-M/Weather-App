// Selecting elements from the DOM
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-SearchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-SearchForm]"); // Form for searching weather by city name
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

// Initial setup
let currentTab = userTab;
const API_KEY = "151e9984ae65a82eb6299c31a426f9bf";
currentTab.classList.add("current-tab"); // Highlighting the default tab

// Fetch weather information from session storage (if available)
getFromSessionStorage();

function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab"); // Remove the active class from the current tab
        currentTab = clickedTab;
        currentTab.classList.add("current-tab"); // Add the active class to the clicked tab

        if (clickedTab === searchTab) {
            // Switch to search form
            searchForm.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
        } else {
            // Switch back to user's weather
            searchForm.classList.remove("active");
            getFromSessionStorage(); // Retrieve user's weather information from session storage
        }
    }
}

// Event listeners for tab switching
userTab.addEventListener("click", () => switchTab(userTab)); // Switch to user's weather
searchTab.addEventListener("click", () => switchTab(searchTab)); // Switch to search weather

// Function to get user's coordinates from session storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        // If no coordinates are stored, prompt user to grant location access
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates); // Parse stored coordinates
        fetchUserWeatherInfo(coordinates); // Fetch weather information for stored coordinates
    }
}

// Function to fetch weather information using coordinates
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
       
    // Show the loading screen while fetching data
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
   
    try {
        // Fetch weather data from OpenWeatherMap API
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        // Fetch the accurate city name using reverse geocoding
        const accurateCityName = await fetchCityName(lat, lon);
        data.name = accurateCityName; // Override the city name with the accurate one

        // Hide the loading screen and show the user info container
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data); // Render the weather information on the screen
    } catch (err) {
        loadingScreen.classList.remove("active"); // Hide the loading screen in case of an error
        console.error("Error fetching user weather info:", err);
    }
}

// Function to fetch the city name using reverse geocoding
async function fetchCityName(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
        const data = await response.json();
        return data[0]?.name || "Unknown location"; // Return the city name or fallback to "Unknown location"
    } catch (err) {
        console.log("Error fetching city name: ", err);
        return "Unknown location"; // Fallback if something goes wrong
    }
}

// Function to render the weather information on the screen
function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // Display the accurate city name
    cityName.innerText = weatherInfo?.name;
    const countryCode = weatherInfo.sys.country.toLowerCase();
    countryIcon.src = `https://flagcdn.com/144x108/${countryCode}.png`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`;
    desc.innerText = weatherInfo.weather[0].description;
    temp.innerText = `${weatherInfo.main.temp} °C`;
    windspeed.innerText = `${weatherInfo.wind.speed} m/s`;
    humidity.innerText = `${weatherInfo.main.humidity}%`;
    cloudiness.innerText = `${weatherInfo.clouds.all}%`;
}

// Function to get the user's current location using the browser's geolocation API
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to handle the user's position and fetch weather data
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    // Store user's coordinates in session storage and fetch weather information
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}





// Event listener for the "Grant Access" button
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation); // Fetch user's location when button is clicked

// Event listener for the search form submission
const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    let cityName = searchInput.value; // Get the city name input by the user

    if (cityName === "") 
        return; // Do nothing if the input is empty

    // Fetch weather information for the input city
    fetchUserWeatherInfoByCity(cityName);
});



// Function to fetch weather information for a specific city
async function fetchUserWeatherInfoByCity(city) {
    // Show the loading screen while fetching data
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active"); 
    grantAccessContainer.classList.remove("active");

    try {
        // Fetch weather data from OpenWeatherMap API using the city name
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        // Hide the loading screen and show the user info container
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data); // Render the weather information on the screen
    } catch (err) {
        console.error("Error fetching weather info by city:", err); // Log any errors
        loadingScreen.classList.remove("active"); // Hide the loading screen in case of an error
    }
}
















// Function to get area based on Pincode
async function getAreaByPincode(pincode) {
    const url = `https://www.postpincode.in/api/getCityName.php?pincode=${pincode}`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result && result.Status === "Success" && result.PostOffice && result.PostOffice.length > 0) {
            return result.PostOffice[0];
        } else {
            console.error("Error: Invalid response or no data found for the given postal code.");
            return null;
        }
    } catch (err) {
        console.error("Error fetching data:", err);
        return null;
    }
}




// Function to handle the pincode lookup
async function lookupPincode() {
    const pincode = document.getElementById('pincodeInput').value.trim();
    const resultContainer = document.getElementById('result');

    if (pincode === "") {
        resultContainer.innerHTML = "<p>Please enter a pincode.</p>";
        return;
    }

    const data = await getAreaByPincode(pincode);

    if (data) {
        resultContainer.innerHTML = `
            <h3>Details for Pincode ${pincode}</h3>
            <p><strong>Post Office Address:</strong> ${data.PostOfficeAddress || "N/A"}</p>
            <p><strong>District:</strong> ${data.District || "N/A"}</p>
            <p><strong>State:</strong> ${data.State || "N/A"}</p>
        `;
    } else {
        resultContainer.innerHTML = "<p>No details found for the given pincode.</p>";
    }
}













setInterval(() => {
    let date = new Date();
    let timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };

    

    let year = date.getFullYear();
    let month = date.toLocaleDateString("en-us", { month: "short" });
    let day = date.getDate();
    let weekday = date.toLocaleDateString("en-us", { weekday: "long" });
    document.getElementById("date").innerHTML = weekday + "- " + month + " " + day + "- " + year;


    let timeString = date.toLocaleTimeString("en-us", timeOptions).split(":");
    let hour = timeString[0];
    let minute = timeString[1];
    let second = timeString[2].split(" ")[0]; 

    document.getElementById("hour").innerHTML = hour;
    document.getElementById("minute").innerHTML = minute;
    document.getElementById("second").innerHTML = second;

    
   
    

}, 1000);

































