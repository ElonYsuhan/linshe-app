import { ScanHeadCard } from "@/components/ScanHeadCard";
import SunmiPrintCard from "@/components/SunmiPrintCard";
import SunmiScanCard from "@/components/SunmiScanCard";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, Layout } from "@ui-kitten/components";
import { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function HomePage() {
  const insets = useSafeAreaInsets();
  const [latestScanCode, setLatestScanCode] = useState("");

  const handleScan = useCallback((code: string) => {
    setLatestScanCode(code.trim());
  }, []);

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
          <SunmiPrintCard />
          <SunmiScanCard onScan={handleScan} />
          <ScanHeadCard value={latestScanCode} onScan={handleScan} />
        </ScrollView>
      </Layout>
    </ApplicationProvider>
  );
}
