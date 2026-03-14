import { createContext, useReducer } from "react";

export const ExpensesContext = createContext({
  expenses: [],
  addExpense: (expenseData) => {},
  addExpenses: (expenses) => {},
  setExpenses: (expenses) => {},
  deleteExpense: (id) => {},
  updateExpense: (id, expenseData) => {},
  renameCategoryOnExpenses: (categoryId, newName) => {},
  reassignCategoryForExpenses: (fromCategoryId, targetCategory) => {},
});

function sortExpenses(expenses) {
  return [...expenses].sort((a, b) => b.date - a.date);
}

function expensesReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return sortExpenses([action.payload, ...state]);

    case "ADD_MANY":
      return sortExpenses([...action.payload, ...state]);

    case "SET":
      return sortExpenses(action.payload);

    case "UPDATE": {
      const updatableExpenseIndex = state.findIndex(
        (expense) => expense.id === action.payload.id,
      );

      if (updatableExpenseIndex === -1) {
        return state;
      }

      const updatableExpense = state[updatableExpenseIndex];
      const updatedItem = { ...updatableExpense, ...action.payload.data };

      const updatedExpenses = [...state];
      updatedExpenses[updatableExpenseIndex] = updatedItem;

      return sortExpenses(updatedExpenses);
    }

    case "DELETE":
      return state.filter((expense) => expense.id !== action.payload);

    case "RENAME_CATEGORY_ON_EXPENSES":
      return state.map((expense) =>
        expense.category_id === action.payload.categoryId
          ? { ...expense, category_name: action.payload.newName }
          : expense,
      );

    case "REASSIGN_CATEGORY_FOR_EXPENSES":
      return sortExpenses(
        state.map((expense) => {
          if (expense.category_id !== action.payload.fromCategoryId) {
            return expense;
          }

          if (!action.payload.targetCategory) {
            return {
              ...expense,
              category_id: null,
              category_name: null,
            };
          }

          return {
            ...expense,
            category_id: action.payload.targetCategory.id,
            category_name: action.payload.targetCategory.name,
          };
        }),
      );

    default:
      return state;
  }
}

function ExpensesContextProvider({ children }) {
  const [expensesState, dispatch] = useReducer(expensesReducer, []);

  function addExpense(expenseData) {
    dispatch({ type: "ADD", payload: expenseData });
  }

  function addExpenses(expenses) {
    dispatch({ type: "ADD_MANY", payload: expenses });
  }

  function setExpenses(expenses) {
    dispatch({ type: "SET", payload: expenses });
  }

  function deleteExpense(id) {
    dispatch({ type: "DELETE", payload: id });
  }

  function updateExpense(id, expenseData) {
    dispatch({ type: "UPDATE", payload: { id, data: expenseData } });
  }

  function renameCategoryOnExpenses(categoryId, newName) {
    dispatch({
      type: "RENAME_CATEGORY_ON_EXPENSES",
      payload: { categoryId, newName },
    });
  }

  function reassignCategoryForExpenses(fromCategoryId, targetCategory) {
    dispatch({
      type: "REASSIGN_CATEGORY_FOR_EXPENSES",
      payload: { fromCategoryId, targetCategory },
    });
  }

  const value = {
    expenses: expensesState,
    addExpense,
    addExpenses,
    setExpenses,
    deleteExpense,
    updateExpense,
    renameCategoryOnExpenses,
    reassignCategoryForExpenses,
  };

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export default ExpensesContextProvider;
