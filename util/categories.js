import { api } from "./api";

export async function fetchCategories() {
  const response = await api.get("/categories/");
  return response.data;
}
