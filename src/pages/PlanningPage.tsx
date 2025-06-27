import { Typography, Box } from '@mui/material';
import ProductionCalendar from '../components/ProductionCalendar';

const PlanningPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Production Planning Calendar
      </Typography>
      <Typography paragraph>
        Click on a date to add a new task. All scheduled events are shared in real-time with your team.
      </Typography>
      
      <ProductionCalendar />
    </Box>
  );
};

export default PlanningPage;