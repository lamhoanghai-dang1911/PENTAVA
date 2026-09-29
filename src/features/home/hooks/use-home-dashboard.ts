import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { authService } from '@/src/services/authService';
import { onboardingService } from '@/src/services/onboardingService';
import { shopService } from '@/src/services/shopService';

export function useHomeDashboard() {
  const [profileName, setProfileName] = useState('');
  const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [rubyBalance, setRubyBalance] = useState<number | null>(null);
  const [isRubyBalanceLoading, setIsRubyBalanceLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const timeout = setTimeout(() => {
      void authService
        .getProfile()
        .then((profile) => {
          if (isMounted) setProfileName(profile.name);
        })
        .catch((error: Error) => {
          if (isMounted) {
            Alert.alert('Không thể tải thông tin tài khoản', error.message);
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([onboardingService.getCurrentGoal(), onboardingService.getCurrentStreak()])
      .then(([goalResponse, streakResponse]) => {
        if (isMounted) {
          setCurrentGoalId(goalResponse.currentGoal?.goalId ?? null);
          setCurrentStreak(streakResponse.streak?.currentStreak ?? 0);
        }
      })
      .catch((error: Error) => {
        if (isMounted) Alert.alert('Không thể tải mục tiêu', error.message);
      });

    void shopService
      .getMyWallet()
      .then((wallet) => {
        if (isMounted) setRubyBalance(wallet.rubyBalance);
      })
      .catch((error: Error) => {
        if (isMounted) Alert.alert('Không thể tải số dư Ruby', error.message);
      })
      .finally(() => {
        if (isMounted) setIsRubyBalanceLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    profileName,
    currentGoalId,
    currentStreak,
    rubyBalance,
    isRubyBalanceLoading,
    setRubyBalance,
  };
}
