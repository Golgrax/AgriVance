import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper, Stack } from '@mui/material';

const OWM_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

// We use two different API endpoints: one to get coordinates, one to get the forecast
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';

// NEW: Define a type for the data we will pass up to the parent component
export interface CurrentWeather {
  city: string;
  lat: number;
  lng: number;
  temp: number;
  condition: string;
  description: string;
}

interface WeatherForecastProps {
  onWeatherUpdate: (weather: CurrentWeather) => void;
}

const WeatherForecast = ({ onWeatherUpdate }: WeatherForecastProps) => {
  const [cityInput, setCityInput] = useState('Manila');
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeatherForCoords = async (lat: number, lng: number, cityName: string) => {
    try {
      const response = await axios.get(FORECAST_API_URL, {
        params: { lat, lon: lng, appid: OWM_API_KEY, units: 'metric' },
      });
      setForecast(response.data.list);
      
      const current = response.data.list[0];
      onWeatherUpdate({
        city: cityName,
        lat: lat,
        lng: lng,
        temp: Math.round(current.main.temp),
        condition: current.weather[0].main,
        description: current.weather[0].description,
      });
    } catch (err) {
      setError('Could not fetch weather forecast data.');
      console.error(err);
    }
  };

  const searchCity = async (location: string) => {
    setLoading(true);
    setError('');
    setForecast([]);
    try {
      const geoResponse = await axios.get(GEO_API_URL, {
        params: { q: location, limit: 1, appid: OWM_API_KEY },
      });

      if (geoResponse.data.length === 0) {
        throw new Error('City not found.');
      }
      const { lat, lon, name } = geoResponse.data[0];
      
      await fetchWeatherForCoords(lat, lon, name);
    } catch (err) {
      setError('City not found or API error. Please check the city name.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    searchCity(cityInput);
  }, []);

  const handleSearch = () => {
    if (cityInput) {
      searchCity(cityInput);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        24-Hour Weather Forecast
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Enter City Name"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </Stack>
      
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      
      {forecast.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', py: 2 }}>
          {forecast.slice(0, 8).map((item, index) => (
            <Box key={index} sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="subtitle2">
                {new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
              <img
                src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                alt={item.weather[0].description}
              />
              <Typography variant="h6">{Math.round(item.main.temp)}°C</Typography>
              <Typography variant="caption">{item.weather[0].main}</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default WeatherForecast;