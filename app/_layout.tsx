import { ThemedText } from "@/components/themed-text";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
export default function RootLayout() {
  const [text, onChangeText] = useState("Useless Text");
  const [number, onChangeNumber] = useState("");
  const styles = StyleSheet.create({
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    },
  });

  return (
    <View>
      <ThemedText type="title">林麝手持端项目初始化</ThemedText>

      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangeNumber}
        value={number}
        placeholder="useless placeholder"
        keyboardType="numeric"
      />
    </View>
  );
}
