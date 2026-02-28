import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext'; // NOT: UserContext bir üst dizindeyse '../'

// --- SİLME İŞLEMİ İÇİN GEREKLİ ---
import { db } from './firebaseConfig'; // NOT: firebaseConfig bir üst dizindeyse '../'
import { doc, deleteDoc } from 'firebase/firestore'; 

const EventDetailScreen = ({ route, navigation }) => {
  const { isGuest, isAdmin } = useUser();
  const event = route.params?.event;
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop';

  if (!event) return null; 

  // --- BİLET MANTIĞI ---
  const basePrice = parseInt(event.price) || 400; 

  const ticketTypes = [
    { id: 1, name: 'GENEL GİRİŞ', unitPrice: basePrice, color: '#00f3ff', desc: 'Ayakta konser deneyimi.' },
    { id: 2, name: 'VIP BÖLÜM', unitPrice: basePrice * 2, color: '#D500F9', desc: 'Sahne önü özel alan + İkram.' },
    { id: 3, name: 'LOCA (4 Kişilik)', unitPrice: basePrice * 10, color: '#FFD700', desc: 'Size özel oturma grubu + Sınırsız İkram.' },
  ];

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
      const newQty = currentQty + change;
      if (newQty < 0) return prev;
      return { ...prev, [id]: newQty };
    });
  };

  // ETKİNLİK SİLME FONKSİYONU 
  const handleDeleteEvent = async () => {
    Alert.alert(
      "Etkinliği Sil",
      "Bu etkinliği kalıcı olarak silmek istediğine emin misin?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "EVET, SİL", 
          style: "destructive", // Kırmızı renk yapar (iOS) için
          onPress: async () => {
            try {
              // Firebase'den sil
              await deleteDoc(doc(db, "events", event.id));
              Alert.alert("Silindi", "Etkinlik başarıyla kaldırıldı.");
              // Geri dön
              navigation.goBack();
            } catch (error) {
              console.error("Silme hatası:", error);
              Alert.alert("Hata", "Silinirken bir sorun oluştu.");
            }
          }
        }
      ]
    );
  };
  // ----------------------------------------

  const handleAddToCart = () => {
    if (totalPrice === 0) {
        Alert.alert("Bilet Seçmediniz", "Lütfen en az 1 bilet seçin.");
        return;
    }

    if (isGuest) {
      Alert.alert(
        "Giriş Yapmalısın",
        "Bilet almak için lütfen giriş yap.",
        [
          { text: "Vazgeç", style: "cancel" },
          { 
            text: "Giriş Yap", 
            onPress: () => navigation.navigate('Login', { 
                returnTo: 'EventDetail',
                eventData: event 
            }) 
          }
        ]
      );
      return; 
    }

    const selectedTickets = ticketTypes.filter(t => (quantities[t.id] || 0) > 0).map(t => ({
      name: t.name, count: quantities[t.id], price: t.unitPrice
    }));

    const cartItem = {
      id: Date.now(),
      eventId: event.id,
      eventImage: event.image,
      eventName: event.artist,
      venue: event.location,
      date: event.date,
      time: event.time || '21:00',
      totalPrice: totalPrice,
      tickets: selectedTickets
    };

    navigation.navigate('MainTabs', { screen: 'Sepetim', params: { newItem: cartItem } });
  };

  const displayImage = event.image ? event.image : DEFAULT_IMAGE;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
       
      <View style={styles.imageContainer}>
        <Image source={{ uri: displayImage }} style={styles.image} />
        <View style={styles.overlay} />
         
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
            <Text style={styles.title}>{event.artist}</Text>
            <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#00f3ff" />
                <Text style={styles.location}>{event.location}</Text>
            </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.infoBox}>
            <View style={styles.infoItem}>
                <Ionicons name="calendar" size={24} color="#D500F9" />
                <View style={{marginLeft: 10}}>
                    <Text style={styles.infoLabel}>Tarih</Text>
                    <Text style={styles.infoValue}>{event.date}</Text>
                </View>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.infoItem}>
                <Ionicons name="time" size={24} color="#D500F9" />
                <View style={{marginLeft: 10}}>
                    <Text style={styles.infoLabel}>Saat</Text>
                    <Text style={styles.infoValue}>{event.time || '21:00'}</Text>
                </View>
            </View>
        </View>

        <Text style={styles.sectionTitle}>Etkinlik Hakkında</Text>
        <Text style={styles.description}>
            {event.artist}, muhteşem sahne şovuyla {event.location} sahnesinde!
            Unutulmaz bir gece için yerini şimdiden ayırt.
            {'\n'}⚠️ 18 yaş sınırı vardır.
        </Text>

        <View style={styles.ticketSection}>
            <Text style={styles.sectionTitle}>Bilet Türünü Seç</Text>
            {ticketTypes.map((ticket) => {
            const qty = quantities[ticket.id] || 0; 
            return (
                <View key={ticket.id} style={[styles.ticketCard, qty > 0 && { borderColor: ticket.color }]}>
                <View style={styles.ticketInfo}>
                    <Text style={[styles.ticketName, { color: ticket.color }]}>{ticket.name}</Text>
                    <Text style={styles.ticketDesc}>{ticket.desc}</Text>
                    <Text style={styles.ticketPrice}>{ticket.unitPrice} ₺</Text>
                </View>
                <View style={styles.counterContainer}>
                    <TouchableOpacity onPress={() => updateQuantity(ticket.id, -1)} style={[styles.counterBtn, {backgroundColor: '#333'}]}>
                        <Ionicons name="remove" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{qty}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(ticket.id, 1)} style={[styles.counterBtn, {backgroundColor: ticket.color}]}>
                        <Ionicons name="add" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
                </View>
            );
            })}
        </View>

         

        <View style={{height: 100}} /> 
      </ScrollView>

      <View style={styles.footer}>
        <View>
            <Text style={styles.priceLabel}>TOPLAM TUTAR</Text>
            <Text style={styles.priceValue}>{totalPrice} ₺</Text>
        </View>
        <TouchableOpacity 
            style={[styles.buyButton, totalPrice === 0 && {backgroundColor: '#333', opacity: 0.5}]}
            onPress={handleAddToCart}
            disabled={totalPrice === 0}
        >
            <Text style={styles.buyButtonText}>SEPETE EKLE</Text>
            <Ionicons name="cart" size={20} color="#000" style={{marginLeft: 10}}/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  imageContainer: { height: 320, width: '100%' },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' }, 
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 12 },
  headerContent: { position: 'absolute', bottom: 20, left: 20 },
  title: { color: '#fff', fontSize: 36, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 10, letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 10, alignSelf: 'flex-start' },
  location: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 5 },
   
  content: { padding: 20 },
  infoBox: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 15, padding: 15, justifyContent: 'space-around', alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  verticalLine: { width: 1, height: 30, backgroundColor: '#444' },
  infoLabel: { color: '#888', fontSize: 12 },
  infoValue: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  description: { color: '#ccc', lineHeight: 22, fontSize: 14, marginBottom: 20 },

  ticketSection: { marginTop: 10 },
  ticketCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  ticketInfo: { flex: 1, paddingRight: 10 },
  ticketName: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
  ticketDesc: { color: '#888', fontSize: 12, marginBottom: 5 },
  ticketPrice: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  counterContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', borderRadius: 20, padding: 4 },
  counterBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  counterText: { color: '#fff', fontWeight: 'bold', marginHorizontal: 15, fontSize: 18 },

  // --- SİLME BUTONU STİLİ ---
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4757', // Kırmızı
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: '#ff6b81'
  },
  deleteText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E1E1E', padding: 20, paddingBottom: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333' },
  priceLabel: { color: '#888', fontSize: 12, letterSpacing: 1 },
  priceValue: { color: '#00f3ff', fontSize: 28, fontWeight: '900' },
  buyButton: { backgroundColor: '#00f3ff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, flexDirection: 'row', alignItems: 'center', shadowColor: '#00f3ff', shadowOpacity: 0.4, shadowRadius: 10 },
  buyButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});

export default EventDetailScreen;