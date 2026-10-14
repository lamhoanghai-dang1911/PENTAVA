import {
  InsufficientRubyModal,
  PurchaseSuccessModal,
} from '@/src/components/home/purchase-success-modal';
import { ShopSheet } from '@/src/components/home/shop-sheet';
import { DailyTaskModals } from '@/src/features/tasks/components/daily-task-modals';
import type { ShopItem } from '@/src/types/api/shop';
import type { Task } from '@/src/types/api/task';
import { memo } from 'react';

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

export const HomeShopAndTaskModals = memo(function HomeShopAndTaskModals({
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
      {isShopVisible && (
        <ShopSheet
          balance={rubyBalance}
          onBalanceChange={onBalanceChange}
          onClose={onCloseShop}
          onInsufficientRuby={onInsufficientRuby}
          onPurchaseSuccess={onPurchaseSuccess}
          onTopUpRuby={onTopUpRuby}
          visible={isShopVisible}
        />
      )}
      {!isShopVisible && purchasedShopItem && (
        <PurchaseSuccessModal
          balance={rubyBalance ?? 0}
          onClose={onClosePurchaseSuccess}
          product={purchasedShopItem}
        />
      )}
      {!isShopVisible && insufficientRubyItem && (
        <InsufficientRubyModal
          balance={rubyBalance}
          message={insufficientRubyMessage}
          onClose={onCloseInsufficientRuby}
          onTopUp={onTopUpRuby}
          product={insufficientRubyItem}
          visible={true}
        />
      )}
      {isDailyStatusVisible && (
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
      )}
    </>
  );
});
