import { scanManager } from "@/native/Scanner";
import { Button, Card, Spinner, Text } from "@ui-kitten/components";
import { useEffect, useState } from "react";

interface SunmiScanCardProps {
  onScan?: (code: string) => void;
}

export const SunmiScanCard = ({ onScan }: SunmiScanCardProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    scanManager.start();

    const unsubscribe = scanManager.onScan((code) => {
      setResult(`扫码结果：${code}`);
      onScan?.(code);
    });

    return () => {
      unsubscribe();
      scanManager.stop();
    };
  }, [onScan]);

  const handleScan = async () => {
    try {
      setLoading(true);
      setResult("");

      const code = await scanManager.scan();
      setResult(`扫码结果：${code}`);
      onScan?.(code);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "调用扫码模块失败";
      setResult(`扫码失败：${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <Text category="h6">商米扫码</Text>

      <Text appearance="hint" style={{ marginVertical: 8 }}>
        点击按钮调用原生扫码能力
      </Text>

      <Button
        onPress={handleScan}
        disabled={loading}
        accessoryLeft={loading ? () => <Spinner size="small" /> : undefined}
      >
        {loading ? "扫码中..." : "开始扫码"}
      </Button>

      {result ? <Text style={{ marginTop: 12 }}>{result}</Text> : null}
    </Card>
  );
};

export default SunmiScanCard;
