// scripts/app.js

// Import von Chart.js über CDN
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js';

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
    copingStrategies: []
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
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadState();
  setupEventListeners();
  renderDashboard();
  renderFinance();
  renderTasks();
  renderEmergencyContacts();
  renderCopingStrategies();
  renderProgressChart();
  generateRecommendations();
  setupGestureHandlers();
  startPeriodicUpdates();
  detectRiskPatterns();
}

function loadState() {
  const savedState = localStorage.getItem('dailySyncState');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      Object.assign(appState, parsed);
    } catch (e) {
      console.error('State konnte nicht geladen werden:', e);
    }
  }
}

function saveState() {
  localStorage.setItem('dailySyncState', JSON.stringify(appState));
}

// Update Date in Header
function updateDate() {
  const currentDateElement = document.getElementById('current-date');
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateElement.textContent = today.toLocaleDateString('de-DE', options);
}

// Render Dashboard Metrics
function renderDashboard() {
  updateDate();
  document.getElementById('daily-budget').textContent = `${appState.user.dailyBudget}€`;
  const remaining = appState.user.dailyBudget - appState.user.spent;
  document.getElementById('remaining-budget').textContent = `Verbleibend: ${remaining}€`;
  document.getElementById('energy-level').textContent = `${appState.user.energyLevel}%`;
  document.getElementById('trigger-free-days').textContent = `${appState.user.triggerFreeDays} Tage`;
}

// Render Finance
function renderFinance() {
  document.getElementById('finance-budget').textContent = `${appState.user.dailyBudget}€`;
  document.getElementById('finance-spent').textContent = `${appState.user.spent}€`;
  const progressPercent = appState.user.dailyBudget > 0 ? (appState.user.spent / appState.user.dailyBudget) * 100 : 0;
  document.getElementById('finance-progress').style.width = `${progressPercent}%`;
}

// Event Listener Setup
function setupEventListeners() {
  // Emergency Button
  const emergencyButton = document.getElementById('emergency-button');
  const breathingModal = document.getElementById('breathing-modal');
  const closeBreathingModal = document.getElementById('close-breathing-modal');

  emergencyButton.addEventListener('click', () => {
    breathingModal.classList.remove('hidden');
    startBreathingExercise();
    triggerEmergencyPlan();
  });

  closeBreathingModal.addEventListener('click', () => {
    breathingModal.classList.add('hidden');
  });

  // Tab Navigation
  const tabDashboard = document.getElementById('tab-dashboard');
  const tabMorningRoutine = document.getElementById('tab-morning-routine');
  const tabFinance = document.getElementById('tab-finance');
  const tabMoodTracking = document.getElementById('tab-mood-tracking');
  const tabEmergencyContacts = document.getElementById('tab-emergency-contacts');

  tabDashboard.addEventListener('click', () => switchTab('dashboard'));
  tabMorningRoutine.addEventListener('click', () => switchTab('morning-routine'));
  tabFinance.addEventListener('click', () => switchTab('finance'));
  tabMoodTracking.addEventListener('click', () => switchTab('mood-tracking'));
  tabEmergencyContacts.addEventListener('click', () => switchTab('emergency-contacts'));

  // Expense Form
  const expenseForm = document.getElementById('expense-form');
  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    if (!isNaN(amount) && amount > 0) {
      appState.user.spent += amount;
      saveState();
      renderFinance();
      expenseForm.reset();
    }
  });

  // Mood Tracking
  const moodInput = document.getElementById('mood-input');
  const currentMood = document.getElementById('current-mood');
  const submitMood = document.getElementById('submit-mood');

  moodInput.addEventListener('input', () => {
    currentMood.textContent = `${moodInput.value}/10`;
  });

  submitMood.addEventListener('click', () => {
    const moodValue = parseInt(moodInput.value, 10);
    logMood(moodValue);
  });

  // Emergency Contacts Form
  const emergencyContactsForm = document.getElementById('emergency-contacts-form');
  emergencyContactsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const relationship = document.getElementById('contact-relationship').value;
    const contact = document.getElementById('contact-number').value;

    const newContact = { name, relationship, contact, notifyAt: [] };
    appState.user.emergencyContacts.push(newContact);
    saveState();
    renderEmergencyContacts();
    emergencyContactsForm.reset();
  });

  // Data Management
  const exportButton = document.getElementById('export-data');
  const deleteButton = document.getElementById('delete-data');

  exportButton.addEventListener('click', exportData);
  deleteButton.addEventListener('click', deleteAllData);
}

