//query selectors
var searchFormEl = document.querySelector("#search-form");
var cityInputEl = document.querySelector("#search");
var searchHistoryEl = document.querySelector("#search-history");
var currentCityEl = document.querySelector("#current-city");
var currentTempEl = document.querySelector("#current-temp");
var currentHumidityEl = document.querySelector("#current-humidity");
var currentWindSpeedEl = document.querySelector("#current-wind-speed");
var currentUVIEl = document.querySelector("#current-UVI");
var currentCityIconEl = document.querySelector("#icon");
var fiveDayWeatherContainerEl = document.querySelector("#five-day-weather");
var clearHistoryEl = document.querySelector("#clear-history");

//array to store city names in local storage
var cities = [];

//load items so they persist after reload
var loadCities = function () {
  //get items from storage if there are any
  cities = JSON.parse(localStorage.getItem("cities")) || [];

  //loop over and populate search history
  for (var i = 0; i < cities.length; i++) {
    var listEL = document.createElement("li");
    listEL.textContent = cities[i].toUpperCase();
    searchHistoryEl.appendChild(listEL);
  }
};

//get the weather data from the api
var getCityWeather = function (cityName) {
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=imperial" +
    "&appid=729f5bb07186b173f99eddc857ac24ca";

  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        //use data to display the weather
        displayWeather(data, cityName);
      });
    } else {
      // if not successful, redirect to homepage
      document.location.replace("./index.html");
    }
  });
};

var searchHandler = function (event) {
  event.preventDefault();
  //get the text from the input field
  var cityName = cityInputEl.value.trim();
  //use the text to display weather data and create a search history list
  if (cityName) {
    getCityWeather(cityName);
    getFiveDayWeather(cityName);
    displaySearchHistory(cityName);
    cityInputEl.value = "";
  } else {
    return;
  }

  // store city in localStorage if the item doesn't already exist in storage and list
  if (cities.indexOf(cityName) === -1) {
    cities.push(cityName);
    JSON.stringify(localStorage.setItem("cities", JSON.stringify(cities)));
  } else {
    return;
  }
};

var getUvIndex = function (cityWeather) {
  //getting UV Index for the city searched for
  var currentLat = cityWeather.coord.lat;
  var currentLon = cityWeather.coord.lon;
  var uvApiUrl =
    "https://api.openweathermap.org/data/2.5/uvi?appid=729f5bb07186b173f99eddc857ac24ca&lat=" +
    currentLat +
    "&lon=" +
    currentLon;
  var uvIndex = fetch(uvApiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var currentUvIndex = data.value;
      currentUVIEl.textContent = currentUvIndex;

      //display appropriate color according to UVI severity
      if (currentUvIndex < 4) {
        currentUVIEl.classList = "favorable";
      } else if (currentUvIndex > 4 && currentUvIndex < 7) {
        currentUVIEl.classList = "moderate";
      } else if (currentUvIndex > 7) {
        currentUVIEl.classList = "severe";
      }
    });
};

//display that city's weather for the day
var displayWeather = function (cityWeather) {
  //get weather icon
  var icon = cityWeather.weather[0].icon;
  var iconUrl = "https://openweathermap.org/img/w/" + icon + ".png";
  currentCityIconEl.setAttribute("src", iconUrl);

  //convert UNIX date timestamp into readable format
  var currentDate = moment.unix(cityWeather.dt).format("MM/DD/YYYY");

  //display the name of the city and the current date
  currentCity = cityWeather.name + " " + currentDate;
  currentCityEl.textContent = currentCity;

  //display that city's temperature
  var cityTemperature = Math.floor(cityWeather.main.temp);
  currentTempEl.textContent = cityTemperature;

  //display that city's humidity
  var cityHumidity = cityWeather.main.humidity;
  currentHumidityEl.textContent = cityHumidity;

  //display that city's wind speed
  var cityWindSpeed = cityWeather.wind.speed;
  currentWindSpeedEl.textContent = cityWindSpeed;

  //display that city's uv index
  getUvIndex(cityWeather);
};

//display that city's five day weather forecast
var getFiveDayWeather = function (cityName) {
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    cityName +
    "&units=imperial" +
    "&appid=729f5bb07186b173f99eddc857ac24ca";

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (cityWeather) {
      //loop through five day weather and display it in the corresponding html cards
      for (var i = 0; i < 5; i++) {
        //get date for each day
        var currentDate = moment
          .unix(cityWeather.list[(i + 1) * 8 - 1].dt)
          .format("dddd MM/DD/YYYY");
        //get weather icon for each day
        var icon = cityWeather.list[(i + 1) * 8 - 1].weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/w/" + icon + ".png";
        //getting temperature for each day
        var cityTemperature = Math.floor(
          cityWeather.list[(i + 1) * 8 - 1].main.temp
        );
        //getting humidity for each day
        var cityHumidity = cityWeather.list[(i + 1) * 8 - 1].main.humidity;
        //update cards to display the appropriate weather for each day
        $("#forecast-city-date" + i).html(currentDate);
        $("#forecast-icon" + i).attr("src", iconUrl);
        $("#forecast-temp" + i).html("<br>" + cityTemperature);
        $("#forecast-humidity" + i).html("<br>" + cityHumidity);
      }
    });
};

//build search history list once a city has been searched
var displaySearchHistory = function (cityName) {
  //only add the city to the list if it doesn't already exist
  if (cities.indexOf(cityName) === -1) {
    var listEL = document.createElement("li");
    listEL.textContent = cityName.toUpperCase();
    $("#search-history").append(listEL);
  } else {
    return;
  }
};

//allow user to select a city from the search history and display its weather data
var selectHistoryItem = function (event) {
  var listEL = event.target;
  if (event.target.matches("li")) {
    getCityWeather(listEL.textContent);
    getFiveDayWeather(listEL.textContent);
  }
};

//User can clear history if they want to start a fresh list
var clearHistory = function (event) {
  localStorage.clear();
  document.location.replace("./index.html");
};

//event listeners
searchFormEl.addEventListener("submit", searchHandler);
clearHistoryEl.addEventListener("click", clearHistory);
document.addEventListener("click", selectHistoryItem);

loadCities();
