import {
  InsufficientRubyModal,
  PurchaseSuccessModal,
} from '@/src/components/home/purchase-success-modal';
import { ShopSheet } from '@/src/components/home/shop-sheet';
import { DailyTaskModals } from '@/src/features/tasks/components/daily-task-modals';
import type { ShopItem } from '@/src/types/api/shop';
import type { Task } from '@/src/types/api/task';

type HomeShopAndTaskModalsProps = {
  rubyBalance: number | null;
  isShopVisible: boolean;
  purchasedShopItem: ShopItem | null;
  insufficientRubyItem: ShopItem | null;
  insufficientRubyMessage: string;
  isDailyStatusVisible: boolean;
  isConfirmingDailyTasks: boolean;
  yesterdayTasks: Task[];
  onBalanceChange: (balance: number) => void;
  onInsufficientRuby: (item: ShopItem, message: string) => void;
  onCloseShop: () => void;
  onPurchaseSuccess: (item: ShopItem, remainingRuby: number) => void;
  onClosePurchaseSuccess: () => void;
  onCloseInsufficientRuby: () => void;
  onTopUpRuby: () => void;
  onCloseDailyStatus: () => void;
  onKeepYesterdayTasks: () => void;
  onChooseNewTasks: () => void;
};

export function HomeShopAndTaskModals({
  rubyBalance,
  isShopVisible,
  purchasedShopItem,
  insufficientRubyItem,
  insufficientRubyMessage,
  isDailyStatusVisible,
  isConfirmingDailyTasks,
  yesterdayTasks,
  onBalanceChange,
  onInsufficientRuby,
  onCloseShop,
  onPurchaseSuccess,
  onClosePurchaseSuccess,
  onCloseInsufficientRuby,
  onTopUpRuby,
  onCloseDailyStatus,
  onKeepYesterdayTasks,
  onChooseNewTasks,
}: HomeShopAndTaskModalsProps) {
  return (
    <>
      <ShopSheet
        balance={rubyBalance}
        onBalanceChange={onBalanceChange}
        onInsufficientRuby={onInsufficientRuby}
        onClose={onCloseShop}
        onPurchaseSuccess={onPurchaseSuccess}
        visible={isShopVisible}
      />
      <PurchaseSuccessModal
        balance={rubyBalance ?? 0}
        onClose={onClosePurchaseSuccess}
        product={purchasedShopItem}
      />
      <InsufficientRubyModal
        balance={rubyBalance}
        message={insufficientRubyMessage}
        onClose={onCloseInsufficientRuby}
        onTopUp={onTopUpRuby}
        product={insufficientRubyItem}
        visible={insufficientRubyItem !== null}
      />
      <DailyTaskModals
        completedStreak={null}
        dailyStatusVisible={isDailyStatusVisible}
        isConfirmingDailyTasks={isConfirmingDailyTasks}
        isSwapping={false}
        isSwapLoading={false}
        onCancelStreak={() => undefined}
        onCloseDailyStatus={onCloseDailyStatus}
        onCloseSwap={() => undefined}
        onCloseSwapSuccess={() => undefined}
        onConfirmSwap={() => undefined}
        onKeepYesterdayTasks={onKeepYesterdayTasks}
        onOpenMoodSelection={onChooseNewTasks}
        streakVisible={false}
        swapCandidates={[]}
        swapTask={null}
        swapSuccessVisible={false}
        yesterdayTasks={yesterdayTasks}
      />
    </>
  );
}
