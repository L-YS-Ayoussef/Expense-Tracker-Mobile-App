import { useContext, useEffect, useState } from "react";

import AnalyticsDashboard from "../components/Analytics/AnalyticsDashboard";
import ErrorOverlay from "../components/UI/ErrorOverlay";
import LoadingOverlay from "../components/UI/LoadingOverlay";
import { ExpensesContext } from "../../store/expenses-context";
import { CategoriesContext } from "../../store/categories-context";
import { fetchExpenses } from "../../util/http";

function AnalyticsScreen() {
  const expensesCtx = useContext(ExpensesContext);
  const categoriesCtx = useContext(CategoriesContext);

  const [isFetching, setIsFetching] = useState(
    expensesCtx.expenses.length === 0,
  );
  const [error, setError] = useState();

  useEffect(() => {
    let isMounted = true;

    async function loadExpensesIfNeeded() {
      if (expensesCtx.expenses.length > 0) {
        if (isMounted) {
          setIsFetching(false);
        }
        return;
      }

      setIsFetching(true);
      setError(undefined);

      try {
        const expenses = await fetchExpenses();

        if (isMounted) {
          expensesCtx.setExpenses(expenses);
        }
      } catch (error) {
        if (isMounted) {
          setError("Could not fetch expenses for analytics!");
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    loadExpensesIfNeeded();

    return () => {
      isMounted = false;
    };
  }, [expensesCtx.expenses.length]);

  if (isFetching) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <ErrorOverlay message={error} />;
  }

  return (
    <AnalyticsDashboard
      expenses={expensesCtx.expenses}
      categories={categoriesCtx.categories}
    />
  );
}

export default AnalyticsScreen;
