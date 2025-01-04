import React, { useState } from 'react';
import { Header, Navigation } from './components/shared';
import { Dashboard, DebtManagement, Calendar, Notes } from './pages';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [appState, setAppState] = useState({
    user: {
      name: '',
      dailyBudget: 20,
      energyLevel: 100,
      triggerFreeDays: 0
    },
    settings: {
      theme: 'light',
      notifications: true
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userState={appState.user} />
      <main className="container mx-auto p-4">
        {currentPage === 'dashboard' &&
          <Dashboard state={appState} setState={setAppState} />}
        {currentPage === 'debt' &&
          <DebtManagement state={appState} setState={setAppState} />}
        {currentPage === 'calendar' &&
          <Calendar state={appState} setState={setAppState} />}
        {currentPage === 'notes' &&
          <Notes state={appState} setState={setAppState} />}
      </main>
      <Navigation setCurrentPage={setCurrentPage} />
    </div>
  );
};
