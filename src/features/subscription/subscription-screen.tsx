import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/src/components/ui/screen-container";
import { NotificationModal } from "@/src/components/ui/notification-modal";
import { Design } from "@/src/constants/design";
import { useSubscription } from "./hooks/use-subscription";
import { SubscriptionHeader } from "./components/subscription-header";
import { SubscriptionBanner } from "./components/subscription-banner";
import { SubscriptionActiveCard } from "./components/subscription-active-card";
import { SubscriptionPlanCard } from "./components/subscription-plan-card";
import { SubscriptionFooter } from "./components/subscription-footer";
import { SubscriptionQrModal } from "./components/subscription-qr-modal";
import { styles } from "./subscription.styles";

export default function SubscriptionScreen() {
  const router = useRouter();
  const {
    plans,
    selectedPlanCode,
    selectedPlan,
    mySubscription,
    isLoading,
    isPurchasing,
    isCheckingStatus,
    isMockConfirming,
    activeTransaction,
    errorModal,
    notificationModal,
    statusMessage,
    setSelectedPlanCode,
    initPurchase,
    checkStatus,
    mockConfirm,
    closeQrModal,
    closeErrorModal,
    closeNotificationModal,
  } = useSubscription();

  return (
    <ScreenContainer scrollable contentStyle={styles.container}>
      <SubscriptionHeader onBack={() => router.back()} />

      <SubscriptionBanner />

      {mySubscription?.hasActiveSubscription ? (
        <SubscriptionActiveCard subscription={mySubscription} />
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Design.colors.primaryGreen} />
          <Text style={styles.loadingText}>Đang tải các gói cước...</Text>
        </View>
      ) : (
        <View style={styles.packageList}>
          {plans.map((pkg) => {
            const selected = pkg.code.toUpperCase() === selectedPlanCode?.toUpperCase();
            const isCurrentActivePlan =
              Boolean(mySubscription?.hasActiveSubscription) &&
              mySubscription?.planCode?.toUpperCase() === pkg.code.toUpperCase();

            return (
              <SubscriptionPlanCard
                key={pkg.code}
                plan={pkg}
                selected={selected}
                isCurrentActivePlan={isCurrentActivePlan}
                onSelect={(code) => setSelectedPlanCode(code)}
              />
            );
          })}
        </View>
      )}

      <SubscriptionFooter
        selectedPlan={selectedPlan}
        isPurchasing={isPurchasing}
        onPurchase={() => void initPurchase()}
      />

      <SubscriptionQrModal
        visible={activeTransaction !== null}
        transaction={activeTransaction}
        onClose={closeQrModal}
        onCheckStatus={checkStatus}
        isCheckingStatus={isCheckingStatus}
        onMockConfirm={mockConfirm}
        isMockConfirming={isMockConfirming}
        statusMessage={statusMessage}
      />

      <NotificationModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onConfirm={closeErrorModal}
      />

      <NotificationModal
        visible={notificationModal.visible}
        title={notificationModal.title}
        message={notificationModal.message}
        onConfirm={closeNotificationModal}
      />
    </ScreenContainer>
  );
}
