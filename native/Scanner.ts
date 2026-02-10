import {
  DeviceEventEmitter,
  EmitterSubscription,
  NativeModules,
  Platform,
} from "react-native";

type SunmiScanModuleType = {
  scan?: () => Promise<unknown>;
  startListen?: () => void;
  stopListen?: () => void;
};

type ScanCallback = (code: string) => void;
type ScanPayload = string | { code?: string; data?: string; result?: string };

const SCAN_EVENT_NAME = "onScanSuccess";

const sunmiScanModule =
  NativeModules.SunmiScanModule as SunmiScanModuleType | undefined;

class ScanManager {
  private listeners = new Set<ScanCallback>();

  private subscription: EmitterSubscription | null = null;

  private startRefCount = 0;

  start() {
    if (Platform.OS !== "android") {
      return;
    }

    this.startRefCount += 1;
    if (this.subscription) {
      return;
    }

    this.subscription = DeviceEventEmitter.addListener(
      SCAN_EVENT_NAME,
      (payload: ScanPayload) => {
        const code = this.normalizeCode(payload);
        if (!code) {
          return;
        }

        this.emit(code);
      },
    );

    sunmiScanModule?.startListen?.();
  }

  stop() {
    if (Platform.OS !== "android") {
      return;
    }

    this.startRefCount = Math.max(0, this.startRefCount - 1);
    if (this.startRefCount > 0) {
      return;
    }

    this.subscription?.remove();
    this.subscription = null;

    sunmiScanModule?.stopListen?.();
  }

  onScan(cb: ScanCallback) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  emitScan(code: string) {
    const clean = code.trim();
    if (!clean) {
      return;
    }

    this.emit(clean);
  }

  async scan() {
    if (Platform.OS !== "android") {
      throw new Error("当前设备不是 Android，无法调用商米扫码");
    }

    if (!sunmiScanModule || typeof sunmiScanModule.scan !== "function") {
      throw new Error(
        "未找到 SunmiScanModule 原生模块，请先完成 Android 原生桥接并重新编译应用",
      );
    }

    const payload = await sunmiScanModule.scan();
    const code = this.normalizeCode(payload as ScanPayload);

    if (!code) {
      throw new Error("扫码结果为空");
    }

    this.emit(code);
    return code;
  }

  private normalizeCode(payload: ScanPayload | undefined) {
    if (!payload) {
      return "";
    }

    if (typeof payload === "string") {
      return payload.trim();
    }

    return (payload.code || payload.data || payload.result || "").trim();
  }

  private emit(code: string) {
    this.listeners.forEach((listener) => listener(code));
  }
}

export const scanManager = new ScanManager();
