import { useAuth } from "@/auth/AuthContext";
import { Button, Card, Input, Layout, Text } from "@ui-kitten/components";
import React, { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from "react-native";

export function LoginModal({ visible }: { visible: boolean }) {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!visible) return null;

  const handleLogin = () => {
    const success = login(username, password);

    if (!success) {
      setError("账号或密码错误（admin / 123456）");
    } else {
      setError("");
      Keyboard.dismiss();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Layout
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%", alignItems: "center" }}
        >
          <Card
            disabled
            style={{
              width: "88%", // ✅ 不再窄
              maxWidth: 420, // ✅ iPad / Web 好看
            }}
          >
            <Text category="h6" style={{ marginBottom: 16 }}>
              用户登录
            </Text>

            <Input
              label="账号"
              placeholder="请输入账号"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={{ marginBottom: 12 }}
            />

            <Input
              label="密码"
              placeholder="请输入密码"
              value={password}
              secureTextEntry
              onChangeText={setPassword}
              style={{ marginBottom: 12 }}
            />

            {error ? (
              <Text status="danger" style={{ marginBottom: 12 }}>
                {error}
              </Text>
            ) : null}

            <Button onPress={handleLogin}>登录</Button>

            <Text
              appearance="hint"
              category="c1"
              style={{ marginTop: 12, textAlign: "center" }}
            >
              默认账号：admin / 123456
            </Text>
          </Card>
        </KeyboardAvoidingView>
      </Layout>
    </TouchableWithoutFeedback>
  );
}
