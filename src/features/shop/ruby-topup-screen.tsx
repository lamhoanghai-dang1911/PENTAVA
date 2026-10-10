import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useRubyTopup } from "./hooks/use-ruby-topup";
import { TopupHeader } from "./components/topup-header";
import { TopupRateCard } from "./components/topup-rate-card";
import { TopupPackagesList } from "./components/topup-packages-list";
import { CustomTopupForm } from "./components/custom-topup-form";
import { TopupTransactionCard } from "./components/topup-transaction-card";
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
  } = useRubyTopup();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
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
            onSubmit={handleCustomSubmit}
            pricing={topupPricing}
            rubyInput={rubyInput}
          />

          {transaction ? (
            <TopupTransactionCard
              isCheckingStatus={isCheckingStatus}
              onCheckStatus={() => void checkTransactionStatus()}
              rubyBalance={rubyBalance}
              statusError={statusError}
              transaction={transaction}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
