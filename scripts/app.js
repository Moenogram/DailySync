/*************************************************************
 *  app.js – Bereinigte Version
 *************************************************************/

// Falls du Chart.js nutzen möchtest (CDN-Import):
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js';

/**
 * Globale Anwendungskonfiguration und -zustand
 */
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
  },
  // Für Tab-Steuerung etc.
  currentTab: 'dashboard'
};

/*************************************************************
 *  Initialisierung
 *************************************************************/

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadState();
  setupEventListeners();
  
  // Erste Render-Funktionen
  renderDashboard();
  renderFinance();
  renderTasks();
  renderEmergencyContacts();
  renderCopingStrategies();
  renderProgressChart();
  generateRecommendations();
  renderMood(); // Zeigt ggf. die aktuelle Stimmung an
  
  // Eventuelle Gesture-Handler
  setupGestureHandlers();
  
  // Periodische Resets / Checks
  startPeriodicUpdates();
  
  // Risiko-Erkennung (z. B. Stimmung)
  detectRiskPatterns();
}

/*************************************************************
 *  State Management
 *************************************************************/

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

/*************************************************************
 *  Datum / Dashboard
 *************************************************************/

function updateDate() {
  const currentDateElement = document.getElementById('current-date');
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateElement.textContent = today.toLocaleDateString('de-DE', options);
}

function renderDashboard() {
  updateDate();
  document.getElementById('daily-budget').textContent = `${appState.user.dailyBudget}€`;
  
  const remaining = appState.user.dailyBudget - appState.user.spent;
  document.getElementById('remaining-budget').textContent = `Verbleibend: ${remaining}€`;
  
  document.getElementById('energy-level').textContent = `${appState.user.energyLevel}%`;
  document.getElementById('trigger-free-days').textContent = `${appState.user.triggerFreeDays} Tage`;
}

/*************************************************************
 *  Finanzverwaltung
 *************************************************************/

function renderFinance() {
  const financeBudget = document.getElementById('finance-budget');
  const financeSpent = document.getElementById('finance-spent');
  const financeProgress = document.getElementById('finance-progress');

  if (!financeBudget || !financeSpent || !financeProgress) return;

  financeBudget.textContent = `${appState.user.dailyBudget}€`;
  financeSpent.textContent = `${appState.user.spent}€`;

  const progressPercent = appState.user.dailyBudget > 0
    ? (appState.user.spent / appState.user.dailyBudget) * 100
    : 0;
  financeProgress.style.width = `${progressPercent}%`;
}

/*************************************************************
 *  Aufgaben / Morgenroutine
 *************************************************************/

function renderTasks() {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;

  taskList.innerHTML = '';
  appState.user.triggers.forEach((task, index) => {
    // Beispiel: Jedes "task" könnte ein Objekt sein, z. B. { text, completed }
    const li = document.createElement('li');
    li.className = 'flex items-center bg-surface p-3 rounded shadow hover:shadow-md transition';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed || false;
    checkbox.className = 'mr-2';
    checkbox.addEventListener('change', () => toggleTask(index));
    
    const span = document.createElement('span');
    span.textContent = task.text || 'Unnamed Task';
    if (task.completed) {
      span.classList.add('line-through', 'text-text-secondary');
    }
    
    li.appendChild(checkbox);
    li.appendChild(span);
    taskList.appendChild(li);
  });
}

function toggleTask(index) {
  appState.user.triggers[index].completed = !appState.user.triggers[index].completed;
  saveState();
  renderTasks();
}

/*************************************************************
 *  Stimmungs-Tracking / Mood
 *************************************************************/

function renderMood() {
  const moodElement = document.getElementById('current-mood');
  if (moodElement && appState.user.currentMood !== null) {
    moodElement.textContent = `${appState.user.currentMood}/10`;
  }
}

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

/*************************************************************
 *  Empfehlungen / Recommendations
 *************************************************************/

