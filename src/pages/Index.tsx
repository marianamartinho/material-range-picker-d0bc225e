import React from 'react';
import CustomDateRangePicker from '../components/CustomDateRangePicker';

const Index = () => {
  const handleApply = (dateRange: [Date, Date]) => {
    console.log('Applied date range:', dateRange);
    // Here you can handle the applied date range
  };

  const handleReset = () => {
    console.log('Date range reset');
    // Here you can handle the reset action
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Custom Date Range Picker</h1>
          <p className="text-xl text-muted-foreground">
            Material Design DateRangePicker with 30-day limit and range preservation
          </p>
        </div>
        
        <CustomDateRangePicker 
          onApply={handleApply}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default Index;
