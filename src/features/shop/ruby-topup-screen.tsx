import { router } from "expo-router";
import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomTopupForm } from "./components/custom-topup-form";
import { TopupHeader } from "./components/topup-header";
import { TopupPackagesList } from "./components/topup-packages-list";
import { TopupQrModal } from "./components/topup-qr-modal";
import { TopupRateCard } from "./components/topup-rate-card";
import { useRubyTopup } from "./hooks/use-ruby-topup";
import { styles } from "./shop.styles";

export default function RubyTopupScreen() {
  const {
    topupPricing,
    pricingError,
    isLoadingPricing,
    retryLoadingPricing,
    rubyInput,
    handleRubyInputChange,
    amountVnd,
    isValidAmount,
    isSubmitting,
    submittingPackageCode,
    errorMessage,
    transaction,
    rubyBalance,
    isCheckingStatus,
    statusError,
    handleBuyPackage,
    handleCustomSubmit,
    checkTransactionStatus,
    closeTransaction,
  } = useRubyTopup();

  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "android" ? 12 : 0}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.content, { paddingBottom: 60 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TopupHeader onBack={handleBack} />

          <TopupRateCard
            error={pricingError}
            isLoading={isLoadingPricing}
            onRetry={retryLoadingPricing}
            pricing={topupPricing}
          />

          <TopupPackagesList
            isLoading={isLoadingPricing}
            isSubmitting={isSubmitting}
            onBuyPackage={handleBuyPackage}
            pricing={topupPricing}
            submittingPackageCode={submittingPackageCode}
          />

          <CustomTopupForm
            amountVnd={amountVnd}
            errorMessage={errorMessage}
            isSubmitting={isSubmitting}
            isValidAmount={isValidAmount}
            onChangeRubyInput={handleRubyInputChange}
            onFocus={handleInputFocus}
            onSubmit={handleCustomSubmit}
            pricing={topupPricing}
            rubyInput={rubyInput}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <TopupQrModal
        isCheckingStatus={isCheckingStatus}
        onCheckStatus={() => void checkTransactionStatus()}
        onClose={closeTransaction}
        rubyBalance={rubyBalance}
        statusError={statusError}
        transaction={transaction}
        visible={transaction !== null}
      />
    </SafeAreaView>
  );
}