function generateRecommendations() {
  const recentMoods = appState.user.moodHistory.slice(-7);
  if (recentMoods.length === 0) return;

  const averageMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
  const recommendations = [];

  // Beispiel: Wenn Mood < 5, Entspannungsübungen empfehlen
  if (averageMood < 5) {
    recommendations.push('Deine Stimmung liegt zurzeit niedrig. Versuche Atemübungen oder Meditation!');
  }

  // Weitere Bedingungen / Empfehlungen hinzufügen
  displayRecommendations(recommendations);
}

function displayRecommendations(recommendations) {
  const recommendationsContainer = document.getElementById('recommendations-container');
  if (!recommendationsContainer) return;

  recommendationsContainer.innerHTML = '';
  recommendations.forEach(rec => {
    const p = document.createElement('p');
    p.className = 'p-2 bg-warning border-l-4 border-warning';
    p.textContent = rec;
    recommendationsContainer.appendChild(p);
  });
}

/*************************************************************
 *  Krisenintervention / Notfall
 *************************************************************/

function startBreathingExercise() {
  const breathingAnimation = document.getElementById('breathing-animation');
  if (!breathingAnimation) return;
  
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
        const modal = document.getElementById('breathing-modal');
        if (modal) modal.classList.add('hidden');
      }, 2000);
    }
  }
  nextPhase();
}

function triggerEmergencyPlan() {
  // Beispiel: Informiere Kontakte, ggf. API-Call
  appState.user.emergencyContacts.forEach(contact => {
    console.log(`Notfallnachricht an ${contact.name} (Kontakt: ${contact.contact})`);
  });
  saveState();
  alert('Notfallplan aktiviert. Deine Vertrauenspersonen wurden benachrichtigt.');
}

/*************************************************************
 *  Früherkennung / Risk Patterns
 *************************************************************/

function detectRiskPatterns() {
  const moodEntries = appState.user.moodHistory;
  if (moodEntries.length < 7) return; // Mindestens 7 Tage Daten

  const recentMoods = moodEntries.slice(-7);
  const averageMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;

  if (averageMood < 3) {
    triggerEarlyWarning();
  }
}

function triggerEarlyWarning() {
  const warningModal = document.getElementById('warning-modal');
  if (!warningModal) return;
  
  warningModal.classList.remove('hidden');

  const closeWarningModal = document.getElementById('close-warning-modal');
  if (closeWarningModal) {
    closeWarningModal.addEventListener('click', () => {
      warningModal.classList.add('hidden');
    });
  }
}

/*************************************************************
 *  Notfallkontakte
 *************************************************************/

