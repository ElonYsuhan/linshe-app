import { scanManager } from "@/native/Scanner";
import { Card, Input, Text } from "@ui-kitten/components";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Platform } from "react-native";

interface Props {
  onScan?: (code: string) => void;
}

export function ScanHeadCard({ onScan }: Props) {
  const inputRef = useRef<Input>(null);
  const [value, setValue] = useState("");

  /** 统一处理扫码结果 */
  const handleScan = (code: string) => {
    if (!code) return;

    setValue(code);
    onScan?.(code);

    // 保持焦点，支持连续扫码
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /** 启动红外扫码监听 */
  useEffect(() => {
    if (Platform.OS === "android") {
      scanManager.start();
      scanManager.onScan(handleScan);
    }

    return () => {
      scanManager.stop();
    };
  }, []);

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

          // 键盘模拟输入回车触发
          if (text.endsWith("\n")) {
            handleScan(text.trim());
            Keyboard.dismiss();
          }
        }}
        onSubmitEditing={() => {
          handleScan(value.trim());
        }}
      />

      <Text appearance="hint" style={{ marginTop: 8 }}>
        输出模式支持广播模式 / 模拟键盘
      </Text>
    </Card>
  );
}
