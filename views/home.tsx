import { printText } from "@/native/Sunmi"; // 路径按你实际的来
import * as eva from "@eva-design/eva";
import {
  ApplicationProvider,
  Button,
  Card,
  Layout,
  Text,
} from "@ui-kitten/components";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ---------------- 图片选择卡片 ---------------- */
const ImageCard = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("需要访问相册权限");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Text category="h6" style={{ marginBottom: 8 }}>
        本地图片读取
      </Text>

      <Text appearance="hint" style={{ marginBottom: 12 }}>
        选择本地图片并显示
      </Text>

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 8,
            marginBottom: 12,
          }}
          resizeMode="contain"
        />
      ) : (
        <View
          style={{
            height: 200,
            borderRadius: 8,
            backgroundColor: "#f2f2f2",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text appearance="hint">暂无图片</Text>
        </View>
      )}

      <Button onPress={pickImage}>打开图片</Button>
    </Card>
  );
};

/* ---------------- 网络请求卡片 ---------------- */
const RequestCard = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const sendRequest = async () => {
    try {
      setLoading(true);
      setResult("");

      const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
      const data = await res.json();

      setResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setResult(
        JSON.stringify(
          { error: true, message: e?.message || "请求失败" },
          null,
          2,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Text category="h6" style={{ marginBottom: 8 }}>
        网络请求
      </Text>

      <Text appearance="hint" style={{ marginBottom: 12 }}>
        请求接口并以 JSON 格式显示返回结果
      </Text>

      <ScrollView
        style={{
          height: 200,
          backgroundColor: "#f7f9fc",
          borderRadius: 6,
          padding: 8,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "Courier",
            fontSize: 12,
          }}
        >
          {result || "暂无数据"}
        </Text>
      </ScrollView>

      <Button onPress={sendRequest} disabled={loading}>
        {loading ? "请求中..." : "发送请求"}
      </Button>
    </Card>
  );
};
/* ---------------- 商米打印卡片 ---------------- */
const SunmiPrintCard = () => {
  const handlePrint = () => {
    if (Platform.OS !== "android") {
      Alert.alert("提示", "商米打印仅支持 Android 设备");
      return;
    }

    printText("商米打印测试：Hello Sunmi!");
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <Text category="h6" style={{ marginBottom: 8 }}>
        商米打印测试
      </Text>

      <Text appearance="hint" style={{ marginBottom: 12 }}>
        点击按钮，调用 NativeModule 进行打印
      </Text>

      <Button onPress={handlePrint}>打印测试</Button>
    </Card>
  );
};
/* ---------------- 页面入口 ---------------- */
export function HomePage() {
  const insets = useSafeAreaInsets();
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout
        style={{ flex: 1, backgroundColor: "#f7f9fc", paddingTop: insets.top }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <ImageCard />
          <RequestCard />
          <SunmiPrintCard />
        </ScrollView>
      </Layout>
    </ApplicationProvider>
  );
}
