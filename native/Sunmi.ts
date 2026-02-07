import { NativeModules, Platform } from "react-native";

const { SunmiModule } = NativeModules;

/**
 * 打印一行文字
 */
export function printText(text: string) {
    if (Platform.OS !== "android") return;
    return SunmiModule.printText(text);
}