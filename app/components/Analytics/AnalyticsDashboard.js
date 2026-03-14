import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { GlobalStyles } from "../../../constants/styles";
import { getDateMinusDays, getFormattedDate } from "../../../util/date";

const RANGE_OPTIONS = [
  { key: "7d", label: "7D", days: 7, title: "Last 7 days" },
  { key: "30d", label: "30D", days: 30, title: "Last 30 days" },
  { key: "90d", label: "90D", days: 90, title: "Last 90 days" },
  { key: "all", label: "All", days: null, title: "All time" },
];

const DONUT_COLORS = [
  "#f7bc0c",
  "#7c3aed",
  "#06b6d4",
  "#10b981",
  "#ef4444",
  "#f59e0b",
];

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function formatCompactCurrency(value) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toFixed(0)}`;
}

function getRangeFilteredExpenses(expenses, selectedRangeKey) {
  const selectedRange = RANGE_OPTIONS.find(
    (item) => item.key === selectedRangeKey,
  );

  if (!selectedRange || selectedRange.days === null) {
    return expenses;
  }

  const today = new Date();
  const startDate = getDateMinusDays(today, selectedRange.days - 1);

  return expenses.filter((expense) => expense.date >= startDate);
}

function getLast7DaysData(expenses) {
  const today = new Date();
  const totalsByDay = new Map();

  for (const expense of expenses) {
    const key = getFormattedDate(expense.date);
    totalsByDay.set(key, (totalsByDay.get(key) || 0) + expense.amount);
  }

  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = getDateMinusDays(today, i);
    const key = getFormattedDate(date);

    result.push({
      key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      total: totalsByDay.get(key) || 0,
    });
  }

  return result;
}

function getLast6MonthsData(expenses) {
  const today = new Date();
  const result = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();

    const total = expenses.reduce((sum, expense) => {
      if (
        expense.date.getFullYear() === year &&
        expense.date.getMonth() === month
      ) {
        return sum + expense.amount;
      }
      return sum;
    }, 0);

    result.push({
      key: `${year}-${month + 1}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
      total,
    });
  }

  return result;
}

function getCategoryTotals(expenses) {
  const totalsMap = new Map();

  for (const expense of expenses) {
    const key = expense.category_id ?? "uncategorized";
    const name = expense.category_name || "Uncategorized";

    if (!totalsMap.has(key)) {
      totalsMap.set(key, {
        key: String(key),
        name,
        total: 0,
        count: 0,
      });
    }

    const current = totalsMap.get(key);
    current.total += expense.amount;
    current.count += 1;
  }

  return Array.from(totalsMap.values()).sort((a, b) => b.total - a.total);
}

function getTopExpenses(expenses, limit = 5) {
  return [...expenses]
    .sort((a, b) => {
      if (b.amount !== a.amount) {
        return b.amount - a.amount;
      }
      return b.date - a.date;
    })
    .slice(0, limit);
}

function getMonthlyComparison(expenses) {
  const today = new Date();

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const previousMonthStart = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1,
  );

  let currentMonthTotal = 0;
  let previousMonthTotal = 0;
  let currentMonthCount = 0;
  let previousMonthCount = 0;

  for (const expense of expenses) {
    if (expense.date >= currentMonthStart && expense.date < nextMonthStart) {
      currentMonthTotal += expense.amount;
      currentMonthCount += 1;
      continue;
    }

    if (
      expense.date >= previousMonthStart &&
      expense.date < currentMonthStart
    ) {
      previousMonthTotal += expense.amount;
      previousMonthCount += 1;
    }
  }

  const difference = currentMonthTotal - previousMonthTotal;
  const percentChange =
    previousMonthTotal > 0
      ? (difference / previousMonthTotal) * 100
      : currentMonthTotal > 0
        ? 100
        : 0;

  return {
    current: {
      label: currentMonthStart.toLocaleDateString("en-US", { month: "long" }),
      total: currentMonthTotal,
      count: currentMonthCount,
    },
    previous: {
      label: previousMonthStart.toLocaleDateString("en-US", { month: "long" }),
      total: previousMonthTotal,
      count: previousMonthCount,
    },
    difference,
    percentChange,
  };
}

