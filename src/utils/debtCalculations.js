export const calculateDebtSnowball = (debts, remainingIncome) => {
  const sortedDebts = [...debts].sort((a, b) => a.amount - b.amount);
  let income = remainingIncome;
  let debtProgress = sortedDebts.map(debt => ({ ...debt, paid: 0 }));

  sortedDebts.forEach(debt => {
    if (income >= debt.monthlyPayment) {
      debtProgress = debtProgress.map(d => {
        if (d.id === debt.id) {
          return { ...d, paid: d.amount };
        }
        return d;
      });
      income -= debt.monthlyPayment;
    } else {
      debtProgress = debtProgress.map(d => {
        if (d.id === debt.id) {
          return { ...d, paid: income };
        }
        return d;
      });
      income = 0;
    }
  });

  return debtProgress;
};

export const calculateDebtAvalanche = (debts, remainingIncome) => {
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  let income = remainingIncome;
  let debtProgress = sortedDebts.map(debt => ({ ...debt, paid: 0 }));

  sortedDebts.forEach(debt => {
    if (income >= debt.monthlyPayment) {
      debtProgress = debtProgress.map(d => {
        if (d.id === debt.id) {
          return { ...d, paid: d.amount };
        }
        return d;
      });
      income -= debt.monthlyPayment;
    } else {
      debtProgress = debtProgress.map(d => {
        if (d.id === debt.id) {
          return { ...d, paid: income };
        }
        return d;
      });
      income = 0;
    }
  });

  return debtProgress;
};
