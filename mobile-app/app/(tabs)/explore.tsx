import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApp } from '@/context/app-context';

type Product = {
  _id: string;
  title: string;
  price: number;
  description: string;
  image: string;
};

export default function FavoritesScreen() {
  const { favorites, fetchProducts, toggleFavorite } = useApp();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchProducts(1, 100, '');
        setAllProducts(response.products || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    }, [fetchProducts]);

  useEffect(() => {
    load();
  }, [load]);

  const favoriteProducts = useMemo(
    () => allProducts.filter((item) => favorites.includes(String(item._id))),
    [allProducts, favorites]
  );

  const removeFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
    } catch (e: any) {
      setError(e?.message || 'Failed to update favorites');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Products</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? <ActivityIndicator size="small" color="#2563eb" style={styles.loader} /> : null}

      {!loading && favoriteProducts.length === 0 ? (
        <Text style={styles.emptyText}>No favorite products yet.</Text>
      ) : null}

      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable style={[styles.heartBtn, styles.heartBtnActive]} onPress={() => removeFavorite(item._id)}>
              <Ionicons name="heart" size={18} color="#e11d48" />
            </Pressable>

            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.productTitle}>{item.title}</Text>
            <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
            <Text style={styles.desc} numberOfLines={2}>
              {item.description}
            </Text>
            <Link href={`/product/${item._id}` as any} asChild>
              <Pressable style={styles.detailBtn}>
                <Text style={styles.detailBtnText}>Details</Text>
              </Pressable>
            </Link>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 14, gap: 10 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  errorText: { color: '#b91c1c', fontWeight: '600' },
  loader: { marginVertical: 4 },
  emptyText: { color: '#475569', fontWeight: '600' },
  list: { gap: 10, paddingBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    gap: 6,
    position: 'relative',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    zIndex: 2,
  },
  heartBtnActive: {
    borderColor: '#fb7185',
    backgroundColor: '#fff1f2',
  },
  image: { width: '100%', height: 160, borderRadius: 10, backgroundColor: '#e2e8f0' },
  productTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', paddingRight: 40 },
  price: { fontWeight: '700', color: '#0f172a' },
  desc: { color: '#475569' },
  detailBtn: {
    marginTop: 2,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignSelf: 'flex-start',
  },
  detailBtnText: { color: '#0f172a', fontWeight: '600' },
});
