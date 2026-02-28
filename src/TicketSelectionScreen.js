import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext'; 
import { useCart } from './CartContext'; 

const TicketSelectionScreen = ({ route, navigation }) => {
  const { isGuest } = useUser();
  const { addToCart } = useCart();
  const event = route.params?.event;

  if (!event) return null;

  const eventImage = event.image || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9';

  // --- DİNAMİK BİLET VE STOK LİSTESİ ---
  const ticketTypes = [];

  // 🔥 STOK BİLGİSİNİ ÇEKİYORUZ (Yoksa varsayılan 9999 yapıyoruz)
  const stockInfo = event.stock || {};

  // 1. GENEL GİRİŞ 
  const pGeneral = event.ticketPrices?.general || event.price;
  const sGeneral = stockInfo.general !== undefined ? stockInfo.general : 9999; // Stok
   
  if (pGeneral) {
    ticketTypes.push({ 
        id: 1, 
        name: 'GENEL GİRİŞ', 
        unitPrice: parseInt(pGeneral), 
        color: '#00f3ff', 
        desc: 'Ayakta konser deneyimi.',
        maxStock: sGeneral // 🔥 Stok Sınırı
    });
  }

  // 2. VIP 
  const pVip = event.ticketPrices?.vip;
  const sVip = stockInfo.vip !== undefined ? stockInfo.vip : 9999;

  if (pVip) {
    ticketTypes.push({ 
        id: 2, 
        name: 'VIP BÖLÜM', 
        unitPrice: parseInt(pVip), 
        color: '#D500F9', 
        desc: 'Sahne önü özel alan + İkram.',
        maxStock: sVip
    });
  }

  // 3. LOCA 
  const pLoca = event.ticketPrices?.loca;
  const sLoca = stockInfo.loca !== undefined ? stockInfo.loca : 9999;

  if (pLoca) {
    ticketTypes.push({ 
        id: 3, 
        name: 'LOCA (4 KİŞİLİK)', 
        unitPrice: parseInt(pLoca), 
        color: '#FFD700', 
        desc: 'Size özel oturma grubu + Sınırsız İkram.',
        maxStock: sLoca
    });
  }

  if (ticketTypes.length === 0) {
      ticketTypes.push({ 
        id: 1, name: 'GENEL GİRİŞ', unitPrice: 500, color: '#00f3ff', desc: 'Standart Bilet', maxStock: 100 
      });
  }

  const [quantities, setQuantities] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    let total = 0;
    ticketTypes.forEach(ticket => {
      const qty = quantities[ticket.id] || 0;
      total += ticket.unitPrice * qty;
    });
    setTotalPrice(total);
  }, [quantities]);

  const updateQuantity = (id, change) => {
    setQuantities(prev => {
      const currentQty = prev[id] || 0;
      const targetTicket = ticketTypes.find(t => t.id === id);
      const maxLimit = targetTicket ? targetTicket.maxStock : 0;

      const newQty = currentQty + change;

      // 🔥 KONTROLLER: 0'ın altına inemez VE Stoktan fazla olamaz
      if (newQty < 0) return prev;
      if (newQty > maxLimit) {
          Alert.alert("Stok Sınırı", `Bu kategoride sadece ${maxLimit} adet bilet kalmıştır.`);
          return prev;
      }

      return { ...prev, [id]: newQty };
    });
  };

  const handleAddToCart = () => {
    if (totalPrice === 0) {
        Alert.alert("Uyarı", "Lütfen en az 1 bilet seçin.");
        return;
    }

    if (isGuest) {
      Alert.alert("Giriş Yapmalısın", "Bilet almak için lütfen giriş yap.", [
          { text: "Vazgeç" },
          { text: "Giriş Yap", onPress: () => navigation.navigate('Login', { returnTo: 'TicketSelection', eventData: event }) }
      ]);
      return; 
    }

    // Seçilen biletleri hazırla
    const selectedTickets = ticketTypes.filter(t => (quantities[t.id] || 0) > 0).map(t => ({
      name: t.name, 
      count: quantities[t.id], 
      price: t.unitPrice,
      // Sepete stok bilgisini değil, sadece seçilen adedi atıyoruz
    }));

    const cartItem = {
      id: Date.now(),
      eventId: event.id,
      image: eventImage,        
      eventImage: eventImage,  
      eventName: event.artist,
      venue: event.location, 
      date: event.date,
      time: event.time || '21:00',
      totalPrice: totalPrice,
      tickets: selectedTickets
    };

    addToCart(cartItem);
     
    Alert.alert(
        "Sepete Eklendi ✅",
        "Biletleriniz başarıyla sepete eklendi.",
        [
            { text: "Alışverişe Devam Et", onPress: () => navigation.goBack() },
            { text: "Sepete Git", onPress: () => navigation.navigate('MainTabs', { screen: 'Sepetim' }) }
        ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={{ uri: eventImage }} style={styles.headerImage}>
        <View style={styles.overlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.artistName}>{event.artist}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#00f3ff" />
            <Text style={styles.infoText}>{event.date} • {event.time || '21:00'}</Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Bilet ve Adet Seçimi</Text>
        
        {ticketTypes.map((ticket) => {
          const qty = quantities[ticket.id] || 0; 
          const isSoldOut = ticket.maxStock <= 0; // 🔥 TÜKENDİ Mİ?

          return (
            <View key={ticket.id} style={[
                styles.ticketCard, 
                qty > 0 && { borderColor: ticket.color, borderWidth: 2 },
                isSoldOut && { opacity: 0.5 } // Tükenince silikleşsin
            ]}>
              <View style={styles.ticketInfo}>
                <Text style={[styles.ticketName, { color: ticket.color }]}>
                    {ticket.name} {isSoldOut && "(TÜKENDİ)"}
                </Text>
                <Text style={styles.ticketDesc}>{ticket.desc}</Text>
                
                {/* 🔥 KALAN STOK BİLGİSİ (İsteğe bağlı gösterim) */}
                {!isSoldOut && ticket.maxStock < 3 && (
                    <Text style={{color: '#ff4757', fontSize: 10, fontWeight: 'bold'}}>
                        Son {ticket.maxStock} bilet!
                    </Text>
                )}

                <Text style={styles.ticketPrice}>{ticket.unitPrice} ₺</Text>
              </View>

              {/* 🔥 BUTONLARI KONTROL ET */}
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                    onPress={() => updateQuantity(ticket.id, -1)} 
                    style={[styles.counterButton, { backgroundColor: '#333' }]}
                    disabled={isSoldOut || qty === 0}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                
                <Text style={styles.counterText}>{qty}</Text>
                
                <TouchableOpacity 
                    onPress={() => updateQuantity(ticket.id, 1)} 
                    style={[styles.counterButton, { backgroundColor: isSoldOut ? '#555' : ticket.color }]}
                    disabled={isSoldOut || qty >= ticket.maxStock} // Stok bitince basamasın
                >
                  <Ionicons name="add" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.summaryBox}>
          <View>
            <Text style={styles.summaryLabel}>TOPLAM TUTAR</Text>
            <Text style={styles.summaryPrice}>{totalPrice} ₺</Text>
          </View>
          <TouchableOpacity style={[styles.miniAddButton, totalPrice === 0 && { opacity: 0.5 }]} onPress={handleAddToCart} disabled={totalPrice === 0}>
            <Text style={styles.miniAddButtonText}>SEPETE EKLE</Text>
            <Ionicons name="cart-outline" size={20} color="#000" style={{marginLeft: 5}}/>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  headerImage: { width: '100%', height: 250, justifyContent: 'flex-end' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 20, height: '100%', justifyContent: 'flex-end' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
  artistName: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  infoText: { color: '#ddd', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  contentContainer: { padding: 20, paddingBottom: 100 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  ticketCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  ticketInfo: { flex: 1, paddingRight: 10 },
  ticketName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  ticketDesc: { color: '#888', fontSize: 12, marginBottom: 5 },
  ticketPrice: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  counterContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', borderRadius: 15, padding: 5 },
  counterButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  counterText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, minWidth: 20, textAlign: 'center' },
  summaryBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, marginTop: 10, borderWidth: 1, borderColor: '#00f3ff' },
  summaryLabel: { color: '#aaa', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  summaryPrice: { color: '#00f3ff', fontSize: 28, fontWeight: '900' },
  miniAddButton: { backgroundColor: '#00f3ff', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  miniAddButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});

export default TicketSelectionScreen;