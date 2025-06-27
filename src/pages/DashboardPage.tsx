import { useState } from 'react';
import { Typography, Paper, Stack, Box } from '@mui/material';
import WeatherForecast, { type CurrentWeather } from '../components/WeatherForecast';
import FarmMap from '../components/FarmMap';
import PlantingSuggestions from '../components/PlantingSuggestions';
import { getPlantingSuggestion } from '../services/aiService';

const DashboardPage = () => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [suggestions, setSuggestions] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleWeatherUpdate = (weather: CurrentWeather) => {
    setCurrentWeather(weather);
    setSuggestions("");
  };
  
  const handleGetPlantingSuggestions = async () => {
    if (!currentWeather) return;
    setLoadingSuggestions(true);
    setSuggestions("");
    try {
      const result = await getPlantingSuggestion(
        currentWeather.city,
        currentWeather.temp,
        currentWeather.condition
      );
      setSuggestions(result);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      setSuggestions("Sorry, I couldn't generate suggestions at this time.");
    }
    setLoadingSuggestions(false);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          AgriVance Dashboard
        </Typography>
      </Box>
      <Box>
        <WeatherForecast onWeatherUpdate={handleWeatherUpdate} />
      </Box>
      
      {currentWeather && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ width: '100%', md: '60%' }}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Farm Location: {currentWeather.city}
              </Typography>
              <FarmMap lat={currentWeather.lat} lng={currentWeather.lng} />
            </Paper>
          </Box>
          <Box sx={{ width: '100%', md: '40%' }}>
            <PlantingSuggestions
              weather={currentWeather}
              suggestions={suggestions}
              loading={loadingSuggestions}
              onGetSuggestions={handleGetPlantingSuggestions}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

export default DashboardPage;