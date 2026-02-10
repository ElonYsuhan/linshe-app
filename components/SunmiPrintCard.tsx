import { printText } from "@/native/Sunmi";
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

    try {
      setLoading(true);
      setResult("");

      const printResult = await printText(value);
      const text =
        printResult === undefined
          ? "打印指令已发送"
          : `打印成功：${JSON.stringify(printResult)}`;

      setResult(text);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "调用商米打印失败";
      setResult(`打印失败：${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <Text category="h6" style={{ marginBottom: 8 }}>
        商米打印
      </Text>

      <Text appearance="hint" style={{ marginBottom: 12 }}>
        输入内容后调用原生打印模块
      </Text>

      <Input
        label="打印内容"
        placeholder="请输入要打印的文字"
        value={value}
        onChangeText={setValue}
        multiline
        textStyle={{ minHeight: 64 }}
        style={{ marginBottom: 12 }}
      />

      <Button
        onPress={handlePrint}
        disabled={loading}
        accessoryLeft={loading ? () => <Spinner size="small" /> : undefined}
      >
        {loading ? "打印中..." : "开始打印"}
      </Button>

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
