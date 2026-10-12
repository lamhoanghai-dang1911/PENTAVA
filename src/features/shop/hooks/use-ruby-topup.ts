import { useCallback, useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { shopService } from "@/src/services/shopService";
import { formatVnd } from "../utils/shop-utils";
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

  const handleRubyInputBlur = () => {
    if (!rubyInput.trim() || !topupPricing) return;
    const parsed = Number(rubyInput);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      setErrorMessage("Vui lòng nhập số Ruby hợp lệ.");
      return;
    }
    if (parsed < topupPricing.minCustomTopupRuby) {
      setErrorMessage(
        `Số Ruby nạp tối thiểu là ${topupPricing.minCustomTopupRuby} Ruby (${formatVnd(topupPricing.minCustomTopupVnd)}).`,
      );
    }
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

  useEffect(() => {
    let isMounted = true;
    void shopService
      .getMyWallet()
      .then((wallet) => {
        if (isMounted) setRubyBalance(wallet.rubyBalance);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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
    if (isSubmitting) return;

    if (!topupPricing) {
      setErrorMessage("Chưa tải được thông tin bảng giá.");
      return;
    }

    const trimmed = rubyInput.trim();
    if (!trimmed) {
      setErrorMessage("Vui lòng nhập số Ruby muốn nạp.");
      return;
    }

    const parsedRuby = Number(trimmed);
    if (!Number.isSafeInteger(parsedRuby) || parsedRuby <= 0) {
      setErrorMessage("Vui lòng nhập số Ruby hợp lệ.");
      return;
    }

    if (parsedRuby < topupPricing.minCustomTopupRuby) {
      setErrorMessage(
        `Số Ruby nạp tối thiểu là ${topupPricing.minCustomTopupRuby} Ruby (${formatVnd(topupPricing.minCustomTopupVnd)}).`,
      );
      return;
    }

    if (parsedRuby > maxRubyAmount) {
      setErrorMessage("Số Ruby nạp vượt quá giới hạn cho phép.");
      return;
    }

    setErrorMessage(null);
    void handleCreateTopup({
      rubyAmount: parsedRuby,
      amountVnd: parsedRuby * topupPricing.baseRateVndPerRuby,
    });
  };

  const checkTransactionStatus = useCallback(async (isManual = false) => {
    const transactionCode = transaction?.transactionCode;
    if (
      !transactionCode ||
      transaction.status !== "PENDING" ||
      isCheckingStatusRef.current
    ) {
      return;
    }

    isCheckingStatusRef.current = true;
    if (isManual) {
      setIsCheckingStatus(true);
      setStatusError(null);
    }

    try {
      const history = await shopService.getTopupHistory();
      const updatedTransaction = history.find(
        (item) => item.transactionCode === transactionCode,
      );

      if (!updatedTransaction) {
        if (isManual) {
          setStatusError("Đang chờ ngân hàng xác nhận giao dịch...");
        }
        return;
      }

      if (isManual) {
        setStatusError(null);
      }

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
        try {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // ignore haptics error if not supported
        }
        const wallet = await shopService.getMyWallet(true);
        setRubyBalance(wallet.rubyBalance);
      } else if (isManual && updatedTransaction.status === "PENDING") {
        setStatusError("Giao dịch đang chờ ngân hàng xử lý. Hệ thống sẽ tự động cập nhật ngay khi nhận được tiền.");
      }
    } catch (error: unknown) {
      if (isManual) {
        setStatusError(
          error instanceof Error
            ? error.message
            : "Không thể kiểm tra trạng thái giao dịch.",
        );
      }
    } finally {
      isCheckingStatusRef.current = false;
      if (isManual) {
        setIsCheckingStatus(false);
      }
    }
  }, [transaction]);

  useEffect(() => {
    if (!transaction || transaction.status !== "PENDING") return;

    // Tự động kiểm tra ngầm mỗi 3.5 giây, không làm giật lag giao diện
    const interval = setInterval(() => {
      void checkTransactionStatus(false);
    }, 3500);

    return () => {
      clearInterval(interval);
    };
  }, [transaction, checkTransactionStatus]);

  const handleCloseTransaction = () => {
    setTransaction(null);
    setStatusError(null);
  };

  return {
    topupPricing,
    pricingError,
    isLoadingPricing,
    retryLoadingPricing,
    rubyInput,
    handleRubyInputChange,
    handleRubyInputBlur,
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
    checkTransactionStatus: () => void checkTransactionStatus(true),
    handleCloseTransaction,
  };
}
