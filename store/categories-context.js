import { createContext, useReducer } from "react";

export const CategoriesContext = createContext({
  categories: [],
  setCategories: (categories) => {},
  addCategory: (category) => {},
  addCategories: (categories) => {},
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

  const value = {
    categories: categoriesState,
    setCategories,
    addCategory,
    addCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export default CategoriesContextProvider;
