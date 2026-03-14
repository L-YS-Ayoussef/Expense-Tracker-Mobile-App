import { useContext, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ManageExpense from "./screens/ManageExpense";
import RecentExpenses from "./screens/RecentExpenses";
import AllExpenses from "./screens/AllExpenses";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

import { GlobalStyles } from "../constants/styles";
import IconButton from "./components/UI/IconButton";
import LoadingOverlay from "./components/UI/LoadingOverlay";
import ErrorOverlay from "./components/UI/ErrorOverlay";

import ExpensesContextProvider from "../store/expenses-context";
import CategoriesContextProvider, {
  CategoriesContext,
} from "../store/categories-context";
import AuthContextProvider, { AuthContext } from "../store/auth-context";

import { fetchCategories } from "../util/categories";

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

function ExpensesOverview() {
  const authCtx = useContext(AuthContext);

  return (
    <BottomTabs.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        headerTintColor: "white",
        tabBarStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        tabBarActiveTintColor: GlobalStyles.colors.accent500,
        headerLeft: ({ tintColor }) => (
          <IconButton
            icon="log-out-outline"
            size={22}
            color={tintColor}
            onPress={authCtx.logout}
          />
        ),
        headerRight: ({ tintColor }) => (
          <IconButton
            icon="add"
            size={24}
            color={tintColor}
            onPress={() => {
              navigation.navigate("ManageExpense");
            }}
          />
        ),
      })}
    >
      <BottomTabs.Screen
        name="RecentExpenses"
        component={RecentExpenses}
        options={{
          title: "Recent Expenses",
          tabBarLabel: "Recent",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hourglass" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="AllExpenses"
        component={AllExpenses}
        options={{
          title: "All Expenses",
          tabBarLabel: "All Expenses",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
    </BottomTabs.Navigator>
  );
}

function AuthenticatedAppContent() {
  const categoriesCtx = useContext(CategoriesContext);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setIsFetchingCategories(true);
      setError(undefined);

      try {
        const categories = await fetchCategories();
        if (isMounted) {
          categoriesCtx.setCategories(categories);
        }
      } catch (error) {
        if (isMounted) {
          setError(undefined);
        }
      } finally {
        if (isMounted) {
          setIsFetchingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isFetchingCategories && categoriesCtx.categories.length === 0) {
    return <LoadingOverlay />;
  }

  if (error && categoriesCtx.categories.length === 0) {
    return <ErrorOverlay message={error} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="ExpensesOverview"
        component={ExpensesOverview}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManageExpense"
        component={ManageExpense}
        options={{
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}

function AuthenticatedNavigator() {
  return (
    <CategoriesContextProvider>
      <ExpensesContextProvider>
        <AuthenticatedAppContent />
      </ExpensesContextProvider>
    </CategoriesContextProvider>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        headerTintColor: "white",
        contentStyle: { backgroundColor: GlobalStyles.colors.primary700 },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Log In" }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: "Create Account" }}
      />
    </Stack.Navigator>
  );
}

function Navigation() {
  const authCtx = useContext(AuthContext);

  if (authCtx.isLoading) {
    return <LoadingOverlay />;
  }

  return authCtx.isAuthenticated ? (
    <AuthenticatedNavigator />
  ) : (
    <AuthNavigator />
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthContextProvider>
        <Navigation />
      </AuthContextProvider>
    </>
  );
}
