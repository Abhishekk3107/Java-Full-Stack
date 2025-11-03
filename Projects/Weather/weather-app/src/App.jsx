import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_KEY = "ec1f9a5d3eacf26097822c5cadedfd5f";

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric");
  const [recentSearches, setRecentSearches] = useState([]);
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => searchByCoords(pos.coords.latitude, pos.coords.longitude),
        () => console.log("Geolocation denied")
      );
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch city suggestions with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (city.length >= 2) {
        setLoadingSuggestions(true);
        try {
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`
          );
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [city]);

  const searchByCoords = async (lat, lon) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      const json = await res.json();
      if (json.cod !== 200) throw new Error(json.message);
      setData(json);
      setCity(json.name);
      fetchForecastByCoords(lat, lon);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setShowSuggestions(false);
    
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
      );
      const json = await res.json();
      if (json.cod !== 200) throw new Error(json.message);
      setData(json);
      fetchForecast(city);

      // Save to recent searches
      const updated = [city, ...recentSearches.filter((c) => c !== city)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}`
      );
      const json = await res.json();
      const daily = json.list.filter((_, i) => i % 8 === 0).slice(0, 5);
      setForecast(daily);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchForecastByCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      const json = await res.json();
      const daily = json.list.filter((_, i) => i % 8 === 0).slice(0, 5);
      setForecast(daily);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const cityName = `${suggestion.name}, ${suggestion.country}`;
    setCity(cityName);
    setShowSuggestions(false);
    searchByCoords(suggestion.lat, suggestion.lon);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
    if (data) {
      searchByCoords(data.coord.lat, data.coord.lon);
    }
  };

  const getWeatherBackground = () => {
    if (!data) return "default";
    const main = data.weather[0].main.toLowerCase();
    if (main.includes("clear")) return "clear";
    if (main.includes("cloud")) return "cloudy";
    if (main.includes("rain") || main.includes("drizzle")) return "rainy";
    if (main.includes("thunder")) return "thunder";
    if (main.includes("snow")) return "snowy";
    if (main.includes("mist") || main.includes("fog")) return "mist";
    return "default";
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`app ${getWeatherBackground()}`}>
      <div className="glass-container">
        <header className="header">
          <h1 className="app-title">
            <span className="weather-icon-header">☀️</span>
            Weather Forecast
          </h1>
          <div className="search-container">
            <div className="search-wrapper" ref={wrapperRef}>
              <div className="search">
                <input
                  type="text"
                  placeholder="Search for a city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button onClick={search} className="search-btn">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </div>

              {/* Autocomplete Suggestions */}
              {loadingSuggestions && (
                <div className="suggestions-loading">
                  <div className="small-spinner"></div>
                  Searching cities...
                </div>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>
                        {suggestion.name}
                        {suggestion.state && `, ${suggestion.state}`}, {suggestion.country}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {showSuggestions &&
                suggestions.length === 0 &&
                city.length >= 2 &&
                !loadingSuggestions && (
                  <div className="no-suggestions">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    No cities found
                  </div>
                )}
            </div>

            <button onClick={toggleUnit} className="unit-toggle">
              {unit === "metric" ? "°C" : "°F"}
            </button>
          </div>

          {recentSearches.length > 0 && !data && (
            <div className="recent-searches">
              <p className="recent-label">Recent Searches:</p>
              <div className="recent-chips">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    className="chip"
                    onClick={() => {
                      setCity(search);
                      setShowSuggestions(false);
                    }}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {data && (
          <>
            <section className="current">
              <div className="location-header">
                <h2>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {data.name}, {data.sys.country}
                </h2>
                <p className="date-time">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="weather-main">
                <div className="temp-section">
                  <div className="temp">{Math.round(data.main.temp)}°</div>
                  <p className="feels-like">
                    Feels like {Math.round(data.main.feels_like)}°
                  </p>
                </div>
                <div className="description">
                  <img
                    src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`}
                    alt={data.weather[0].description}
                    className="weather-icon-large"
                  />
                  <p className="weather-text">{data.weather[0].description}</p>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-card">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  <div>
                    <p className="detail-label">Humidity</p>
                    <p className="detail-value">{data.main.humidity}%</p>
                  </div>
                </div>

                <div className="detail-card">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                  </svg>
                  <div>
                    <p className="detail-label">Wind Speed</p>
                    <p className="detail-value">{data.wind.speed} m/s</p>
                  </div>
                </div>

                <div className="detail-card">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <div>
                    <p className="detail-label">Pressure</p>
                    <p className="detail-value">{data.main.pressure} hPa</p>
                  </div>
                </div>

                <div className="detail-card">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <div>
                    <p className="detail-label">Visibility</p>
                    <p className="detail-value">
                      {(data.visibility / 1000).toFixed(1)} km
                    </p>
                  </div>
                </div>
              </div>

              <div className="sun-times">
                <div className="sun-card">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                  <div>
                    <p className="sun-label">Sunrise</p>
                    <p className="sun-time">{formatTime(data.sys.sunrise)}</p>
                  </div>
                </div>
                <div className="sun-card">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                  <div>
                    <p className="sun-label">Sunset</p>
                    <p className="sun-time">{formatTime(data.sys.sunset)}</p>
                  </div>
                </div>
              </div>
            </section>

            {forecast.length > 0 && (
              <section className="forecast">
                <h3 className="forecast-title">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                  </svg>
                  5-Day Forecast
                </h3>
                <div className="forecast-grid">
                  {forecast.map((day, idx) => (
                    <div key={idx} className="forecast-day">
                      <p className="date">
                        {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                        className="forecast-icon"
                      />
                      <div className="forecast-temps">
                        <p className="forecast-temp">
                          {Math.round(day.main.temp)}°
                        </p>
                        <p className="forecast-range">
                          H: {Math.round(day.main.temp_max)}° L:{" "}
                          {Math.round(day.main.temp_min)}°
                        </p>
                      </div>
                      <p className="small">{day.weather[0].main}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
