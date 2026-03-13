import axios from "axios";
import { getFormattedDate, parseExpenseDate } from "./date";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function normalizeExpense(expense) {
  return {
    id: expense.id,
    description: expense.description,
    amount: Number(expense.amount),
    date: parseExpenseDate(expense.date),
  };
}

function serializeExpense(expenseData) {
  return {
    description: expenseData.description,
    amount: Number(expenseData.amount),
    date: getFormattedDate(expenseData.date),
  };
}

export async function fetchExpenses() {
  const response = await api.get("/expenses");
  return response.data.map(normalizeExpense);
}

export async function storeExpense(expenseData) {
  const response = await api.post("/expenses", serializeExpense(expenseData));
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
