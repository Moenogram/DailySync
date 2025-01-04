// src/components/DebtManagementModule.jsx

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Progress, Alert, Calendar } from '@/components/ui';
import { Medal, TrendingDown, Brain, Heart, Trash2, Edit2 } from 'lucide-react';
import Modal from '@/components/Modal'; // Annahme: Du hast ein Modal-Komponente
import { v4 as uuidv4 } from 'uuid';

const DebtManagementModule = () => {
  const [selectedMethod, setSelectedMethod] = useState('snowball');
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [stressLevel, setStressLevel] = useState(0);
  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showEditDebtModal, setShowEditDebtModal] = useState(false);
  const [currentDebt, setCurrentDebt] = useState(null);

  useEffect(() => {
    // Lade Schulden aus LocalStorage oder Initialdaten
    const savedDebts = JSON.parse(localStorage.getItem('paige_debts')) || [
      {
        id: uuidv4(),
        name: "Klarna",
        amount: 156.66,
        monthlyPayment: 156.66,
        interestRate: 0,
        type: "small"
      },
      {
        id: uuidv4(),
        name: "Justiz",
        amount: 2249,
        monthlyPayment: 50,
        interestRate: 0,
        type: "small"
      },
      {
        id: uuidv4(),
        name: "ING Kredit",
        amount: 8000,
        monthlyPayment: 191.34,
        interestRate: 7.17,
        type: "large"
      },
      {
        id: uuidv4(),
        name: "KfW Studienkredit",
        amount: 12328.03,
        monthlyPayment: 162.44,
        interestRate: 7.70,
        type: "large"
      }
    ];
    setDebts(savedDebts);

    const savedPayments = JSON.parse(localStorage.getItem('paige_payments')) || [];
    setPayments(savedPayments);
  }, []);

  useEffect(() => {
    // Speichere Schulden und Zahlungen in LocalStorage
    localStorage.setItem('paige_debts', JSON.stringify(debts));
    localStorage.setItem('paige_payments', JSON.stringify(payments));
  }, [debts, payments]);

  // Berechnungsfunktionen
  const calculateDebtSnowball = () => {
    const sortedDebts = [...debts].sort((a, b) => a.amount - b.amount);
    let remainingIncome = getRemainingIncome();
    let debtProgress = sortedDebts.map(debt => ({ ...debt, paid: 0 }));

    sortedDebts.forEach(debt => {
      if (remainingIncome >= debt.monthlyPayment) {
        debtProgress = debtProgress.map(d => {
          if (d.id === debt.id) {
            return { ...d, paid: d.amount };
          }
          return d;
        });
        remainingIncome -= debt.monthlyPayment;
      } else {
        debtProgress = debtProgress.map(d => {
          if (d.id === debt.id) {
            return { ...d, paid: remainingIncome };
          }
          return d;
        });
        remainingIncome = 0;
      }
    });

    return debtProgress;
  };

  const calculateDebtAvalanche = () => {
    const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    let remainingIncome = getRemainingIncome();
    let debtProgress = sortedDebts.map(debt => ({ ...debt, paid: 0 }));

    sortedDebts.forEach(debt => {
      if (remaining_income >= debt.monthlyPayment) {
        debtProgress = debtProgress.map(d => {
          if (d.id === debt.id) {
            return { ...d, paid: d.amount };
          }
          return d;
        });
        remaining_income -= debt.monthlyPayment;
      } else {
        debtProgress = debtProgress.map(d => {
          if (d.id === debt.id) {
            return { ...d, paid: remaining_income };
          }
          return d;
        });
        remaining_income = 0;
      }
    });

    return debtProgress;
  };

  const getRemainingIncome = () => {
    // Beispiel: Gesamteinkommen minus monatliche Ausgaben außer Schuldenzahlungen
    const totalIncome = 2000; // Dies sollte dynamisch sein oder aus den App-Einstellungen kommen
    const totalExpenses = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0) + 500; // 500 für andere Ausgaben
    return totalIncome - totalExpenses;
  };

  // Handler-Funktionen
  const handleMethodChange = (method) => {
    setSelectedMethod(method);
  };

  const handleAddDebt = (debt) => {
    setDebts([...debts, { ...debt, id: uuidv4() }]);
  };

  const handleEditDebt = (updatedDebt) => {
    setDebts(debts.map(debt => debt.id === updatedDebt.id ? updatedDebt : debt));
  };

  const handleDeleteDebt = (id) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const handleAddPayment = (payment) => {
    setPayments([...payments, payment]);
  };

  // Visualisierungsdaten
  const debtProgress = selectedMethod === 'snowball' ? calculateDebtSnowball() : calculateDebtAvalanche();

  const chartData = debtProgress.map(debt => ({
    name: debt.name,
    Paid: debt.paid,
    Remaining: debt.amount - debt.paid
  }));

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header mit Stress-Monitor */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Schuldenfreiheit</h1>
            <p className="text-sm opacity-80">Wissenschaftlich fundierter Ansatz</p>
          </div>
          <button 
            onClick={() => setShowBreathingExercise(true)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            aria-label="Atemübung starten"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>

        {/* Stress-Level Indikator */}
        <div className="mt-4">
          <p className="text-sm mb-2">Aktuelles Stress-Level</p>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stressLevel}%` }}
              aria-valuenow={stressLevel}
              aria-valuemin="0"
              aria-valuemax="100"
              role="progressbar"
            ></div>
          </div>
        </div>
      </div>

      {/* Methoden-Auswahl */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={() => handleMethodChange('snowball')}
          className={`p-4 rounded-xl border ${
            selectedMethod === 'snowball' 
              ? 'bg-indigo-50 border-indigo-500' 
              : 'border-gray-200'
          } flex flex-col items-center`}
          aria-pressed={selectedMethod === 'snowball'}
        >
          <h3 className="font-semibold mb-2">Snowball Methode</h3>
          <p className="text-sm text-gray-600">Psychologisch optimiert</p>
        </button>
        
        <button 
          onClick={() => handleMethodChange('avalanche')}
          className={`p-4 rounded-xl border ${
            selectedMethod === 'avalanche' 
              ? 'bg-indigo-50 border-indigo-500' 
              : 'border-gray-200'
          } flex flex-col items-center`}
          aria-pressed={selectedMethod === 'avalanche'}
        >
          <h3 className="font-semibold mb-2">Avalanche Methode</h3>
          <p className="text-sm text-gray-600">Mathematisch optimiert</p>
        </button>
      </div>

      {/* Schuldenübersicht */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Aktuelle Schulden</h2>
          <button 
            onClick={() => setShowAddDebtModal(true)}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
          >
            <TrendingDown className="w-4 h-4" />
            Neue Schuld
          </button>
        </div>
        <div className="space-y-4">
          {debts.length === 0 ? (
            <p className="text-center text-gray-500">Keine Schulden hinzugefügt.</p>
          ) : (
            debts.map(debt => (
              <div 
                key={debt.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition"
              >
                <div>
                  <h3 className="font-medium">{debt.name}</h3>
                  <p className="text-sm text-gray-600">
                    {debt.interestRate > 0 ? `${debt.interestRate}% Zinsen` : 'Zinsfrei'}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-semibold">{debt.amount.toFixed(2)}€</p>
                  <p className="text-sm text-gray-600">{debt.monthlyPayment}€/Monat</p>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => { setCurrentDebt(debt); setShowEditDebtModal(true); }}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label={`Schuld ${debt.name} bearbeiten`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDebt(debt.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Schuld ${debt.name} löschen`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fortschritts-Tracking */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Fortschritts-Visualisierung</h2>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500">Keine Daten zum Anzeigen.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Paid" stroke="#10b981" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Remaining" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Psychologische Unterstützung */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-semibold mb-4">Mentale Gesundheit</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            className="p-4 border rounded-lg text-left hover:bg-gray-50 flex flex-col items-start"
            onClick={() => setShowBreathingExercise(true)}
          >
            <Brain className="w-6 h-6 mb-2 text-indigo-600" />
            <h4 className="font-medium">Stress-Check</h4>
            <p className="text-sm text-gray-600">Tägliche Überprüfung</p>
          </button>
          
          <button 
            className="p-4 border rounded-lg text-left hover:bg-gray-50 flex flex-col items-start"
            onClick={() => setShowBreathingExercise(true)}
          >
            <Heart className="w-6 h-6 mb-2 text-red-600" />
            <h4 className="font-medium">Atemübung</h4>
            <p className="text-sm text-gray-600">Beruhigung & Fokus</p>
          </button>
        </div>
      </div>

      {/* Erfolgs-Journal */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-semibold mb-4">Erfolge & Fortschritte</h3>
        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment.id} className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Medal className="w-5 h-5 text-green-600" />
                <p className="font-medium">{payment.debtName} abbezahlt!</p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Du hast eine Zahlung von {payment.amount}€ an {payment.debtName} geleistet.
              </p>
            </div>
          ))}
          {payments.length === 0 && (
            <p className="text-center text-gray-500">Noch keine Erfolge dokumentiert.</p>
          )}
        </div>
      </div>

      {/* Atemübungs-Modal */}
      {showBreathingExercise && (
        <Modal onClose={() => setShowBreathingExercise(false)}>
          <div className="text-center">
            <div className="breathing-circle w-48 h-48 bg-indigo-500/50 rounded-full mx-auto flex items-center justify-center mb-8 animate-breathe">
              <span className="text-5xl text-white font-bold">8</span>
            </div>
            <p className="text-white text-xl mb-2">Einatmen</p>
            <p className="text-white/60 text-sm">Folge dem Rhythmus</p>
            <button 
              onClick={() => setShowBreathingExercise(false)}
              className="mt-8 px-6 py-2 bg-white rounded-lg text-indigo-600"
            >
              Beenden
            </button>
          </div>
        </Modal>
      )}

      {/* Add Debt Modal */}
      {showAddDebtModal && (
        <Modal onClose={() => setShowAddDebtModal(false)}>
          <DebtForm 
            onSubmit={handleAddDebt} 
            onClose={() => setShowAddDebtModal(false)} 
          />
        </Modal>
      )}

      {/* Edit Debt Modal */}
      {showEditDebtModal && currentDebt && (
        <Modal onClose={() => setShowEditDebtModal(false)}>
          <DebtForm 
            debt={currentDebt}
            onSubmit={handleEditDebt} 
            onClose={() => setShowEditDebtModal(false)} 
          />
        </Modal>
      )}
    </div>
  );
};

