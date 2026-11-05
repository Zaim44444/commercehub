import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';


const categories = ['All', 'Electronics', 'Fashion', 'Home'];

const products = [
  {
    id: '1',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 159,
    emoji: '🎧',
    color: '#EDE9FE',
  },
  {
    id: '2',
    name: 'Everyday Sneakers',
    category: 'Fashion',
    price: 129,
    emoji: '👟',
    color: '#FFEDD5',
  },
  {
    id: '3',
    name: 'Smart Watch',
    category: 'Electronics',
    price: 219,
    emoji: '⌚',
    color: '#DBEAFE',
  },
  {
    id: '4',
    name: 'Coffee Mug',
    category: 'Home',
    price: 35,
    emoji: '☕',
    color: '#DCFCE7',
  },
];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [basket, setBasket] = useState<Record<string, number>>({});
  const { signOut } = useAuth();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === 'All' || product.category === category;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const basketCount = Object.values(basket).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  function addToBasket(productId: string) {
    setBasket((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <Pressable
        onPress={() => void signOut()}
        style={{ alignSelf: 'flex-end', padding: 16 }}
      >
        <Text style={{ color: '#173E35', fontWeight: '600' }}>
          Sign out
        </Text>
      </Pressable>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={filteredProducts}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Find your next favourite</Text>
                <Text style={styles.brand}>CommerceHub</Text>
              </View>

              <View
                style={styles.basket}
                accessibilityLabel={`Basket: ${basketCount} items`}
              >
                <Text style={styles.basketText}>🛍️ {basketCount}</Text>
              </View>
            </View>

            <TextInput
              style={styles.search}
              placeholder="Search products..."
              placeholderTextColor="#78716C"
              accessibilityLabel="Search products"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />

            <View style={styles.banner}>
              <Text style={styles.bannerLabel}>THE EVERYDAY COLLECTION</Text>
              <Text style={styles.bannerTitle}>
                Little upgrades.{'\n'}Better days.
              </Text>
              <Text style={styles.bannerDescription}>
                Discover essentials for your everyday life.
              </Text>
            </View>

            <View style={styles.categories}>
              {categories.map((item) => {
                const selected = category === item;

                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.category,
                      selected && styles.selectedCategory,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.selectedCategoryText,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explore products</Text>
              <Text style={styles.resultCount}>
                {filteredProducts.length} items
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No products found. Try another search or category.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={[
                styles.productImage,
                { backgroundColor: item.color },
              ]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.productCategory}>{item.category}</Text>
              <Text style={styles.productName}>{item.name}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.price}>
                  RM {item.price.toFixed(2)}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${item.name} to basket`}
                  onPress={() => addToBasket(item.id)}
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.addText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  list: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  greeting: {
    color: '#78716C',
    fontSize: 12,
    marginBottom: 4,
  },
  brand: {
    color: '#1C1917',
    fontSize: 26,
    fontWeight: '800',
  },
  basket: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  basketText: {
    fontSize: 16,
    fontWeight: '700',
  },
  search: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: '#1C1917',
    marginBottom: 20,
  },
  banner: {
    backgroundColor: '#173E35',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  bannerLabel: {
    color: '#BBD8BD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginTop: 12,
  },
  bannerDescription: {
    color: '#D1E1DA',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 26,
  },
  category: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#ECEAE5',
  },
  selectedCategory: {
    backgroundColor: '#173E35',
  },
  categoryText: {
    color: '#57534E',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1917',
  },
  resultCount: {
    fontSize: 12,
    color: '#78716C',
  },
  productRow: {
    gap: 12,
  },
  card: {
    flex: 1,
    maxWidth: '50%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEAE5',
  },
  productImage: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 60,
  },
  cardBody: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    color: '#78716C',
    marginBottom: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    minHeight: 38,
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#173E35',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#173E35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 28,
  },
  empty: {
    textAlign: 'center',
    color: '#78716C',
    paddingVertical: 40,
    lineHeight: 22,
  },
});