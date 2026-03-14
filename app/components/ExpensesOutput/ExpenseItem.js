import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { GlobalStyles } from "../../../constants/styles";
import { getFormattedDate } from "../../../util/date";
import IconButton from "../UI/IconButton";

function ExpenseItem({
  id,
  description,
  amount,
  date,
  category_name,
  hideCategoryBadge = false,
  showMoveButton = false,
  onMovePress,
}) {
  const navigation = useNavigation();

  function expensePressHandler() {
    navigation.navigate("ManageExpense", {
      expenseId: id,
    });
  }

  return (
    <View style={styles.expenseItem}>
      <Pressable
        onPress={expensePressHandler}
        style={({ pressed }) => [
          styles.pressableArea,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.leftSection}>
          <Text style={[styles.textBase, styles.description]}>
            {description}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.textBase}>{getFormattedDate(date)}</Text>
            {!hideCategoryBadge && category_name ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category_name}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{amount.toFixed(2)}</Text>
        </View>
      </Pressable>

      {showMoveButton ? (
        <View style={styles.moveButtonContainer}>
          <IconButton
            icon="swap-horizontal-outline"
            size={22}
            color="white"
            onPress={onMovePress}
          />
        </View>
      ) : null}
    </View>
  );
}

export default ExpenseItem;

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.75,
  },
  expenseItem: {
    marginVertical: 8,
    backgroundColor: GlobalStyles.colors.primary500,
    borderRadius: 6,
    elevation: 3,
    shadowColor: GlobalStyles.colors.gray500,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    flexDirection: "row",
    alignItems: "center",
  },
  pressableArea: {
    flex: 1,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  textBase: {
    color: GlobalStyles.colors.primary50,
  },
  description: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "bold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: GlobalStyles.colors.primary100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  categoryText: {
    color: GlobalStyles.colors.primary700,
    fontSize: 12,
    fontWeight: "bold",
  },
  amountContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    minWidth: 80,
  },
  amount: {
    color: GlobalStyles.colors.primary500,
    fontWeight: "bold",
  },
  moveButtonContainer: {
    paddingRight: 6,
  },
});