// DebtForm-Komponente für das Hinzufügen/Bearbeiten von Schulden
const DebtForm = ({ debt = {}, onSubmit, onClose }) => {
  const [name, setName] = useState(debt.name || '');
  const [amount, setAmount] = useState(debt.amount || '');
  const [monthlyPayment, setMonthlyPayment] = useState(debt.monthlyPayment || '');
  const [interestRate, setInterestRate] = useState(debt.interestRate || '');
  const [type, setType] = useState(debt.type || 'small');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount || !monthlyPayment) {
      alert('Bitte alle erforderlichen Felder ausfüllen.');
      return;
    }
    onSubmit({
      id: debt.id,
      name,
      amount: parseFloat(amount),
      monthlyPayment: parseFloat(monthlyPayment),
      interestRate: parseFloat(interestRate),
      type
    });
    onClose();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{debt.id ? 'Schuld bearbeiten' : 'Neue Schuld hinzufügen'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="debt-name" className="block text-sm font-medium text-gray-700">Name der Schuld</label>
          <input 
            type="text" 
            id="debt-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="mt-1 block w-full p-2 border rounded" 
            required 
          />
        </div>
        <div>
          <label htmlFor="debt-amount" className="block text-sm font-medium text-gray-700">Gesamtbetrag (€)</label>
          <input 
            type="number" 
            id="debt-amount" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            className="mt-1 block w-full p-2 border rounded" 
            required 
          />
        </div>
        <div>
          <label htmlFor="debt-monthly" className="block text-sm font-medium text-gray-700">Monatliche Zahlung (€)</label>
          <input 
            type="number" 
            id="debt-monthly" 
            value={monthlyPayment} 
            onChange={(e) => setMonthlyPayment(e.target.value)} 
            className="mt-1 block w-full p-2 border rounded" 
            required 
          />
        </div>
        <div>
          <label htmlFor="debt-interest" className="block text-sm font-medium text-gray-700">Zinssatz (%)</label>
          <input 
            type="number" 
            id="debt-interest" 
            value={interestRate} 
            onChange={(e) => setInterestRate(e.target.value)} 
            className="mt-1 block w-full p-2 border rounded" 
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="debt-type" className="block text-sm font-medium text-gray-700">Typ</label>
          <select 
            id="debt-type" 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            className="mt-1 block w-full p-2 border rounded"
          >
            <option value="small">Klein</option>
            <option value="large">Groß</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Abbrechen
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
          >
            {debt.id ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DebtManagementModule;
