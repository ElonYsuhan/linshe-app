const fs = require("fs");
const path = require("path");
const {
  createRunOncePlugin,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withMainApplication,
} = require("@expo/config-plugins");

const PLUGIN_NAME = "with-sunmi-bridge";
const PLUGIN_VERSION = "1.0.0";
const SUNMI_DEPENDENCY = "com.sunmi:printerx:1.0.17";
const SCANNER_PACKAGE_NAME = "com.sunmi.scanner";

function getAndroidPackage(config) {
  const appPackage = config.android?.package;
  if (!appPackage) {
    throw new Error("android.package is required in app.json for withSunmiBridge plugin");
  }

  return appPackage;
}

function withSunmiDependency(config) {
  return withAppBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.contents.includes(SUNMI_DEPENDENCY)) {
      return modConfig;
    }

    if (modConfig.modResults.language === "groovy") {
      modConfig.modResults.contents = modConfig.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    implementation \"${SUNMI_DEPENDENCY}\"`,
      );
      return modConfig;
    }

    modConfig.modResults.contents = modConfig.modResults.contents.replace(
      /dependencies\s*\{/,
      `dependencies {\n    implementation("${SUNMI_DEPENDENCY}")`,
    );

    return modConfig;
  });
}

function withSunmiQueries(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    const queries = manifest.queries || [];

    const hasScannerQuery = queries.some((item) => {
      const packages = item.package || [];
      return packages.some(
        (pkg) => pkg.$ && pkg.$["android:name"] === SCANNER_PACKAGE_NAME,
      );
    });

    if (!hasScannerQuery) {
      queries.push({
        package: [
          {
            $: {
              "android:name": SCANNER_PACKAGE_NAME,
            },
          },
        ],
      });
      manifest.queries = queries;
    }

    modConfig.modResults.manifest = manifest;
    return modConfig;
  });
}

function withSunmiMainApplication(config) {
  const appPackage = getAndroidPackage(config);

  return withMainApplication(config, (modConfig) => {
    const isKotlin =
      modConfig.modResults.language === "kt" ||
      modConfig.modResults.language === "kotlin";

    const importLine = isKotlin
      ? `import ${appPackage}.sunmi.SunmiPackage`
      : `import ${appPackage}.sunmi.SunmiPackage;`;

    if (!modConfig.modResults.contents.includes(importLine)) {
      const importBlockPattern = /(import [^\n]+\n)+/;
      if (importBlockPattern.test(modConfig.modResults.contents)) {
        modConfig.modResults.contents = modConfig.modResults.contents.replace(
          importBlockPattern,
          (imports) => `${imports}${importLine}\n`,
        );
      } else {
        modConfig.modResults.contents = modConfig.modResults.contents.replace(
          /(package [^\n]+\n)/,
          `$1\n${importLine}\n`,
        );
      }
    }

    if (isKotlin) {
      if (!modConfig.modResults.contents.includes("SunmiPackage()")) {
        modConfig.modResults.contents = modConfig.modResults.contents.replace(
          /val packages = PackageList\(this\)\.packages/,
          "val packages = PackageList(this).packages\n      packages.add(SunmiPackage())",
        );
      }
    } else if (!modConfig.modResults.contents.includes("new SunmiPackage()")) {
      modConfig.modResults.contents = modConfig.modResults.contents.replace(
        /new PackageList\(this\)\.getPackages\(\);/,
        "new PackageList(this).getPackages();\n      packages.add(new SunmiPackage());",
      );
    }

    return modConfig;
  });
}

function withSunmiNativeFiles(config) {
  const appPackage = getAndroidPackage(config);

  return withDangerousMod(config, ["android", async (modConfig) => {
    const javaRoot = path.join(
      modConfig.modRequest.platformProjectRoot,
      "app",
      "src",
      "main",
      "java",
      ...appPackage.split("."),
      "sunmi",
    );

    fs.mkdirSync(javaRoot, { recursive: true });

    fs.writeFileSync(
      path.join(javaRoot, "SunmiPackage.java"),
      createSunmiPackageSource(appPackage),
      "utf8",
    );

    fs.writeFileSync(
      path.join(javaRoot, "SunmiPrinterModule.java"),
      createSunmiPrinterSource(appPackage),
      "utf8",
    );

    fs.writeFileSync(
      path.join(javaRoot, "SunmiScanModule.java"),
      createSunmiScanSource(appPackage),
      "utf8",
    );

    return modConfig;
  }]);
}

