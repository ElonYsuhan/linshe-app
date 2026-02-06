import { HomePage } from "@/views/home";
import { MyPage } from "@/views/my-page";
import { AntDesign } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
export default function RootLayout() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // ✅ 关掉顶部标题栏
        tabBarStyle: {
          height: 56, // 标准高度
          paddingBottom: 4, // 防止过高
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
