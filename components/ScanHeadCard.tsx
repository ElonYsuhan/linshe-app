import { Card, Input, Text } from "@ui-kitten/components";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from "react-native";

interface Props {
  onScan?: (code: string) => void;
  /** true 使用广播模式，false 使用键盘模拟模式 */
  useBroadcast?: boolean;
}

export function ScanHeadCard({ onScan, useBroadcast = true }: Props) {
  const inputRef = useRef<Input>(null);
  const [value, setValue] = useState("");

  /** 扫码结果统一处理 */
  const handleScan = (code: string) => {
    if (!code) return;
    setValue(code);
    onScan?.(code);

    // 支持连续扫码
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  /** 广播模式（商米 App 广播） */
  useEffect(() => {
    if (Platform.OS !== "android" || !useBroadcast) return;

    const listener =
      NativeModules.DeviceEventEmitter || new NativeEventEmitter();
    const subscription = listener.addListener(
      "onScanSuccess",
      (code: string) => {
        handleScan(code);
      },
    );

    return () => subscription.remove();
  }, [useBroadcast]);

  /** 模拟键盘模式 */
  useEffect(() => {
    if (Platform.OS !== "android" || useBroadcast) return;

    // 聚焦 Input 支持扫码枪直接输入
    inputRef.current?.focus();
  }, [useBroadcast]);

  return (
    <Card style={{ marginTop: 16 }}>
      <Text category="s1" style={{ marginBottom: 8 }}>
        请按扫码键或输入条码
      </Text>

      <Input
        ref={inputRef}
        autoFocus
        value={value}
        placeholder="扫码结果会自动输入"
        onChangeText={(text) => {
          setValue(text);

          if (!useBroadcast && text.endsWith("\n")) {
            handleScan(text.trim());
            Keyboard.dismiss();
          }
        }}
        onSubmitEditing={() => {
          if (!useBroadcast) handleScan(value.trim());
        }}
      />

      <Text appearance="hint" style={{ marginTop: 8 }}>
        输出模式支持广播模式 / 模拟键盘
      </Text>
    </Card>
  );
}
