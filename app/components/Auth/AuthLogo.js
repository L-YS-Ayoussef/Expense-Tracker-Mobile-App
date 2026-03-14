import { Image, StyleSheet, Text, View } from "react-native";

import { GlobalStyles } from "../../../constants/styles";

const logoImage = require("../../../assets/images/app-logo.png");

function AuthLogo() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.logoCircle}>
        <Image
          source={logoImage}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.appName}>Expense Tracker</Text>
      <Text style={styles.tagline}>Track smarter. Spend better.</Text>
    </View>
  );
}

export default AuthLogo;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: GlobalStyles.colors.primary800,
    borderWidth: 2,
    borderColor: GlobalStyles.colors.primary400,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  appName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  tagline: {
    color: GlobalStyles.colors.primary100,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
});
