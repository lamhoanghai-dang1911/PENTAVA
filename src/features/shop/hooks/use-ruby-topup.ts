import { useCallback, useEffect, useRef, useState } from "react";
import { shopService } from "@/src/services/shopService";
import type {
  InitTopupRequest,
  InitTopupResponse,
  TopupPackage,
  TopupPackagesResponse,
} from "@/src/types/api/shop";

export function useRubyTopup() {
  const [topupPricing, setTopupPricing] = useState<TopupPackagesResponse | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [pricingRetryCount, setPricingRetryCount] = useState(0);
  const [rubyInput, setRubyInput] = useState("");
  const [transaction, setTransaction] = useState<InitTopupResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [rubyBalance, setRubyBalance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingPackageCode, setSubmittingPackageCode] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const isCheckingStatusRef = useRef(false);

  const rubyAmount = Number(rubyInput);
  const amountVnd = rubyAmount * (topupPricing?.baseRateVndPerRuby ?? 0);
  const maxRubyAmount = topupPricing
    ? Math.floor(Number.MAX_SAFE_INTEGER / topupPricing.baseRateVndPerRuby)
    : 0;
  const isValidAmount =
    topupPricing !== null &&
    Number.isSafeInteger(rubyAmount) &&
    rubyAmount >= topupPricing.minCustomTopupRuby &&
    rubyAmount <= maxRubyAmount;

  const handleRubyInputChange = (value: string) => {
    setRubyInput(value.replace(/\D/g, ""));
    setErrorMessage(null);
  };

  useEffect(() => {
    let isMounted = true;

    void shopService.getTopupPackages()
      .then((pricing) => {
        if (isMounted) setTopupPricing(pricing);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setPricingError(
            error instanceof Error ? error.message : "Không thể tải bảng giá nạp Ruby.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingPricing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pricingRetryCount]);

  const retryLoadingPricing = () => {
    setIsLoadingPricing(true);
    setPricingError(null);
    setPricingRetryCount((count) => count + 1);
  };

  const handleCreateTopup = async (request: InitTopupRequest) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmittingPackageCode(request.packageCode ?? null);
    setErrorMessage(null);
    setTransaction(null);
    try {
      const result = await shopService.initTopup(request);
      setTransaction(result);
      setStatusError(null);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể khởi tạo giao dịch nạp Ruby.",
      );
    } finally {
      setIsSubmitting(false);
      setSubmittingPackageCode(null);
    }
  };

  const handleBuyPackage = (pack: TopupPackage) => {
    void handleCreateTopup({
      packageCode: pack.code,
      rubyAmount: pack.rubyAmount,
      amountVnd: pack.priceVnd,
    });
  };

  const handleCustomSubmit = () => {
    void handleCreateTopup({ amountVnd });
  };

  const checkTransactionStatus = useCallback(async () => {
    const transactionCode = transaction?.transactionCode;
    if (
      !transactionCode ||
      transaction.status !== "PENDING" ||
      isCheckingStatusRef.current
    ) {
      return;
    }

    isCheckingStatusRef.current = true;
    setIsCheckingStatus(true);
    try {
      const history = await shopService.getTopupHistory();
      const updatedTransaction = history.find(
        (item) => item.transactionCode === transactionCode,
      );

      if (!updatedTransaction) {
        setStatusError("Chưa tìm thấy giao dịch trong lịch sử. Hệ thống sẽ tiếp tục kiểm tra.");
        return;
      }

      setStatusError(null);
      if (updatedTransaction.status !== transaction.status) {
        setTransaction((current) =>
          current?.transactionCode === transactionCode
            ? {
                ...current,
                status: updatedTransaction.status,
              }
            : current,
        );
      }

      if (updatedTransaction.status === "SUCCESS") {
        const wallet = await shopService.getMyWallet();
        setRubyBalance(wallet.rubyBalance);
      }
    } catch (error: unknown) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Không thể kiểm tra trạng thái giao dịch.",
      );
    } finally {
      isCheckingStatusRef.current = false;
      setIsCheckingStatus(false);
    }
  }, [transaction]);

  useEffect(() => {
    if (!transaction || transaction.status !== "PENDING") return;

    const initialCheck = setTimeout(() => {
      void checkTransactionStatus();
    }, 0);
    const interval = setInterval(() => {
      void checkTransactionStatus();
    }, 5000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [transaction, checkTransactionStatus]);

  return {
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
  };
}
