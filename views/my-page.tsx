import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { LoginModal } from "@/components/LoginModal";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, Layout, Text } from "@ui-kitten/components";
import React from "react";

const HomeScreen = () => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <Layout
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text category="h1">My Page</Text>
        {!isLoggedIn && <Text appearance="hint">当前未登录</Text>}
      </Layout>

      {/* 未登录 → 弹出登录 */}
      <LoginModal visible={!isLoggedIn} />
    </>
  );
};

export function MyPage() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <AuthProvider>
        <HomeScreen />
      </AuthProvider>
    </ApplicationProvider>
  );
}
