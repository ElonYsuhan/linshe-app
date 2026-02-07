import { NativeModules, Platform } from "react-native";

const { SunmiScanner } = NativeModules;

export function openSunmiScan(): Promise<{
    value: string;
    type: string;
}> {
    if (Platform.OS !== "android") {
        return Promise.reject("仅支持 Android");
    }
    return SunmiScanner.openScan();
}