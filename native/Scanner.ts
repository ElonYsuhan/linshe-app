import { DeviceEventEmitter, NativeModules } from "react-native";

const { SunmiScanModule } = NativeModules;

type ScanCallback = (code: string) => void;

class ScanManager {
    private listeners: ScanCallback[] = [];

    /** 开始扫码监听 */
    start() {
        // 监听 Native 发送的事件
        DeviceEventEmitter.addListener("onScanSuccess", (code: string) => {
            this.emit(code);
        });
    }

    /** 停止扫码监听 */
    stop() {
        // 目前我们模块里没有 stopListen，可以移除所有监听
        DeviceEventEmitter.removeAllListeners("onScanSuccess");
    }

    /** 注册回调 */
    onScan(cb: ScanCallback) {
        this.listeners.push(cb);
    }

    /** 内部触发回调 */
    private emit(code: string) {
        this.listeners.forEach((cb) => cb(code));
    }

    /** 调用扫码 */
    scan() {
        console.log(SunmiScanModule);

        return SunmiScanModule.scan();
    }
}

export const scanManager = new ScanManager();