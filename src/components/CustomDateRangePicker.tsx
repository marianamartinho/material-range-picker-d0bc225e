import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  Stack,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isWithinInterval,
  differenceInDays,
  subDays,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';

// Material Design theme matching the UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F55FD',
    },
    secondary: {
      main: '#757575',
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Open Sauce One", sans-serif',
    h6: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    body2: {
      fontSize: '1rem',
    },
  },
});

interface CustomDateRangePickerProps {
  onApply?: (dateRange: [Date, Date]) => void;
  onReset?: () => void;
}

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  onApply,
  onReset,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');

  const presetRanges = [
    { label: 'Last 7 days', value: '7', days: 7 },
    { label: 'Last 15 days', value: '15', days: 15 },
    { label: 'Last 30 days', value: '30', days: 30 },
  ];

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value) {
      const days = parseInt(value);
      const today = new Date();
      const startDate = subDays(today, days - 1);
      setSelectedRange([startDate, today]);
      setShowWarning(false);
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDateClick = (date: Date) => {
    if (!selectedRange[0] || (selectedRange[0] && selectedRange[1])) {
      // Start new selection
      setSelectedRange([date, null]);
      setShowWarning(false);
    } else {
      // Complete the range
      const start = selectedRange[0];
      const end = date;
      const orderedRange: [Date, Date] = start <= end ? [start, end] : [end, start];
      setSelectedRange(orderedRange);
      
      // Check if range exceeds 30 days
      const daysDifference = differenceInDays(orderedRange[1], orderedRange[0]);
      setShowWarning(daysDifference > 30);
    }
  };

  const handleApply = () => {
    if (selectedRange[0] && selectedRange[1]) {
      let rangeToApply = selectedRange;
      
      // If range exceeds 30 days, apply only the last 30 days
      if (differenceInDays(selectedRange[1], selectedRange[0]) > 30) {
        rangeToApply = [subDays(selectedRange[1], 30), selectedRange[1]];
      }
      
      onApply?.(rangeToApply);
    }
  };

  const handleReset = () => {
    setSelectedRange([null, null]);
    setShowWarning(false);
    setSelectedPreset('');
    onReset?.();
  };

  const isDateSelected = (date: Date) => {
    return selectedRange.some(d => d && isSameDay(d, date));
  };

  const isDateInRange = (date: Date) => {
    if (!selectedRange[0] || !selectedRange[1]) return false;
    return isWithinInterval(date, { start: selectedRange[0], end: selectedRange[1] });
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" color="textPrimary">
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Week days header */}
        <Box display="flex" mb={1}>
          {weekDays.map(day => (
            <Box flex={1} textAlign="center" py={1} key={day}>
              <Typography variant="body2" color="textSecondary" fontWeight={500}>
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar grid */}
        <Box>
          {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
            <Box display="flex" key={weekIndex}>
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isSelected = isDateSelected(day);
                const isInRange = isDateInRange(day);
                
                return (
                  <Box
                    flex={1}
                    key={weekIndex * 7 + dayIndex}
                    sx={{
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      backgroundColor: isInRange && !isSelected ? '#ECF1FC' : 'transparent',
                      cursor: isCurrentMonth ? 'pointer' : 'default',
                      '&:hover': isCurrentMonth ? {
                        backgroundColor: isInRange ? '#ECF1FC' : 'transparent',
                      } : {},
                    }}
                    onClick={() => isCurrentMonth && handleDateClick(day)}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? '#4F55FD' : 'transparent',
                        border: isSelected ? 'none' : 'transparent',
                        color: isSelected ? 'white' : isCurrentMonth ? 'black' : '#bdbdbd',
                        fontWeight: isSelected ? 600 : 400,
                        '&:hover': isCurrentMonth && !isSelected ? {
                          border: '1px solid #4F55FD',
                        } : {},
                      }}
                    >
                      {day.getDate()}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const isRangeSelected = selectedRange[0] && selectedRange[1];
  const daysDifference = isRangeSelected 
    ? differenceInDays(selectedRange[1]!, selectedRange[0]!)
    : 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Paper 
          elevation={0} 
          sx={{ 
            padding: '16px', 
            width: 470, 
            mx: 'auto',
            borderRadius: 3,
            border: '1px solid #e0e0e0',
          }}
        >
          <Stack spacing={3}>
            {renderCalendar()}
            
            {showWarning && (
              <Alert 
                severity="warning" 
                sx={{ 
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem',
                  }
                }}
              >
                <Typography variant="body2">
                  Selected range exceeds 30 days. Only the last 30 will be applied.
                </Typography>
              </Alert>
            )}
            
            <Divider sx={{ backgroundColor: '#F1F6FD', height: 1 }} />
            
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
            >
              {/* Period Selector */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1" sx={{ color: '#283952', fontSize: '1rem' }}>
                  Last
                </Typography>
                <Select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value as string)}
                  displayEmpty
                  sx={{
                    minWidth: 60,
                    height: 32,
                    fontSize: '1rem',
                    color: '#91A2BB',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#91A2BB',
                      borderRadius: '8px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#91A2BB',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#91A2BB',
                    },
                    '& .MuiSelect-select': {
                      color: '#91A2BB',
                      padding: '4px 8px',
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        zIndex: 1300,
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>--</em>
                  </MenuItem>
                  <MenuItem value="7">7</MenuItem>
                  <MenuItem value="15">15</MenuItem>
                  <MenuItem value="30">30</MenuItem>
                </Select>
                <Typography variant="body1" sx={{ color: '#283952', fontSize: '1rem' }}>
                  days
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="text"
                color="secondary"
                onClick={handleReset}
                sx={{ 
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  color: '#333333',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  }
                }}
              >
                Reset
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={handleApply}
                disabled={!isRangeSelected}
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 400,
                  px: 6,
                  py: 1.5,
                  borderRadius: '8px',
                  border: '2px solid rgba(79, 85, 253, 0.5)',
                  color: '#4F55FD',
                  backgroundColor: 'white',
                  '&:hover': {
                    border: '2px solid rgba(79, 85, 253, 0.7)',
                    backgroundColor: '#f8f7ff',
                  },
                  '&:disabled': {
                    border: '2px solid rgba(145, 162, 187, 0.5)',
                    backgroundColor: 'white',
                    color: '#91A2BB',
                  }
                }}
              >
                Apply
              </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default CustomDateRangePicker;