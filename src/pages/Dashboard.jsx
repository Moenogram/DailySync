import React from 'react';
import { DailyOverview, BudgetTracker, MoodTracker } from '../components';

const Dashboard = ({ state, setState }) => {
  return (
    <div className="space-y-6">
      <DailyOverview
        budget={state.user.dailyBudget}
        energy={state.user.energyLevel}
        triggerFreeDays={state.user.triggerFreeDays}
      />
      <BudgetTracker
        budget={state.user.dailyBudget}
        spent={state.user.spent}
      />
      <MoodTracker
        mood={state.user.currentMood}
        setMood={(mood) => {
          setState({
            ...state,
            user: { ...state.user, currentMood: mood }
          });
        }}
      />
    </div>
  );
};
