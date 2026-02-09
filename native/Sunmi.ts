import { NativeModules, Platform } from 'react-native';

const { SunmiPrinter } = NativeModules;
console.log('SunmiPrinterModule:', SunmiPrinter);


export function printText(text: string) {
    if (Platform.OS !== 'android') return;
    console.log('SunmiPrinterModule:', SunmiPrinter);

    return SunmiPrinter.printText(text)
        .then((res: string) => {
            console.log('🖨️ 打印成功:', res);
        })
        .catch((err: any) => {
            console.error('❌ 打印失败:', err);
        });
}
