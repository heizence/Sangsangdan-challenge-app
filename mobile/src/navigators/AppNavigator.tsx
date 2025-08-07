import "react-native-gesture-handler";
import React, { useContext, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { AppStackParamList } from "@/types/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateProofScreen from "@/screens/CreateProofScreen";
import LoginScreen from "@/screens/LoginScreen";
import { AuthContext } from "@/context/AuthContext";
import { createTrpcLink, trpc } from "@/utils/trpc";
import MainTabNavigator from "./MainTabNavigator";

const queryClient = new QueryClient();
const Stack = createStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  const { token, isLoading } = useContext(AuthContext);

  const trpcClient = useMemo(() => {
    return trpc.createClient({
      links: [createTrpcLink(token)],
    });
  }, [token]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack.Navigator>
          {token ? (
            <>
              <Stack.Screen
                name="MainNavigator"
                component={MainTabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateProof"
                component={CreateProofScreen}
                options={{ presentation: "modal", title: "인증 제출하기" }}
              />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default AppNavigator;
