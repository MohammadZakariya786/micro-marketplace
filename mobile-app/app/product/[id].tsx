import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApp } from '@/context/app-context';

type Product = {
  _id: string;
  title: string;
  price: number;
  description: string;
  image: string;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favorites, fetchProductById, toggleFavorite } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const found = await fetchProductById(String(id));
        if (!found) setError('Product not found');
        setProduct(found);
      } catch (e: any) {
        setError(e?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }, [fetchProductById, id]);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = favorites.includes(String(id));

  const onToggleFavorite = async () => {
    if (!id || pending) return;
    setPending(true);
    setError('');
    try {
      await toggleFavorite(String(id));
    } catch (e: any) {
      setError(e?.message || 'Failed to update favorite');
    } finally {
      setPending(false);
    }
  };

  if (loading) return <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 20 }} />;
  if (error && !product) return <Text style={styles.errorOnly}>{error}</Text>;
  if (!product) return <Text style={styles.errorOnly}>No product data.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
        <Text style={styles.desc}>{product.description}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            disabled={pending}
            onPress={onToggleFavorite}
            style={[styles.heartBtn, isFavorite ? styles.heartBtnActive : null]}>
            <Ionicons name="heart" size={18} color={isFavorite ? '#e11d48' : '#64748b'} />
          </Pressable>

          <Link href="/(tabs)" asChild>
            <Pressable style={styles.backBtn}>
              <Text style={styles.backText}>Back to products</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14, backgroundColor: '#f8fafc', gap: 10, minHeight: '100%' },
  image: { width: '100%', height: 280, borderRadius: 12, backgroundColor: '#e2e8f0' },
  content: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  price: { color: '#0f172a', fontWeight: '700', fontSize: 18 },
  desc: { color: '#475569', lineHeight: 20 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  heartBtn: {
    width: 38,
    height: 38,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  heartBtnActive: { borderColor: '#fb7185', backgroundColor: '#fff1f2' },
  backBtn: { backgroundColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  backText: { color: '#0f172a', fontWeight: '600' },
  error: { color: '#b91c1c', fontWeight: '600' },
  errorOnly: { marginTop: 20, textAlign: 'center', color: '#b91c1c', fontWeight: '600' },
});