function renderEmergencyContacts() {
  const contactsList = document.getElementById('emergency-contacts-list');
  if (!contactsList) return;

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

/*************************************************************
 *  Coping-Strategien (Platzhalter)
 *************************************************************/

function renderCopingStrategies() {
  // Noch nicht implementiert
  // Bsp.: Liste von Strategien, UI etc.
}

/*************************************************************
 *  Chart.js Beispiel (Mood-Verlauf)
 *************************************************************/

function renderProgressChart() {
  const chartCanvas = document.getElementById('progress-chart');
  if (!chartCanvas) return;

  const ctx = chartCanvas.getContext('2d');
  const labels = appState.user.moodHistory.map(entry => entry.date);
  const data = appState.user.moodHistory.map(entry => entry.mood);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Stimmung',
        data,
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

/*************************************************************
 *  Datenaustausch (Export / Delete)
 *************************************************************/

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

function deleteAllData() {
  if (confirm('Bist du sicher, dass du alle deine Daten löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    localStorage.removeItem('dailySyncState');
    location.reload();
  }
}

/*************************************************************
 *  Tab-Navigation
 *************************************************************/

function switchTab(tabName) {
  appState.currentTab = tabName;
  saveState();
  
  // Alle Sections im Hauptbereich ausblenden
  document.querySelectorAll('main > section').forEach(section => section.classList.add('hidden'));
  
  // Die ausgewählte Section einblenden
  const activeSection = document.getElementById(tabName);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  }
}

/*************************************************************
 *  Event Listener Setup
 *************************************************************/

function setupEventListeners() {
  // NOTFALL- / ATEMÜBUNG
  const emergencyButton = document.getElementById('emergency-button');
  const breathingModal = document.getElementById('breathing-modal');
  const closeBreathingModal = document.getElementById('close-breathing-modal');

  if (emergencyButton && breathingModal) {
    emergencyButton.addEventListener('click', () => {
      breathingModal.classList.remove('hidden');
      startBreathingExercise();
      triggerEmergencyPlan();
    });
  }
  if (closeBreathingModal) {
    closeBreathingModal.addEventListener('click', () => {
      breathingModal.classList.add('hidden');
    });
  }

  // TAB-BUTTONS
  const tabDashboard = document.getElementById('tab-dashboard');
  const tabMorningRoutine = document.getElementById('tab-morning-routine');
  const tabFinance = document.getElementById('tab-finance');
  const tabMoodTracking = document.getElementById('tab-mood-tracking');
  const tabEmergencyContacts = document.getElementById('tab-emergency-contacts');

  tabDashboard?.addEventListener('click', () => switchTab('dashboard'));
  tabMorningRoutine?.addEventListener('click', () => switchTab('morning-routine'));
  tabFinance?.addEventListener('click', () => switchTab('finance'));
  tabMoodTracking?.addEventListener('click', () => switchTab('mood-tracking'));
  tabEmergencyContacts?.addEventListener('click', () => switchTab('emergency-contacts'));

  // AUSGABEN-FORM
  const expenseForm = document.getElementById('expense-form');
  if (expenseForm) {
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amountEl = document.getElementById('expense-amount');
      const amount = parseFloat(amountEl.value);
      if (!isNaN(amount) && amount > 0) {
        appState.user.spent += amount;
        saveState();
        renderFinance();
        expenseForm.reset();
      }
    });
  }

  // MOOD TRACKING
  const moodInput = document.getElementById('mood-input');
  const currentMood = document.getElementById('current-mood');
  const submitMood = document.getElementById('submit-mood');

  if (moodInput && currentMood && submitMood) {
    moodInput.addEventListener('input', () => {
      currentMood.textContent = `${moodInput.value}/10`;
    });
    submitMood.addEventListener('click', () => {
      const moodValue = parseInt(moodInput.value, 10);
      if (!isNaN(moodValue)) {
        logMood(moodValue);
      }
    });
  }

  // EMERGENCY CONTACTS FORM
  const emergencyContactsForm = document.getElementById('emergency-contacts-form');
  if (emergencyContactsForm) {
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
  }

  // DATA MANAGEMENT
  const exportButton = document.getElementById('export-data');
  const deleteButton = document.getElementById('delete-data');
  if (exportButton) exportButton.addEventListener('click', exportData);
  if (deleteButton) deleteButton.addEventListener('click', deleteAllData);
}

/*************************************************************
 *  Gesten (Pull-to-Refresh, etc.)
 *************************************************************/

function setupGestureHandlers() {
  const main = document.querySelector('main');
  if (!main) return;

  let touchStartY = null;
  main.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  });

  main.addEventListener('touchmove', (e) => {
    if (!touchStartY) return;
    const touchEndY = e.touches[0].clientY;
    const diff = touchStartY - touchEndY;

    if (diff < -50) {
      // Pull to refresh
      refreshApp();
    }
    // diff > 50 => Scroll down action (optional)
  });
}

function refreshApp() {
  // Beispielhafte Implementierung: Neuladen der Seite
  location.reload();
}

/*************************************************************
 *  Periodische Updates (tägliche Resets etc.)
 *************************************************************/

function startPeriodicUpdates() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const timeUntilMidnight = nextMidnight - now;

  setTimeout(() => {
    dailyReset();
    setInterval(dailyReset, 24 * 60 * 60 * 1000);
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

/*************************************************************
 *  Ende
 *************************************************************/
