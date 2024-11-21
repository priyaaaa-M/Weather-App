console.log("hello priyanka");

const API_KEY = "151e9984ae65a82eb6299c31a426f9bf";

function renderinfo(data) {
    let newPara = document.createElement('P')
    newPara.textContent = `${data?.main?.temp.toFixed(2)}°C`

    document.body.appendChild(newPara)
}

async function featchWeatherDetail() {


    try {
        let city = "mumbai";
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        console.log("weather data -> ", data);
        renderinfo(data);
    }
    catch (error) {
        console.log("error -> ", error)
    }
}

featchWeatherDetail(); // Call the function

async function getCustomWeatherDetails() {
    try{
        let latitude = 15.6333;
        let longitude = 18.3333;
    
        let result = await fetch(`https://api.openweathermap.org/data/2.5/weather?
                                lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
    
        let data = await result.json();
    
        console.log(data);
    }
    catch(err) {
        console.log("Errror Found" , err);
    }

}



function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    let lat = position.coords.latitude;
    let longi = position.coords.longitude;

    console.log("Latitude: " + lat);
    console.log("Longitude: " + longi);
}