function createSunmiPackageSource(appPackage) {
  return `package ${appPackage}.sunmi;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class SunmiPackage implements ReactPackage {
  @NonNull
  @Override
  public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
    return Arrays.asList(
        new SunmiPrinterModule(reactContext),
        new SunmiScanModule(reactContext)
    );
  }

  @NonNull
  @Override
  public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }
}
`;
}

function createSunmiPrinterSource(appPackage) {
  return `package ${appPackage}.sunmi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.sunmi.printerx.PrinterSdk;
import com.sunmi.printerx.SdkException;
import com.sunmi.printerx.api.LineApi;
import com.sunmi.printerx.style.BaseStyle;
import com.sunmi.printerx.style.TextStyle;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

public class SunmiPrinterModule extends ReactContextBaseJavaModule {
  private static final String MODULE_NAME = "SunmiPrinter";

  public SunmiPrinterModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return MODULE_NAME;
  }

  @ReactMethod
  public void printText(String text, Promise promise) {
    final String content = text == null ? "" : text.trim();
    if (content.isEmpty()) {
      promise.reject("PRINT_EMPTY", "打印内容不能为空");
      return;
    }

    final AtomicBoolean handled = new AtomicBoolean(false);

    try {
      PrinterSdk.getInstance().getPrinter(
          getReactApplicationContext(),
          new PrinterSdk.PrinterListen() {
            @Override
            public void onDefPrinter(PrinterSdk.Printer printer) {
              printWithLineApi(printer, content, promise, handled);
            }

            @Override
            public void onPrinters(List<PrinterSdk.Printer> printers) {
              if (handled.get()) {
                return;
              }

              if (printers == null || printers.isEmpty()) {
                rejectOnce(handled, promise, "PRINT_NO_DEVICE", "未发现可用打印机");
                return;
              }

              printWithLineApi(printers.get(0), content, promise, handled);
            }
          }
      );
    } catch (SdkException error) {
      rejectOnce(
          handled,
          promise,
          "PRINT_INIT_ERROR",
          error.getMessage() == null ? "初始化打印机失败" : error.getMessage()
      );
    }
  }

  private void printWithLineApi(
      PrinterSdk.Printer printer,
      String text,
      Promise promise,
      AtomicBoolean handled
  ) {
    if (printer == null) {
      rejectOnce(handled, promise, "PRINT_NO_DEVICE", "未发现可用打印机");
      return;
    }

    try {
      LineApi lineApi = printer.lineApi();
      lineApi.initLine(BaseStyle.getStyle());
      lineApi.printText(text, TextStyle.getStyle());
      lineApi.autoOut();
      resolveOnce(handled, promise, "OK");
    } catch (SdkException error) {
      rejectOnce(
          handled,
          promise,
          "PRINT_EXEC_ERROR",
          error.getMessage() == null ? "打印失败" : error.getMessage()
      );
    }
  }

  private void resolveOnce(AtomicBoolean handled, Promise promise, String value) {
    if (handled.compareAndSet(false, true)) {
      promise.resolve(value);
    }
  }

  private void rejectOnce(AtomicBoolean handled, Promise promise, String code, String message) {
    if (handled.compareAndSet(false, true)) {
      promise.reject(code, message);
    }
  }
}
`;
}

