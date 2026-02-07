import { printText } from "@/native/Sunmi"; // 你自己的路径
import { Button, Card, Input, Spinner, Text } from "@ui-kitten/components";
import React, { useState } from "react";
import { Alert, Platform } from "react-native";

const SunmiPrintCard = () => {
  const [value, setValue] = useState("商米打印测试：Hello Sunmi!");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handlePrint = async () => {
    if (Platform.OS !== "android") {
      Alert.alert("提示", "商米打印仅支持 Android 设备");
      return;
    }

    if (!value.trim()) {
      Alert.alert("提示", "请输入要打印的内容");
      return;
    }

    try {
      setLoading(true);
      setResult("");

      // 🔥 关键：等待 Native 返回
      const res = await printText(value);

      // 兼容你后面 Native return 的结构
      setResult(
        res ? `打印成功：${JSON.stringify(res)}` : "打印指令已发送（无返回值）",
      );
    } catch (e: any) {
      setResult(`打印失败：${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <Text category="h6" style={{ marginBottom: 8 }}>
        商米打印测试
      </Text>

      <Text appearance="hint" style={{ marginBottom: 12 }}>
        输入要打印的内容，调用 NativeModule 打印
      </Text>

      {/* 输入框 */}
      <Input
        label="打印内容"
        placeholder="请输入要打印的文字"
        value={value}
        onChangeText={setValue}
        multiline
        textStyle={{ minHeight: 64 }}
        style={{ marginBottom: 12 }}
      />

      {/* 打印按钮 */}
      <Button
        onPress={handlePrint}
        disabled={loading}
        accessoryLeft={loading ? () => <Spinner size="small" /> : undefined}
      >
        {loading ? "打印中..." : "打印测试"}
      </Button>

      {/* 结果反馈 */}
      {result ? (
        <>
          <Text
            category="label"
            appearance="hint"
            style={{ marginTop: 12, marginBottom: 4 }}
          >
            调用结果
          </Text>
          <Text
            style={{
              fontSize: 12,
              backgroundColor: "#f7f9fc",
              padding: 8,
              borderRadius: 6,
            }}
          >
            {result}
          </Text>
        </>
      ) : null}
    </Card>
  );
};

export default SunmiPrintCard;
