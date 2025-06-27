import { Paper, Typography, Button, Box, CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type CurrentWeather } from './WeatherForecast';

interface PlantingSuggestionsProps {
  weather: CurrentWeather;
  suggestions: string;
  loading: boolean;
  onGetSuggestions: () => void;
}
const PlantingSuggestions = ({ weather, suggestions, loading, onGetSuggestions }: PlantingSuggestionsProps) => {
  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        AI Planting Suggestions for {weather.city}
      </Typography>
      <Box sx={{ my: 2 }}>
        <Button variant="contained" onClick={onGetSuggestions} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : `Get Ideas for ${weather.temp}°C & ${weather.condition}`}
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
        {suggestions && (<ReactMarkdown remarkPlugins={[remarkGfm]}>{suggestions}</ReactMarkdown>)}
      </Box>
    </Paper>
  );
};
export default PlantingSuggestions;