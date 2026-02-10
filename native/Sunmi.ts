import { NativeModules, Platform } from "react-native";

type SunmiPrinterModule = {
  printText: (text: string) => Promise<unknown>;
};

const sunmiPrinter = NativeModules
  .SunmiPrinter as Partial<SunmiPrinterModule> | undefined;

function assertAndroid() {
  if (Platform.OS !== "android") {
    throw new Error("当前设备不是 Android，无法调用商米打印");
  }
}

function assertPrinterModule(): SunmiPrinterModule {
  if (!sunmiPrinter || typeof sunmiPrinter.printText !== "function") {
    throw new Error(
      "未找到 SunmiPrinter 原生模块，请先完成 Android 原生桥接并重新编译应用",
    );
  }

  return sunmiPrinter as SunmiPrinterModule;
}

export async function printText(text: string) {
  assertAndroid();

  const content = text.trim();
  if (!content) {
    throw new Error("打印内容不能为空");
  }

  const module = assertPrinterModule();
  return module.printText(content);
}