// Switch Tab Function
function switchTab(tabName) {
  appState.currentTab = tabName;
  saveState();
  // Verstecke alle Sektionen
  document.querySelectorAll('main > section').forEach(section => section.classList.add('hidden'));
  // Zeige die ausgewählte Sektion
  document.getElementById(tabName).classList.remove('hidden');
}

// Render Tasks in Morgenroutine
function renderTasks() {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';
  appState.user.triggers.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'flex items-center bg-surface p-3 rounded shadow hover:shadow-md transition';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.className = 'mr-2';
    checkbox.addEventListener('change', () => toggleTask(index));
    
    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.completed) {
      span.classList.add('line-through', 'text-text-secondary');
    }
    
    li.appendChild(checkbox);
    li.appendChild(span);
    taskList.appendChild(li);
  });
}

// Toggle Task Status
function toggleTask(index) {
  appState.user.triggers[index].completed = !appState.user.triggers[index].completed;
  saveState();
  renderTasks();
}

// Render Emergency Contacts
function renderEmergencyContacts() {
  const contactsList = document.getElementById('emergency-contacts-list');
  contactsList.innerHTML = '';
  appState.user.emergencyContacts.forEach((contact, index) => {
    const li = document.createElement('li');
    li.className = 'p-2 border-b flex justify-between items-center';
    li.textContent = `${contact.name} (${contact.relationship}): ${contact.contact}`;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Löschen';
    deleteBtn.className = 'text-danger';
    deleteBtn.addEventListener('click', () => removeEmergencyContact(index));
    
    li.appendChild(deleteBtn);
    contactsList.appendChild(li);
  });
}

function removeEmergencyContact(index) {
  appState.user.emergencyContacts.splice(index, 1);
  saveState();
  renderEmergencyContacts();
}

// Render Coping Strategies (Placeholder)
function renderCopingStrategies() {
  // Implementiere diese Funktion entsprechend den Anforderungen
}

// Render Progress Chart
function renderProgressChart() {
  const ctx = document.getElementById('progress-chart').getContext('2d');
  const labels = appState.user.moodHistory.map(entry => entry.date);
  const data = appState.user.moodHistory.map(entry => entry.mood);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Stimmung',
        data: data,
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });
}

// Log Mood
function logMood(mood) {
  const today = new Date().toLocaleDateString();
  const existingEntry = appState.user.moodHistory.find(entry => entry.date === today);
  if (existingEntry) {
    existingEntry.mood = mood;
  } else {
    appState.user.moodHistory.push({ date: today, mood });
  }
  appState.user.currentMood = mood;
  saveState();
  renderMood();
  detectRiskPatterns();
}

// Render Current Mood
function renderMood() {
  const moodElement = document.getElementById('current-mood');
  moodElement.textContent = `${appState.user.currentMood}/10`;
}

