import React from "react";
import { View, Text } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import { loginStyles as styles } from "../styles/loginStyles";

type WelcomeRouteProp = RouteProp<RootStackParamList, "Welcome">;

export default function WelcomeScreen() {
  const { params } = useRoute<WelcomeRouteProp>();
  const { nombre, email } = params;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>¡Bienvenido, {nombre}!</Text>
        <Text style={styles.buttonText}>Tu email: {email}</Text>
      </View>
    </View>
  );
}
