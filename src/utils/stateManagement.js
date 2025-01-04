const appState = {
  user: {
    name: 'Muhammet Şen',
    dailyBudget: 20,
    spent: 8,
    energyLevel: 87,
    triggerFreeDays: 5,
    currentMood: null,
    stats: {
      streaks: {
        triggerFree: 5,
        budgetCompliance: 3
      }
    },
    triggers: [],
    moodHistory: [],
    triggerHistory: [],
    emergencyContacts: [],
    copingStrategies: [],
    debts: [], // Neue Felder
    payments: []
  },
  settings: {
    theme: 'light',
    notifications: true,
    emergencyMode: {
      enabled: false,
      level: 1
    },
    personalSettings: {
      triggerThresholds: {},
      budgetPeriods: {},
      notificationPreferences: {},
      budget: 20
    }
  },
  currentTab: 'dashboard' // Aktueller Tab
};
