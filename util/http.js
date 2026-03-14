import { api } from "./api";
import { getFormattedDate, parseExpenseDate } from "./date";

function normalizeExpense(expense) {
  return {
    id: expense.id,
    description: expense.description,
    amount: Number(expense.amount),
    date: parseExpenseDate(expense.date),
    category_id: expense.category_id ?? null,
    category_name: expense.category_name ?? null,
    source: expense.source ?? "manual",
  };
}

function serializeExpense(expenseData) {
  return {
    description: expenseData.description,
    amount: Number(expenseData.amount),
    date: getFormattedDate(expenseData.date),
    category_id: expenseData.category_id ?? null,
  };
}

export async function fetchExpenses() {
  const response = await api.get("/expenses/");
  return response.data.map(normalizeExpense);
}

export async function storeExpense(expenseData) {
  const response = await api.post("/expenses/", serializeExpense(expenseData));
  return normalizeExpense(response.data);
}

export async function updateExpense(id, expenseData) {
  const response = await api.put(
    `/expenses/${id}`,
    serializeExpense(expenseData),
  );
  return normalizeExpense(response.data);
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}
