const appState = {
  user: {
    name: string,
    dailyBudget: number,
    spent: number,
    energyLevel: number,
    triggerFreeDays: number,
    currentMood: string,
    stats: {
      streaks: {
        triggerFree: number,
        budgetCompliance: number
      }
    },
    debts: DebtType[],
    payments: PaymentType[]
  },
  settings: {
    theme: 'light' | 'dark',
    notifications: boolean,
    emergencyMode: {
      enabled: boolean,
      level: number
    }
  }
}