function buildDonutData(categoryTotals) {
  const top = categoryTotals.slice(0, 4);
  const remaining = categoryTotals.slice(4);

  if (remaining.length > 0) {
    top.push({
      key: "other",
      name: "Other",
      total: remaining.reduce((sum, item) => sum + item.total, 0),
      count: remaining.reduce((sum, item) => sum + item.count, 0),
    });
  }

  return top.map((item, index) => ({
    ...item,
    color: DONUT_COLORS[index % DONUT_COLORS.length],
  }));
}

function StatCard({ label, value, helper }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statHelper}>{helper}</Text>
    </View>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        active && styles.filterChipActive,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.filterChipText, active && styles.filterChipTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function VerticalBars({ data }) {
  const maxValue = Math.max(...data.map((item) => item.total), 1);

  return (
    <View style={styles.verticalChart}>
      {data.map((item) => {
        const heightPercent =
          maxValue > 0
            ? Math.max((item.total / maxValue) * 100, item.total > 0 ? 8 : 0)
            : 0;

        return (
          <View key={item.key} style={styles.verticalColumn}>
            <Text style={styles.verticalAmount}>
              {item.total > 0 ? formatCompactCurrency(item.total) : "$0"}
            </Text>
            <View style={styles.verticalTrack}>
              <View
                style={[styles.verticalFill, { height: `${heightPercent}%` }]}
              />
            </View>
            <Text style={styles.verticalLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function CategoryDonut({ data, total }) {
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeFraction = 0;

  return (
    <View style={styles.donutSection}>
      <View style={styles.donutChartWrapper}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={GlobalStyles.colors.primary500}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {data.map((item) => {
            const fraction = total > 0 ? item.total / total : 0;
            const dashLength = circumference * fraction;
            const gapLength = circumference - dashLength;
            const dashOffset = -circumference * cumulativeFraction;

            cumulativeFraction += fraction;

            return (
              <Circle
                key={item.key}
                cx={center}
                cy={center}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${dashLength} ${gapLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${center} ${center})`}
              />
            );
          })}
        </Svg>

        <View style={styles.donutCenter}>
          <Text style={styles.donutCenterValue}>{formatCurrency(total)}</Text>
          <Text style={styles.donutCenterLabel}>selected spend</Text>
        </View>
      </View>

      <View style={styles.donutLegend}>
        {data.map((item) => {
          const percent =
            total > 0 ? ((item.total / total) * 100).toFixed(1) : "0.0";

          return (
            <View key={item.key} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendName}>{item.name}</Text>
              </View>
              <Text style={styles.legendValue}>
                {formatCurrency(item.total)} • {percent}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TopExpensesList({ expenses }) {
  if (expenses.length === 0) {
    return (
      <Text style={styles.emptyInlineText}>No expenses in this range.</Text>
    );
  }

  return (
    <View>
      {expenses.map((expense, index) => (
        <View key={expense.id} style={styles.topExpenseRow}>
          <View style={styles.topExpenseRank}>
            <Text style={styles.topExpenseRankText}>{index + 1}</Text>
          </View>

          <View style={styles.topExpenseContent}>
            <Text style={styles.topExpenseTitle}>{expense.description}</Text>
            <Text style={styles.topExpenseMeta}>
              {getFormattedDate(expense.date)} •{" "}
              {expense.category_name || "Uncategorized"}
            </Text>
          </View>

          <Text style={styles.topExpenseAmount}>
            {formatCurrency(expense.amount)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function MonthlyComparison({ comparison }) {
  const maxValue = Math.max(
    comparison.current.total,
    comparison.previous.total,
    1,
  );
  const currentWidth = (comparison.current.total / maxValue) * 100;
  const previousWidth = (comparison.previous.total / maxValue) * 100;

  let summaryText = "No major change from last month.";

  if (comparison.previous.total === 0 && comparison.current.total > 0) {
    summaryText = "Spending started this month after no expenses last month.";
  } else if (comparison.previous.total > 0) {
    if (comparison.difference > 0) {
      summaryText = `Up ${comparison.percentChange.toFixed(1)}% compared with last month.`;
    } else if (comparison.difference < 0) {
      summaryText = `Down ${Math.abs(comparison.percentChange).toFixed(1)}% compared with last month.`;
    }
  }

  return (
    <View>
      <Text style={styles.monthComparisonSummary}>{summaryText}</Text>

      <View style={styles.monthRow}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthName}>{comparison.current.label}</Text>
          <Text style={styles.monthValue}>
            {formatCurrency(comparison.current.total)} •{" "}
            {comparison.current.count} item(s)
          </Text>
        </View>
        <View style={styles.monthTrack}>
          <View
            style={[styles.monthFillCurrent, { width: `${currentWidth}%` }]}
          />
        </View>
      </View>

      <View style={styles.monthRow}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthName}>{comparison.previous.label}</Text>
          <Text style={styles.monthValue}>
            {formatCurrency(comparison.previous.total)} •{" "}
            {comparison.previous.count} item(s)
          </Text>
        </View>
        <View style={styles.monthTrack}>
          <View
            style={[styles.monthFillPrevious, { width: `${previousWidth}%` }]}
          />
        </View>
      </View>
    </View>
  );
}

function AnalyticsDashboard({ expenses, categories }) {
  const [selectedRange, setSelectedRange] = useState("30d");

  const filteredExpenses = useMemo(
    () => getRangeFilteredExpenses(expenses, selectedRange),
    [expenses, selectedRange],
  );

  const selectedRangeConfig = RANGE_OPTIONS.find(
    (option) => option.key === selectedRange,
  );

  const totalSpent = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const averageExpense =
    filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0;

  const largestExpense = filteredExpenses.reduce(
    (max, expense) => Math.max(max, expense.amount),
    0,
  );

  const last7DaysData = useMemo(() => getLast7DaysData(expenses), [expenses]);
  const last6MonthsData = useMemo(
    () => getLast6MonthsData(expenses),
    [expenses],
  );

  const categoryTotals = useMemo(
    () => getCategoryTotals(filteredExpenses),
    [filteredExpenses],
  );

  const donutData = useMemo(
    () => buildDonutData(categoryTotals),
    [categoryTotals],
  );

  const topExpenses = useMemo(
    () => getTopExpenses(filteredExpenses, 5),
    [filteredExpenses],
  );

  const monthlyComparison = useMemo(
    () => getMonthlyComparison(expenses),
    [expenses],
  );

  if (!expenses || expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No analytics yet</Text>
        <Text style={styles.emptyText}>
          Add some expenses and this screen will show charts and spending
          insights.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Expense Analytics</Text>
      <Text style={styles.screenSubtitle}>
        Insights from your expenses, categories, and entry sources.
      </Text>

      <View style={styles.filterRow}>
        {RANGE_OPTIONS.map((option) => (
          <FilterChip
            key={option.key}
            label={option.label}
            active={selectedRange === option.key}
            onPress={() => setSelectedRange(option.key)}
          />
        ))}
      </View>

      <Text style={styles.activeRangeText}>
        Showing analytics for {selectedRangeConfig?.title || "selected range"}
      </Text>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Spent"
          value={formatCurrency(totalSpent)}
          helper="Total amount in selected range"
        />
        <StatCard
          label="Expenses"
          value={String(filteredExpenses.length)}
          helper={`${categoryTotals.length} active of ${categories.length} total categories`}
        />
        <StatCard
          label="Average"
          value={formatCurrency(averageExpense)}
          helper="Average value per expense"
        />
        <StatCard
          label="Largest"
          value={formatCurrency(largestExpense)}
          helper="Highest single expense"
        />
      </View>

      <SectionCard
        title="Category Split"
        subtitle="Donut view of where your money is going in the selected range"
      >
        {donutData.length === 0 ? (
          <Text style={styles.emptyInlineText}>
            No category data in this range.
          </Text>
        ) : (
          <CategoryDonut data={donutData} total={totalSpent} />
        )}
      </SectionCard>

      <SectionCard
        title="Top 5 Expenses"
        subtitle="Largest individual expenses in the selected range"
      >
        <TopExpensesList expenses={topExpenses} />
      </SectionCard>

      <SectionCard
        title="Monthly Comparison"
        subtitle="Current month compared with the previous month"
      >
        <MonthlyComparison comparison={monthlyComparison} />
      </SectionCard>

      <SectionCard
        title="Last 7 Days"
        subtitle="Daily spending trend for the past week"
      >
        <VerticalBars data={last7DaysData} />
      </SectionCard>

      <SectionCard title="Last 6 Months" subtitle="Monthly spending trend">
        <VerticalBars data={last6MonthsData} />
      </SectionCard>
    </ScrollView>
  );
}

export default AnalyticsDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  pressed: {
    opacity: 0.8,
  },
  screenTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  screenSubtitle: {
    color: GlobalStyles.colors.primary100,
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: GlobalStyles.colors.primary800,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: GlobalStyles.colors.accent500,
  },
  filterChipText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  filterChipTextActive: {
    color: GlobalStyles.colors.primary700,
  },
  activeRangeText: {
    color: GlobalStyles.colors.primary100,
    fontSize: 12,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: GlobalStyles.colors.primary800,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  statLabel: {
    color: GlobalStyles.colors.primary100,
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  statHelper: {
    color: GlobalStyles.colors.primary100,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: GlobalStyles.colors.primary800,
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: GlobalStyles.colors.primary100,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyInlineText: {
    color: GlobalStyles.colors.primary100,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
  verticalChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 180,
  },
  verticalColumn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  verticalAmount: {
    color: GlobalStyles.colors.primary100,
    fontSize: 10,
    marginBottom: 8,
  },
  verticalTrack: {
    width: 24,
    height: 110,
    borderRadius: 8,
    backgroundColor: GlobalStyles.colors.primary500,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  verticalFill: {
    width: "100%",
    backgroundColor: GlobalStyles.colors.accent500,
    borderRadius: 8,
  },
  verticalLabel: {
    color: "white",
    fontSize: 11,
    marginTop: 8,
  },
  donutSection: {
    alignItems: "center",
  },
  donutChartWrapper: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  donutCenter: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  donutCenterValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  donutCenterLabel: {
    color: GlobalStyles.colors.primary100,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  donutLegend: {
    width: "100%",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  legendName: {
    color: "white",
    fontSize: 13,
    flex: 1,
  },
  legendValue: {
    color: GlobalStyles.colors.primary100,
    fontSize: 12,
  },
  topExpenseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GlobalStyles.colors.primary500,
  },
  topExpenseRank: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: GlobalStyles.colors.accent500,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  topExpenseRankText: {
    color: GlobalStyles.colors.primary700,
    fontWeight: "bold",
    fontSize: 12,
  },
  topExpenseContent: {
    flex: 1,
    marginRight: 12,
  },
  topExpenseTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  topExpenseMeta: {
    color: GlobalStyles.colors.primary100,
    fontSize: 11,
  },
  topExpenseAmount: {
    color: GlobalStyles.colors.accent500,
    fontWeight: "bold",
    fontSize: 13,
  },
  monthComparisonSummary: {
    color: GlobalStyles.colors.primary100,
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  monthRow: {
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  monthName: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  monthValue: {
    color: GlobalStyles.colors.primary100,
    fontSize: 12,
  },
  monthTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: GlobalStyles.colors.primary500,
    overflow: "hidden",
  },
  monthFillCurrent: {
    height: "100%",
    backgroundColor: GlobalStyles.colors.accent500,
    borderRadius: 999,
  },
  monthFillPrevious: {
    height: "100%",
    backgroundColor: GlobalStyles.colors.primary100,
    borderRadius: 999,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary700,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyText: {
    color: GlobalStyles.colors.primary100,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
