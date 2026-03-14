import { createContext, useReducer } from "react";

export const CategoriesContext = createContext({
  categories: [],
  setCategories: (categories) => {},
  addCategory: (category) => {},
  addCategories: (categories) => {},
  updateCategory: (id, categoryData) => {},
  deleteCategory: (id) => {},
});

function sortCategories(categories) {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

function categoriesReducer(state, action) {
  switch (action.type) {
    case "SET":
      return sortCategories(action.payload);

    case "ADD":
      return sortCategories([...state, action.payload]);

    case "ADD_MANY": {
      const merged = [...state];

      for (const incomingCategory of action.payload) {
        const exists = merged.some(
          (category) => category.id === incomingCategory.id,
        );
        if (!exists) {
          merged.push(incomingCategory);
        }
      }

      return sortCategories(merged);
    }

    case "UPDATE": {
      const updatedCategories = state.map((category) =>
        category.id === action.payload.id
          ? { ...category, ...action.payload.data }
          : category,
      );

      return sortCategories(updatedCategories);
    }

    case "DELETE":
      return state.filter((category) => category.id !== action.payload);

    default:
      return state;
  }
}

function CategoriesContextProvider({ children }) {
  const [categoriesState, dispatch] = useReducer(categoriesReducer, []);

  function setCategories(categories) {
    dispatch({ type: "SET", payload: categories });
  }

  function addCategory(category) {
    dispatch({ type: "ADD", payload: category });
  }

  function addCategories(categories) {
    dispatch({ type: "ADD_MANY", payload: categories });
  }

  function updateCategory(id, categoryData) {
    dispatch({ type: "UPDATE", payload: { id, data: categoryData } });
  }

  function deleteCategory(id) {
    dispatch({ type: "DELETE", payload: id });
  }

  const value = {
    categories: categoriesState,
    setCategories,
    addCategory,
    addCategories,
    updateCategory,
    deleteCategory,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export default CategoriesContextProvider;