function createSunmiScanSource(appPackage) {
  return `package ${appPackage}.sunmi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SunmiScanModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private static final String MODULE_NAME = "SunmiScanModule";
  private static final String SCAN_EVENT = "onScanSuccess";
  private static final String ACTION_DATA_RECEIVED = "com.sunmi.scanner.ACTION_DATA_CODE_RECEIVED";
  private static final String ACTION_SETTING_CMD = "com.sunmi.scanner.Setting_cmd";
  private static final String CMD_KEY = "cmd";
  private static final String CMD_TRIGGER_ONCE = "#SCNTRG1";
  private static final long SCAN_TIMEOUT_MS = 10000L;

  private final Handler mainHandler = new Handler(Looper.getMainLooper());

  private BroadcastReceiver receiver;
  private boolean receiverRegistered = false;
  private Promise pendingScanPromise;
  private Runnable pendingTimeoutTask;

  public SunmiScanModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addLifecycleEventListener(this);
  }

  @Override
  public String getName() {
    return MODULE_NAME;
  }

  @ReactMethod
  public void startListen() {
    ensureReceiverRegistered();
  }

  @ReactMethod
  public void stopListen() {
    cancelPendingScan("SCAN_CANCELLED", "扫码已取消");
    unregisterReceiver();
  }

  @ReactMethod
  public void scan(Promise promise) {
    ensureReceiverRegistered();

    if (pendingScanPromise != null) {
      promise.reject("SCAN_BUSY", "已有扫码任务进行中");
      return;
    }

    pendingScanPromise = promise;

    Intent triggerIntent = new Intent(ACTION_SETTING_CMD);
    triggerIntent.setPackage("com.sunmi.scanner");
    triggerIntent.putExtra(CMD_KEY, CMD_TRIGGER_ONCE);
    getReactApplicationContext().sendBroadcast(triggerIntent);

    pendingTimeoutTask = () -> {
      if (pendingScanPromise != null) {
        pendingScanPromise.reject("SCAN_TIMEOUT", "扫码超时，请重试");
        pendingScanPromise = null;
      }
    };
    mainHandler.postDelayed(pendingTimeoutTask, SCAN_TIMEOUT_MS);
  }

  private void ensureReceiverRegistered() {
    if (receiverRegistered) {
      return;
    }

    if (receiver == null) {
      receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
          if (intent == null || !ACTION_DATA_RECEIVED.equals(intent.getAction())) {
            return;
          }

          String scanCode = extractScanCode(intent);
          if (TextUtils.isEmpty(scanCode)) {
            return;
          }

          emitScanEvent(scanCode);

          if (pendingScanPromise != null) {
            clearTimeoutTask();
            pendingScanPromise.resolve(scanCode);
            pendingScanPromise = null;
          }
        }
      };
    }

    IntentFilter filter = new IntentFilter(ACTION_DATA_RECEIVED);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      getReactApplicationContext().registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED);
    } else {
      getReactApplicationContext().registerReceiver(receiver, filter);
    }

    receiverRegistered = true;
  }

  private void unregisterReceiver() {
    if (!receiverRegistered || receiver == null) {
      return;
    }

    try {
      getReactApplicationContext().unregisterReceiver(receiver);
    } catch (IllegalArgumentException ignored) {
      // Receiver might already be unregistered.
    }

    receiverRegistered = false;
  }

  private String extractScanCode(Intent intent) {
    String[] keys = new String[] {"data", "code", "result", "SCAN_BARCODE1"};

    for (String key : keys) {
      String value = intent.getStringExtra(key);
      if (!TextUtils.isEmpty(value)) {
        return value.trim();
      }
    }

    Bundle extras = intent.getExtras();
    if (extras == null) {
      return "";
    }

    for (String key : keys) {
      Object value = extras.get(key);
      if (value instanceof String && !TextUtils.isEmpty((String) value)) {
        return ((String) value).trim();
      }
    }

    return "";
  }

  private void emitScanEvent(String code) {
    getReactApplicationContext()
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(SCAN_EVENT, code);
  }

  private void cancelPendingScan(String code, String message) {
    clearTimeoutTask();
    if (pendingScanPromise != null) {
      pendingScanPromise.reject(code, message);
      pendingScanPromise = null;
    }
  }

  private void clearTimeoutTask() {
    if (pendingTimeoutTask != null) {
      mainHandler.removeCallbacks(pendingTimeoutTask);
      pendingTimeoutTask = null;
    }
  }

  @Override
  public void onHostResume() {
    // No-op
  }

  @Override
  public void onHostPause() {
    // Keep listening in pause by default.
  }

  @Override
  public void onHostDestroy() {
    stopListen();
    getReactApplicationContext().removeLifecycleEventListener(this);
  }
}
`;
}

function withSunmiBridge(config) {
  config = withSunmiDependency(config);
  config = withSunmiQueries(config);
  config = withSunmiMainApplication(config);
  config = withSunmiNativeFiles(config);
  return config;
}

module.exports = createRunOncePlugin(withSunmiBridge, PLUGIN_NAME, PLUGIN_VERSION);
