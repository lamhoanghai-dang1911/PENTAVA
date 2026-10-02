import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WardrobeContent } from './components/wardrobe-content';
import { WardrobeHeader } from './components/wardrobe-header';
import { useWardrobe } from './hooks/use-wardrobe';
import { styles } from './wardrobe.styles';

export default function WardrobeScreen() {
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
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <WardrobeHeader
        inventoryCount={inventory.length}
        onBack={() => router.back()}
      />
      <WardrobeContent
        actionError={actionError}
        activeItemId={activeItemId}
        avatar={avatar}
        error={error}
        inventory={inventory}
        isLoading={isLoading}
        onEquip={(item) => void handleEquip(item)}
        onRefresh={loadWardrobe}
        onUnequip={(item) => void handleUnequip(item)}
        sortedInventory={sortedInventory}
      />
    </SafeAreaView>
  );
}
