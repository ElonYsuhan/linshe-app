import { DeviceEventEmitter, NativeModules } from "react-native";

const { SunmiScanModule } = NativeModules;

type ScanCallback = (code: string) => void;

class ScanManager {
    private listeners: ScanCallback[] = [];

    start() {
        SunmiScanModule?.startListen();

        DeviceEventEmitter.addListener("onInfraredScan", (code: string) => {
            this.emit(code);
        });
    }

    stop() {
        SunmiScanModule?.stopListen();
    }

    onScan(cb: ScanCallback) {
        this.listeners.push(cb);
    }

    private emit(code: string) {
        this.listeners.forEach((cb) => cb(code));
    }
}

export const scanManager = new ScanManager();