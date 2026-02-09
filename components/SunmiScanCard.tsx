import { scanManager } from "@/native/Scanner";
import { Button, Card, Text } from "@ui-kitten/components";
import { useEffect, useState } from "react";

export const SunmiScanCard = () => {
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    // 注册事件回调
    const callback = (code: string) => {
      setResult(`扫码结果：${code}`);
    };
    scanManager.onScan(callback);
    scanManager.start();

    return () => {
      scanManager.stop();
    };
  }, []);

  const handleScan = async () => {
    try {
      // 调用原生扫码
      const code = await scanManager.scan();
      setResult(`扫码结果：${code}`);
    } catch (e: any) {
      setResult(`扫码失败：${e?.message || e}`);
    }
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <Text category="h6">商米扫码</Text>

      <Text appearance="hint" style={{ marginVertical: 8 }}>
        调用系统扫码模块
      </Text>

      <Button onPress={handleScan}>开始扫码</Button>

      {result ? <Text style={{ marginTop: 12 }}>{result}</Text> : null}
    </Card>
  );
};

export default SunmiScanCard;
