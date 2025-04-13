import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { About } from "./components/About";
import { ReadPage } from "./components/ReadPage";
import { CreatePage } from "./components/CreatePage";
import { UpdatePage } from "./components/UpdatePage";
import './App.css';

const WeatherCard = ({ current, forecast }) => (
  <div className="bg-white p-4 rounded shadow mt-4 flex flex-col gap-6">
    {/* Current Weather Block */}
    <div className="w-full">
      <h2 className="text-lg font-bold mb-2 text-blue-600">CURRENT WEATHER</h2>
      <div className="flex items-center gap-4">
        <img 
          src={`http://openweathermap.org/img/wn/${current.icon}@2x.png`} 
          alt="weather icon" 
        />
        <div className="text-left">
          <h3 className="text-xl capitalize">{current.description}</h3>
          <p>Temperature: <strong>{current.temp}°C</strong></p>
          <p>Feels like: {current.feels_like}°C</p>
        </div>
      </div>
    </div>

    {/* Forecast Weather Block */}
    <div className="w-full">
      <h2 className="text-lg font-bold mb-2 text-blue-600">5-DAY FORECAST</h2>
      <div className="flex overflow-x-auto gap-4 md:justify-between">
        {forecast.map((item, idx) => (
          <div key={idx} className="p-4 border rounded text-center w-48 flex-shrink-0 bg-gray-50">
            <h3 className="font-semibold text-md mb-1">
              {new Date(item.dt_txt).toLocaleDateString()}
            </h3>
            <img 
              src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
              alt="weather icon" 
              className="mx-auto"
            />
            <p className="text-lg font-medium">{item.main.temp}°C</p>
            <p className="text-sm text-gray-600 capitalize">{item.weather[0].description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function Home({ location, setLocation, fetchWeatherFromInput, fetchLocationWeather, error, weather, youtubeVideos }) {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate('/about')}
        style={{ marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px", backgroundColor: "purple", color: "#fff" }}
      >
        About PM Accelerator
      </button>

      <h1>🌍 Weather App - by Stephen Raju Mathew</h1>

      <input
        className="block mb-2 w-full max-w-xs p-2 border rounded"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter city, zip, or landmark"
      />

      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        <button style={{ marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px", backgroundColor: "blue", color: "#fff" }} onClick={fetchWeatherFromInput}>
          Get Weather
        </button>
        <button style={{ marginLeft: "1rem", marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px", backgroundColor: "red", color: "#fff" }} onClick={fetchLocationWeather}>
          Use My Location
        </button>
        <button style={{ marginLeft: "1rem", marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px", backgroundColor: "orange", color: "#fff" }} onClick={() => navigate('/createpage')}>
          Create Records
        </button>
        <button style={{ marginLeft: "1rem", marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px", backgroundColor: "pink", color: "#fff" }} onClick={() => navigate('/readpage')}>
          View Records
        </button>
        <button
          style={{ marginLeft: "1rem", marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px", backgroundColor: "gray", color: "#fff" }}
          onClick={() => window.location.href = 'http://localhost:5000/export-json'}
        >
          Download records as JSON
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {weather && <WeatherCard current={weather.current} forecast={weather.forecast} />}

      <h2 className="text-lg font-bold mt-6 mb-2 text-blue-500">Top 3 YouTube Videos about {location}</h2>
      <div className="flex justify-start space-x-4 overflow-x-auto">
        {youtubeVideos.map((video) => (
          <div key={video.id.videoId} className="p-4 border rounded text-center w-48 flex-shrink-0">
            <h3 className="font-semibold text-lg">{video.snippet.title}</h3>
            <img 
              src={video.snippet.thumbnails.high.url} 
              alt={video.snippet.title} 
              className="mx-auto"
            />
            <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">Watch Video</a>
          </div>
        ))}
      </div>
    </>
  );
}

export default function WeatherApp() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState([]);

  const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      () => {
        console.warn("Geolocation not permitted.");
      }
    );
  }, []);

  useEffect(() => {
    if (coords) {
      axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lon}&localityLanguage=en`)
        .then(res => {
          const loc = res.data.city || res.data.locality || "";
          if (loc) {
            setLocation(loc);
            fetchWeatherByLocation(loc);
            fetchYoutubeVideos(loc);
          }
        })
        .catch(() => setError("Could not determine your city from coordinates."));
    }
  }, [coords]);

  const fetchYoutubeVideos = (query) => {
    axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: "snippet",
        maxResults: 3,
        q: `${query} weather`,
        key: YOUTUBE_API_KEY
      }
    })
      .then((res) => setYoutubeVideos(res.data.items))
      .catch(() => {
        setError("Could not fetch YouTube videos.");
        setYoutubeVideos([]);
      });
  };

  const fetchWeatherByLocation = (loc) => {
    axios.get(`http://localhost:5000/weather?location=${encodeURIComponent(loc)}`)
      .then(res => {
        setWeather(res.data);
        setError("");
      })
      .catch(() => {
        setError("Location not found or server error.");
        setWeather(null);
      });
  };

  const fetchWeatherFromInput = () => {
    if (location.trim()) {
      fetchWeatherByLocation(location.trim());
      fetchYoutubeVideos(location.trim());
    }
  };

  const fetchLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setError("Permission denied to access location.")
    );
  };

  return (
    <Router>
      <div style={{ textAlign: "center", padding: "2rem", fontFamily: "Arial" }}>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/readpage" element={<ReadPage />} />
          <Route path="/createpage" element={<CreatePage />} />
          <Route path="/update/:id" element={<UpdatePage />} />
          <Route path="/" element={
            <Home
              location={location}
              setLocation={setLocation}
              fetchWeatherFromInput={fetchWeatherFromInput}
              fetchLocationWeather={fetchLocationWeather}
              error={error}
              weather={weather}
              youtubeVideos={youtubeVideos}
            />
          } />
        </Routes>
      </div>
    </Router>
  );
}
