import type {
  InitTopupResponse,
  TopupPackage,
  TopupPackagesResponse,
} from "@/src/types/api/shop";

export type DetailRowProps = {
  label: string;
  value: string;
};

export type TopupHeaderProps = {
  onBack: () => void;
};

export type TopupRateCardProps = {
  isLoading: boolean;
  pricing: TopupPackagesResponse | null;
  error: string | null;
  onRetry: () => void;
};

export type TopupPackagesListProps = {
  isLoading: boolean;
  pricing: TopupPackagesResponse | null;
  isSubmitting: boolean;
  submittingPackageCode: string | null;
  onBuyPackage: (pkg: TopupPackage) => void;
};

export type CustomTopupFormProps = {
  pricing: TopupPackagesResponse | null;
  rubyInput: string;
  onChangeRubyInput: (value: string) => void;
  amountVnd: number;
  isValidAmount: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: () => void;
};

export type TopupTransactionCardProps = {
  transaction: InitTopupResponse;
  rubyBalance: number | null;
  isCheckingStatus: boolean;
  statusError: string | null;
  onCheckStatus: () => void;
};
