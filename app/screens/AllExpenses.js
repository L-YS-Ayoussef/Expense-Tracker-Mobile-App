import { useContext, useState } from "react";
import { Alert } from "react-native";

import CategorizedExpensesOutput from "../components/ExpensesOutput/CategorizedExpensesOutput";
import RenameCategoryModal from "../components/ExpensesOutput/RenameCategoryModal";
import DeleteCategoryModal from "../components/ExpensesOutput/DeleteCategoryModal";
import MoveExpenseModal from "../components/ExpensesOutput/MoveExpenseModal";
import { ExpensesContext } from "../../store/expenses-context";
import { CategoriesContext } from "../../store/categories-context";
import {
  deleteCategory as deleteCategoryRequest,
  renameCategory as renameCategoryRequest,
} from "../../util/categories";
import { updateExpense as updateExpenseRequest } from "../../util/http";

function AllExpenses() {
  const expensesCtx = useContext(ExpensesContext);
  const categoriesCtx = useContext(CategoriesContext);

  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedCategoryForRename, setSelectedCategoryForRename] =
    useState(null);
  const [selectedCategoryForDelete, setSelectedCategoryForDelete] =
    useState(null);
  const [selectedCategoryExpenseCount, setSelectedCategoryExpenseCount] =
    useState(0);
  const [selectedExpenseForMove, setSelectedExpenseForMove] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleGroup(groupId) {
    setExpandedIds((currentExpandedIds) =>
      currentExpandedIds.includes(groupId)
        ? currentExpandedIds.filter((id) => id !== groupId)
        : [...currentExpandedIds, groupId],
    );
  }

  async function handleRenameCategory(newName) {
    if (!selectedCategoryForRename) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedCategory = await renameCategoryRequest(
        selectedCategoryForRename.id,
        newName,
      );

      categoriesCtx.updateCategory(updatedCategory.id, updatedCategory);
      expensesCtx.renameCategoryOnExpenses(
        updatedCategory.id,
        updatedCategory.name,
      );
      setSelectedCategoryForRename(null);
    } catch (error) {
      Alert.alert(
        "Rename failed",
        error.response?.data?.message || "Could not rename category.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory(replacementCategoryId) {
    if (!selectedCategoryForDelete) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteCategoryRequest(
        selectedCategoryForDelete.id,
        replacementCategoryId,
      );

      const replacementCategory = replacementCategoryId
        ? categoriesCtx.categories.find(
            (category) => category.id === replacementCategoryId,
          ) || null
        : null;

      expensesCtx.reassignCategoryForExpenses(
        selectedCategoryForDelete.id,
        replacementCategory,
      );
      categoriesCtx.deleteCategory(selectedCategoryForDelete.id);
      setExpandedIds((currentExpandedIds) =>
        currentExpandedIds.filter(
          (groupId) => groupId !== `category-${selectedCategoryForDelete.id}`,
        ),
      );
      setSelectedCategoryForDelete(null);
      setSelectedCategoryExpenseCount(0);
    } catch (error) {
      Alert.alert(
        "Delete failed",
        error.response?.data?.message || "Could not delete category.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMoveExpense(nextCategoryId) {
    if (!selectedExpenseForMove) {
      return;
    }

    if ((selectedExpenseForMove.category_id ?? null) === nextCategoryId) {
      setSelectedExpenseForMove(null);
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedExpense = await updateExpenseRequest(
        selectedExpenseForMove.id,
        {
          description: selectedExpenseForMove.description,
          amount: selectedExpenseForMove.amount,
          date: selectedExpenseForMove.date,
          category_id: nextCategoryId,
        },
      );

      expensesCtx.updateExpense(updatedExpense.id, updatedExpense);
      setSelectedExpenseForMove(null);
    } catch (error) {
      Alert.alert(
        "Move failed",
        error.response?.data?.message || "Could not move expense.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <CategorizedExpensesOutput
        expenses={expensesCtx.expenses}
        categories={categoriesCtx.categories}
        expandedIds={expandedIds}
        onToggleGroup={toggleGroup}
        onRenameCategory={setSelectedCategoryForRename}
        onDeleteCategory={(category, expenseCount) => {
          setSelectedCategoryForDelete(category);
          setSelectedCategoryExpenseCount(expenseCount);
        }}
        onMoveExpense={setSelectedExpenseForMove}
      />

      <RenameCategoryModal
        visible={!!selectedCategoryForRename}
        category={selectedCategoryForRename}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setSelectedCategoryForRename(null);
          }
        }}
        onConfirm={handleRenameCategory}
      />

      <DeleteCategoryModal
        visible={!!selectedCategoryForDelete}
        category={selectedCategoryForDelete}
        categories={categoriesCtx.categories}
        expenseCount={selectedCategoryExpenseCount}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setSelectedCategoryForDelete(null);
            setSelectedCategoryExpenseCount(0);
          }
        }}
        onConfirm={handleDeleteCategory}
      />

      <MoveExpenseModal
        visible={!!selectedExpenseForMove}
        expense={selectedExpenseForMove}
        categories={categoriesCtx.categories}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setSelectedExpenseForMove(null);
          }
        }}
        onConfirm={handleMoveExpense}
      />
    </>
  );
}

export default AllExpenses;
