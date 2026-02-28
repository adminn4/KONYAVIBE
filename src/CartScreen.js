import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from './CartContext';

const CartScreen = ({ navigation }) => {
  const { cart, removeFromCart, getTotalPrice, clearCart } = useCart();

  const removeItem = (id) => {
    Alert.alert("Sil", "Bu bileti sepetten çıkarmak istiyor musun?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkar", style: "destructive", onPress: () => removeFromCart(id) }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.eventImage || item.image }} style={styles.itemImage} />
       
      <View style={styles.itemInfo}>
        <Text style={styles.eventName}>{item.eventName}</Text>
        <Text style={styles.venueDate}>{item.venue} • {item.date}</Text>
        
        <View style={styles.ticketDetails}>
          {item.tickets.map((t, index) => (
            <Text key={index} style={styles.ticketText}>
              {t.count}x {t.name}
            </Text>
          ))}
        </View>

        <Text style={styles.itemPrice}>{item.totalPrice} ₺</Text>
      </View>

      <TouchableOpacity onPress={() => removeItem(item.uniqueId)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={22} color="#ff4757" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sepetim ({cart.length})</Text>
        {cart.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
                <Text style={styles.clearText}>Temizle</Text>
            </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={item => item.uniqueId}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#333" />
            <Text style={styles.emptyText}>Sepetinizde bilet bulunmuyor.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Ana Sayfa')} style={styles.goHomeButton}>
              <Text style={styles.goHomeButtonText}>Etkinliklere Göz At</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam Tutar</Text>
            <Text style={styles.totalValue}>{getTotalPrice()} ₺</Text>
          </View>
           
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={() => {
                navigation.navigate('Payment', { 
                  totalPrice: getTotalPrice(), 
                  cartItems: cart
                });
            }}
          >
            <Text style={styles.checkoutText}>ÖDEMEYE GEÇ</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  clearText: { color: '#ff4757', fontSize: 14 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#666', marginTop: 20, fontSize: 16, marginBottom: 20 },
  goHomeButton: { backgroundColor: '#1E1E1E', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, borderWidth: 1, borderColor: '#00f3ff' },
  goHomeButtonText: { color: '#00f3ff', fontWeight: 'bold' },
  cartItem: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 15, marginBottom: 15, padding: 10, borderWidth: 1, borderColor: '#333' },
  itemImage: { width: 80, height: 80, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  eventName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  venueDate: { color: '#888', fontSize: 12, marginBottom: 5 },
  ticketDetails: { marginBottom: 5 },
  ticketText: { color: '#ccc', fontSize: 12 },
  itemPrice: { color: '#00f3ff', fontWeight: 'bold', fontSize: 16 },
  deleteButton: { justifyContent: 'center', paddingLeft: 10 },
  footer: { position: 'absolute', bottom: 90, left: 20, right: 20, backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { color: '#aaa', fontSize: 16 },
  totalValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  checkoutButton: { backgroundColor: '#00f3ff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderRadius: 30 },
  checkoutText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginRight: 10 },
});

export default CartScreen;