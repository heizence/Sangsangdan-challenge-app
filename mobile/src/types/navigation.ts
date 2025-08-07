import { StackScreenProps } from "@react-navigation/stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";

// 최상위 스택 네비게이터 (로그인 / 메인)
export type RootStackParamList = {
  Login: undefined;
  MainNavigator: undefined;
};

export type LoginScreenProps = StackScreenProps<RootStackParamList, "Login">;

// 메인 탭 네비게이터
export type MainTabParamList = {
  ChallengeTab: undefined;
  ProofFeedTab: undefined;
  MyPageTab: undefined;
};

// 챌린지 탭 내의 스택 네비게이터
export type ChallengeStackParamList = {
  ChallengeList: undefined;
  ChallengeDetail: { challengeId: number };
};

// 인증 피드 탭 내의 스택 네비게이터
export type ProofFeedStackParamList = {
  ProofFeed: undefined;
  ProofDetail: { proofId: number };
};

// 마이페이지 탭 내의 스택 네비게이터
export type MyPageStackParamList = {
  MyPage: undefined;
  MyChallenges: undefined;
  MyProofs: undefined;
};

// 인증 제출은 모달 형태로 어느 화면에서든 띄울 수 있도록 Root 스택에 추가
export type AppStackParamList = RootStackParamList & {
  CreateProof: undefined;
};

// 각 화면 컴포넌트에서 사용할 Props 타입 정의
export type ChallengeListScreenProps = CompositeScreenProps<
  StackScreenProps<ChallengeStackParamList, "ChallengeList">,
  BottomTabScreenProps<MainTabParamList>
>;

export type ChallengeDetailScreenProps = StackScreenProps<
  ChallengeStackParamList,
  "ChallengeDetail"
>;

export type ProofFeedScreenProps = CompositeScreenProps<
  StackScreenProps<ProofFeedStackParamList, "ProofFeed">,
  BottomTabScreenProps<MainTabParamList>
>;
