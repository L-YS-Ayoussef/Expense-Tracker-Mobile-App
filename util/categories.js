import { api } from "./api";

export async function fetchCategories() {
  const response = await api.get("/categories/");
  return response.data;
}

export async function renameCategory(id, name) {
  const response = await api.put(`/categories/${id}`, { name });
  return response.data;
}

export async function deleteCategory(id, replacementCategoryId = null) {
  const response = await api.delete(`/categories/${id}`, {
    data: { replacement_category_id: replacementCategoryId },
  });
  return response.data;
}