// Export Data
function exportData() {
  const dataStr = JSON.stringify(appState, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dailySync_data.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Delete All Data
function deleteAllData() {
  if (confirm('Bist du sicher, dass du alle deine Daten löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    localStorage.removeItem('dailySyncState');
    location.reload();
  }
}

// Breathing Exercise
function startBreathingExercise() {
  const breathingAnimation = document.getElementById('breathing-animation');
  let phase = 0;
  const phases = ['Einatmen', 'Anhalten', 'Ausatmen'];
  const timings = [8000, 5000, 7000]; // in Millisekunden

  function nextPhase() {
    if (phase < phases.length) {
      breathingAnimation.innerHTML = `<p class="text-center text-text-primary">${phases[phase]}</p>`;
      setTimeout(() => {
        phase++;
        nextPhase();
      }, timings[phase]);
    } else {
      breathingAnimation.innerHTML = `<p class="text-center text-text-primary">Übung beendet</p>`;
      setTimeout(() => {
        document.getElementById('breathing-modal').classList.add('hidden');
      }, 2000);
    }
  }

  nextPhase();
}

// Trigger Early Warning
function detectRiskPatterns() {
  const moodEntries = appState.user.moodHistory;
  if (moodEntries.length < 7) return; // Mindestens 7 Tage Daten

  const recentMoods = moodEntries.slice(-7);
  const averageMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;

  if (averageMood < 3) { // Schwellenwert für hohe Risikozonen
    triggerEarlyWarning();
  }
}

function triggerEarlyWarning() {
  const warningModal = document.getElementById('warning-modal');
  warningModal.classList.remove('hidden');

  const closeWarningModal = document.getElementById('close-warning-modal');
  closeWarningModal.addEventListener('click', () => {
    warningModal.classList.add('hidden');
  });
}

// Emergency Plan
function triggerEmergencyPlan() {
  appState.user.emergencyContacts.forEach(contact => {
    // Hier könntest du eine API integrieren, um SMS oder E-Mails zu senden
    console.log(`Notfallnachricht an ${contact.name}: Kontaktaufnahme erforderlich.`);
  });
  saveState();
  alert('Notfallplan aktiviert. Deine Vertrauenspersonen wurden benachrichtigt.');
}

// Recommendations
function generateRecommendations() {
  const recommendations = [];

  // Beispiel: Wenn der durchschnittliche Mood unter 5 liegt, empfehle Entspannungsübungen
  const recentMoods = appState.user.moodHistory.slice(-7);
  if (recentMoods.length === 0) return;
  const averageMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;

  if (averageMood < 5) {
    recommendations.push('Es scheint, dass deine Stimmung in letzter Zeit niedrig ist. Versuche einige Atemübungen oder Meditation.');
  }

  // Weitere Bedingungen und Empfehlungen hinzufügen

  displayRecommendations(recommendations);
}

function displayRecommendations(recommendations) {
  const recommendationsContainer = document.getElementById('recommendations-container');
  recommendationsContainer.innerHTML = '';
  recommendations.forEach(rec => {
    const p = document.createElement('p');
    p.className = 'p-2 bg-warning border-l-4 border-warning';
    p.textContent = rec;
    recommendationsContainer.appendChild(p);
  });
}

// Gesture Handlers (Pull-to-Refresh & Scroll Down)
function setupGestureHandlers() {
  const main = document.querySelector('main');
  let touchStart = null;

  main.addEventListener('touchstart', (e) => {
    touchStart = e.touches[0].clientY;
  });

  main.addEventListener('touchmove', (e) => {
    if (!touchStart) return;

    const touchEnd = e.touches[0].clientY;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      // Scroll down action (optional: load more content)
    } else if (diff < -50) {
      // Pull to refresh action
      refreshApp();
    }
  });
}

function refreshApp() {
  // Beispielhafte Implementierung: Neuladen der Seite
  location.reload();
}

// Periodic Updates (z.B. tägliche Resets)
function startPeriodicUpdates() {
  // Beispiel: Täglicher Reset um Mitternacht
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const timeUntilMidnight = nextMidnight - now;

  setTimeout(() => {
    dailyReset();
    setInterval(dailyReset, 24 * 60 * 60 * 1000); // Jeden Tag
  }, timeUntilMidnight);
}

function dailyReset() {
  appState.user.spent = 0;
  appState.user.triggerFreeDays += 1;
  saveState();
  renderDashboard();
  renderFinance();
  renderTasks();
}

// Export der aktuellen Daten als JSON
function exportData() {
  const dataStr = JSON.stringify(appState, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dailySync_data.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Löschen aller Daten
function deleteAllData() {
  if (confirm('Bist du sicher, dass du alle deine Daten löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    localStorage.removeItem('dailySyncState');
    location.reload();
  }
}

// Render Coping Strategies (Placeholder)
function renderCopingStrategies() {
  // Implementiere diese Funktion entsprechend den Anforderungen
}
// scripts/app.js (Fortsetzung)

// DOM Elements für Tabs
const tabDashboard = document.getElementById('tab-dashboard');
const tabMorningRoutine = document.getElementById('tab-morning-routine');
const tabFinance = document.getElementById('tab-finance');

// Event Listener für Tabs
tabDashboard.addEventListener('click', () => switchTab('dashboard'));
tabMorningRoutine.addEventListener('click', () => switchTab('morning-routine'));
tabFinance.addEventListener('click', () => switchTab('finance'));

// Funktion zum Wechseln der Tabs
function switchTab(tabName) {
  state.currentTab = tabName;
  saveState();
  // Verstecke alle Sektionen
  document.querySelectorAll('main > section').forEach(section => section.classList.add('hidden'));
  // Zeige die ausgewählte Sektion
  document.getElementById(tabName).classList.remove('hidden');
}
// scripts/app.js (Fortsetzung)

// DOM Elements für Tabs
const tabDashboard = document.getElementById('tab-dashboard');
const tabMorningRoutine = document.getElementById('tab-morning-routine');
const tabFinance = document.getElementById('tab-finance');

// Event Listener für Tabs
tabDashboard.addEventListener('click', () => switchTab('dashboard'));
tabMorningRoutine.addEventListener('click', () => switchTab('morning-routine'));
tabFinance.addEventListener('click', () => switchTab('finance'));

// Funktion zum Wechseln der Tabs
function switchTab(tabName) {
  state.currentTab = tabName;
  saveState();
  // Verstecke alle Sektionen
  document.querySelectorAll('main > section').forEach(section => section.classList.add('hidden'));
  // Zeige die ausgewählte Sektion
  document.getElementById(tabName).classList.remove('hidden');
}
// scripts/app.js (Fortsetzung)

// Render Tasks in Morgenroutine
function renderTasks() {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';
  state.tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-center bg-white p-3 rounded shadow hover:shadow-md transition';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.className = 'mr-2';
    checkbox.addEventListener('change', () => toggleTask(task.id));
    
    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.completed) {
      span.classList.add('line-through', 'text-gray-500');
    }
    
    li.appendChild(checkbox);
    li.appendChild(span);
    taskList.appendChild(li);
  });
}

// Initiales Rendern der Aufgaben
renderTasks();
// scripts/app.js (Fortsetzung)

// Render Finanzverwaltung
function renderFinance() {
  document.getElementById('finance-budget').textContent = `${state.budget}€`;
  document.getElementById('finance-spent').textContent = `${state.spent}€`;
  const progressPercent = state.budget > 0 ? (state.spent / state.budget) * 100 : 0;
  document.getElementById('finance-progress').style.width = `${progressPercent}%`;
}

// Aktualisiere die Dashboard- und Finanzansicht nach dem Laden
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  renderFinance();
});
// scripts/app.js (Fortsetzung)

// DOM Elements für Ausgaben
const expenseForm = document.getElementById('expense-form');
const expenseAmount = document.getElementById('expense-amount');

// Event Listener für Ausgabenform
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseFloat(expenseAmount.value);
  if (!isNaN(amount) && amount > 0) {
    state.spent += amount;
    saveState();
    renderFinance();
    expenseForm.reset();
  }
});
