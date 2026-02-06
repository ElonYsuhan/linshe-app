import { HomePage } from "@/views/home";
import { MyPage } from "@/views/my-page";
import { AntDesign } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function RootLayout() {
  const Tab = createBottomTabNavigator();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // ✅ 关掉顶部标题栏
        tabBarStyle: {
          height: 56 + insets.bottom, // ✅ 关键
          paddingBottom: insets.bottom, // ✅ 关键
          paddingTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          title: "首页",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="mypage"
        component={MyPage}
        options={{
          title: "我的",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
