import React, { useEffect, useState } from "react";
import "./Weather.css";

import search_icon from "../assets/magnifying-glass.png";
import clear_icon from "../assets/sun.png";
import cloud_icon from "../assets/overcast.png";
import drizzle_icon from "../assets/drizzle.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snowy.png";
import wind_icon from "../assets/wind.png";
import cloudcover_icon from "../assets/cloud.png"; // cloud cover icon

const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeather] = useState(null);

  // Map weather codes to icons
  const getWeatherIcon = (code) => {
    if (code === 0) return clear_icon;
    if ([1, 2, 3].includes(code)) return cloud_icon;
    if ([45, 48].includes(code)) return drizzle_icon;
    if ([51, 53, 55].includes(code)) return drizzle_icon;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return rain_icon;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return snow_icon;
    if ([95, 96, 99].includes(code)) return rain_icon;
    return clear_icon;
  };

  const search = async (cityName) => {
    try {
      // 1. Get city coordinates
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        alert("City not found");
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 2. Get current weather + hourly cloud cover
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=cloudcover`
      );
      const weatherJson = await weatherRes.json();
      const current = weatherJson.current_weather;

      // 3. Find closest hour for cloud cover
      const times = weatherJson.hourly.time;
      let closestIndex = 0;
      let minDiff = Infinity;

      for (let i = 0; i < times.length; i++) {
        const diff = Math.abs(new Date(times[i]) - new Date(current.time));
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }

      const cloudCover = weatherJson.hourly.cloudcover[closestIndex];

      setWeather({
        city: `${name}, ${country}`,
        temperature: current.temperature,
        wind: current.windspeed,
        cloudCover,
        code: current.weathercode,
      });
    } catch (err) {
      console.error("Error fetching weather:", err);
    }
  };

  useEffect(() => {
    search("New Delhi"); // default city
  }, []);

 return (
  <div className="weather">
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <img
        src={search_icon}
        alt="search"
        className="w-5 h-5 cursor-pointer"
        onClick={() => search(city)}
      />
    </div>

    {weatherData && (
      <>
        <img
          src={getWeatherIcon(weatherData.code)}
          alt="weather icon"
          className="weather-icon"
        />
        <p className="temperature">{weatherData.temperature}°C</p>
        <p className="location">{weatherData.city}</p>

        <div className="weather-data">
          <div className="col">
            <img src={cloudcover_icon} alt="cloud cover" className="img" />
            <div>
              <p>
                {weatherData.cloudCover != null
                  ? `${weatherData.cloudCover}%`
                  : "N/A"}
              </p>
              <span>Cloud Cover</span>
            </div>
          </div>

          <div className="col">
            <img src={wind_icon} alt="wind" className="img" />
            <div>
              <p>{weatherData.wind} km/h</p>
              <span>Wind Speed</span>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);


};

export default Weather
