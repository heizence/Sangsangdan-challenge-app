import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import {
  MainTabParamList,
  ChallengeStackParamList,
  ProofFeedStackParamList,
  MyPageStackParamList,
} from "../types/navigation";

// 각 탭에 해당하는 화면 컴포넌트
import ChallengeListScreen from "../screens/ChallengeListScreen";
import ChallengeDetailScreen from "../screens/ChallengeDetailScreen";
import ProofFeedScreen from "../screens/ProofFeedScreen";
import ProofDetailScreen from "../screens/ProofDetailScreen";
import MyPageScreen from "../screens/MyPageScreen";
import MyChallengesScreen from "../screens/MyChallengesScreen";
import MyProofsScreen from "../screens/MyProofsScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();
const ChallengeStack = createStackNavigator<ChallengeStackParamList>();
const ProofFeedStack = createStackNavigator<ProofFeedStackParamList>();
const MyPageStack = createStackNavigator<MyPageStackParamList>();

// 챌린지 탭 내 화면 전환을 위한 스택 네비게이터
const ChallengeStackNavigator = () => (
  <ChallengeStack.Navigator>
    <ChallengeStack.Screen
      name="ChallengeList"
      component={ChallengeListScreen}
      options={{ title: "챌린지 탐색" }}
    />
    <ChallengeStack.Screen
      name="ChallengeDetail"
      component={ChallengeDetailScreen}
      options={{ title: "챌린지 상세" }}
    />
  </ChallengeStack.Navigator>
);

// 인증 피드 탭 내 화면 전환을 위한 스택 네비게이터
const ProofFeedStackNavigator = () => (
  <ProofFeedStack.Navigator>
    <ProofFeedStack.Screen
      name="ProofFeed"
      component={ProofFeedScreen}
      options={{ title: "인증 피드" }}
    />
    <ProofFeedStack.Screen
      name="ProofDetail"
      component={ProofDetailScreen}
      options={{ title: "인증 상세" }}
    />
  </ProofFeedStack.Navigator>
);

// 마이페이지 탭 내 화면 전환을 위한 스택 네비게이터
const MyPageStackNavigator = () => (
  <MyPageStack.Navigator>
    <MyPageStack.Screen name="MyPage" component={MyPageScreen} options={{ title: "마이페이지" }} />
    <MyPageStack.Screen
      name="MyChallenges"
      component={MyChallengesScreen}
      options={{ title: "나의 챌린지" }}
    />
    <MyPageStack.Screen
      name="MyProofs"
      component={MyProofsScreen}
      options={{ title: "나의 인증" }}
    />
    <ChallengeStack.Screen
      name="ChallengeDetail"
      component={ChallengeDetailScreen}
      options={{ title: "챌린지 상세" }}
    />
    <ProofFeedStack.Screen
      name="ProofDetail"
      component={ProofDetailScreen}
      options={{ title: "인증 상세" }}
    />
  </MyPageStack.Navigator>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "alert-circle";
          if (route.name === "ChallengeTab") {
            iconName = focused ? "compass" : "compass-outline";
          } else if (route.name === "ProofFeedTab") {
            iconName = focused ? "checkmark-done-circle" : "checkmark-done-circle-outline";
          } else if (route.name === "MyPageTab") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3498DB",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="ChallengeTab"
        component={ChallengeStackNavigator}
        options={{ title: "챌린지 탐색" }}
      />
      <Tab.Screen
        name="ProofFeedTab"
        component={ProofFeedStackNavigator}
        options={{ title: "인증 피드" }}
      />
      <Tab.Screen
        name="MyPageTab"
        component={MyPageStackNavigator}
        options={{ title: "마이페이지" }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
