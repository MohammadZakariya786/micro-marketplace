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
  TextInput,
  View,
} from 'react-native';

import { useApp } from '@/context/app-context';

const PAGE_SIZE = 5;

export default function ProductsScreen() {
  const { favorites, toggleFavorite, fetchProducts, logout, userName } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const loadProducts = useCallback(async (targetPage: number, targetSearch: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchProducts(targetPage, PAGE_SIZE, targetSearch);
      setProducts(response.products || []);
      setTotal(response.total || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  useEffect(() => {
    loadProducts(page, search);
  }, [loadProducts, page, search]);

  const onToggleFavorite = async (id: string) => {
    if (pendingIds.includes(id)) return;
    setPendingIds((prev) => [...prev, id]);
    try {
      await toggleFavorite(id);
    } catch (e: any) {
      setError(e?.message || 'Failed to toggle favorite');
    } finally {
      setPendingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Products</Text>
          {userName ? <Text style={styles.welcome}>Welcome, {userName}</Text> : null}
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <TextInput
        value={search}
        onChangeText={(value) => {
          setPage(1);
          setSearch(value);
        }}
        placeholder="Search by title..."
        style={styles.searchInput}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? <ActivityIndicator size="small" color="#2563eb" style={styles.loader} /> : null}

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isFavorite = favorites.includes(String(item._id));
          const isPending = pendingIds.includes(String(item._id));
          return (
            <View style={styles.card}>
              <Pressable
                disabled={isPending}
                style={[styles.heartBtn, isFavorite ? styles.heartBtnActive : null]}
                onPress={() => onToggleFavorite(String(item._id))}>
                <Ionicons name="heart" size={18} color={isFavorite ? '#e11d48' : '#64748b'} />
              </Pressable>

              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.content}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
                <Text style={styles.desc} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <Link href={`/product/${item._id}` as any} asChild>
                <Pressable style={styles.detailBtn}>
                  <Text style={styles.detailBtnText}>Details</Text>
                </Pressable>
              </Link>
            </View>
          );
        }}
      />

      <View style={styles.pager}>
        <Pressable
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
          style={[styles.pageBtn, (page <= 1 || loading) && styles.pageBtnDisabled]}>
          <Text style={styles.pageBtnText}>Previous</Text>
        </Pressable>
        <Text style={styles.pageLabel}>
          Page {page}/{totalPages}
        </Text>
        <Pressable
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
          style={[styles.pageBtn, (page >= totalPages || loading) && styles.pageBtnDisabled]}>
          <Text style={styles.pageBtnText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 14, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  welcome: { marginTop: 2, color: '#166534', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#111827', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  logoutText: { color: '#fff', fontWeight: '600' },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  errorText: { color: '#b91c1c', fontWeight: '600' },
  loader: { marginVertical: 4 },
  list: { gap: 10, paddingBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    gap: 10,
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
  content: { gap: 4 },
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
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pageBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnText: { color: '#fff', fontWeight: '600' },
  pageLabel: { color: '#0f172a', fontWeight: '600' },
});
