import { scanManager } from "@/native/Scanner";
import { Button, Card, Input, Text } from "@ui-kitten/components";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Platform } from "react-native";

interface Props {
  value?: string;
  onScan?: (code: string) => void;
}

export function ScanHeadCard({ value, onScan }: Props) {
  const inputRef = useRef<Input>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (typeof value === "string") {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    scanManager.start();
    const unsubscribe = scanManager.onScan((code) => {
      setInputValue(code);
      onScan?.(code);
      setTimeout(() => inputRef.current?.focus(), 100);
    });

    return () => {
      unsubscribe();
      scanManager.stop();
    };
  }, [onScan]);

  const commitManualInput = () => {
    const code = inputValue.trim();
    if (!code) {
      return;
    }

    scanManager.emitScan(code);
    Keyboard.dismiss();
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <Text category="h6" style={{ marginBottom: 8 }}>
        获取扫码内容
      </Text>

      <Text appearance="hint" style={{ marginBottom: 12 }}>
        支持原生扫码回传，也支持手动输入测试
      </Text>

      <Input
        ref={inputRef}
        autoFocus
        value={inputValue}
        placeholder="扫码结果会显示在这里"
        onChangeText={setInputValue}
        onSubmitEditing={commitManualInput}
        style={{ marginBottom: 12 }}
      />

      <Button appearance="outline" onPress={commitManualInput}>
        确认扫码内容
      </Button>
    </Card>
  );
}
