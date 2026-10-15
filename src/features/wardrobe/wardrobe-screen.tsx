import { useAppTheme } from '@/src/context/theme-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WardrobeContent } from './components/wardrobe-content';
import { WardrobeHeader } from './components/wardrobe-header';
import { useWardrobe } from './hooks/use-wardrobe';
import { styles } from './wardrobe.styles';

export default function WardrobeScreen() {
  const { isNight } = useAppTheme();
  const {
    avatar,
    inventory,
    isLoading,
    error,
    actionError,
    activeItemId,
    sortedInventory,
    loadWardrobe,
    handleEquip,
    handleUnequip,
  } = useWardrobe();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, isNight && { backgroundColor: '#0B132B' }]}>
      <WardrobeHeader
        inventoryCount={inventory.length}
        isNight={isNight}
      />
      <WardrobeContent
        actionError={actionError}
        activeItemId={activeItemId}
        avatar={avatar}
        error={error}
        inventory={inventory}
        isLoading={isLoading}
        isNight={isNight}
        onEquip={(item) => void handleEquip(item)}
        onRefresh={loadWardrobe}
        onUnequip={(item) => void handleUnequip(item)}
        sortedInventory={sortedInventory}
      />
    </SafeAreaView>
  );
}
