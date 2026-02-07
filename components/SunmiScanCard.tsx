import { openSunmiScan } from "@/native/SunmiScanner";
import { Button, Card, Text } from "@ui-kitten/components";
import { useState } from "react";

export const SunmiScanCard = () => {
  const [result, setResult] = useState<string>("");

  const handleScan = async () => {
    try {
      const res = await openSunmiScan();
      setResult(`${res.type}：${res.value}`);
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

      {result ? <Text style={{ marginTop: 12 }}>结果：{result}</Text> : null}
    </Card>
  );
};
export default SunmiScanCard;
