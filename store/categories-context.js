import { createContext, useReducer } from "react";

export const CategoriesContext = createContext({
  categories: [],
  setCategories: (categories) => {},
  addCategory: (category) => {},
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

  const value = {
    categories: categoriesState,
    setCategories,
    addCategory,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export default CategoriesContextProvider;
