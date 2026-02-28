import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar, 
  Alert, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext'; 
import { db } from './firebaseConfig'; 
import { doc, updateDoc, increment } from 'firebase/firestore'; 
import { useCart } from './CartContext'; 

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PaymentScreen = ({ navigation, route }) => {
  const { user, addTicket } = useUser();
  const { clearCart } = useCart(); 
  const { totalPrice, cartItems } = route.params || { totalPrice: 0, cartItems: [] }; 

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
   
  const [savedCards, setSavedCards] = useState([]); 
  const [selectedCardId, setSelectedCardId] = useState('new');
  const [shouldSaveCard, setShouldSaveCard] = useState(false);

  const changeSelection = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCardId(id);
    if (id !== 'new') {
        setCardName(''); setCardNumber(''); setExpiryDate(''); setCvv('');
    }
  };

  const handlePayment = async () => {
    if (selectedCardId === 'new') {
        if (!cardName || !cardNumber || !expiryDate || !cvv) {
            Alert.alert('Eksik Bilgi', 'Lütfen tüm kart bilgilerini doldurunuz.');
            return;
        }
        if (cardNumber.length < 19) {
            Alert.alert('Hatalı Kart No', 'Kart numarası 16 haneli olmalıdır.');
            return;
        }
        if (shouldSaveCard) {
            const newCard = {
                id: Date.now(),
                alias: cardName.split(' ')[0] + "'ın Kartı",
                number: '**** **** **** ' + cardNumber.slice(-4),
                type: cardNumber.startsWith('4') ? 'Visa' : 'MasterCard'
            };
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSavedCards(prevCards => [...prevCards, newCard]);
        }
    }

    if (cartItems && cartItems.length > 0) {
      const promises = cartItems.map(async (eventItem) => {
        const safeImage = eventItem.eventImage || eventItem.image || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9';
        
        if (eventItem.tickets) {
            for (const ticketType of eventItem.tickets) {
                if (ticketType.count > 0) {
                    try {
                        const eventRef = doc(db, 'events', eventItem.eventId);
                        let stockKey = 'stock.general';
                        if (ticketType.name.includes('VIP')) stockKey = 'stock.vip';
                        if (ticketType.name.includes('LOCA')) stockKey = 'stock.loca';
                        await updateDoc(eventRef, { [stockKey]: increment(-ticketType.count) });
                    } catch (error) { console.log("Stok hatası:", error); }

                    for(let i=0; i < ticketType.count; i++) {
                        await addTicket({
                            id: Date.now().toString() + Math.random(), 
                            eventName: eventItem.eventName || eventItem.artist, 
                            venue: eventItem.venue,
                            date: eventItem.date,
                            time: eventItem.time || '21:00',
                            category: ticketType.name, 
                            count: 1, 
                            image: safeImage, 
                            eventImage: safeImage,
                            ticketCode: 'KV-' + Math.floor(Math.random() * 100000),
                            userName: user?.name || cardName || 'Misafir',
                            status: 'AKTİF',
                            isUsed: false
                        });
                    }
                }
            }
        } else {
             await addTicket({
                id: Date.now().toString(),
                eventName: eventItem.eventName,
                venue: eventItem.venue,
                date: eventItem.date,
                time: eventItem.time,
                category: 'Genel Giriş',
                count: 1,
                image: safeImage, 
                eventImage: safeImage,
                ticketCode: 'KV-' + Math.floor(Math.random() * 100000),
                userName: user?.name || 'Misafir',
                status: 'AKTİF',
                isUsed: false
             });
        }
      });
      await Promise.all(promises);
    }

    Alert.alert(
      "Ödeme Başarılı! 🎉",
      `Toplam ${totalPrice}₺ ödemeniz alındı. İyi eğlenceler!`,
      [{ 
          text: "Biletlerimi Gör", 
          onPress: () => {
            clearCart(); 
            navigation.reset({
                index: 1,
                routes: [
                  { name: 'MainTabs' },
                  { name: 'MyTickets' }
                ],
            });
          } 
      }]
    );
  };

  const formatCardNumber = (text) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 16) cleaned = cleaned.substring(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    setCardNumber(groups ? groups.join(' ') : cleaned);
  };
  const formatExpiry = (text) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 4) cleaned = cleaned.substring(0, 4);
    if (cleaned.length >= 2) setExpiryDate(cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4));
    else setExpiryDate(cleaned);
  };
  const formatCVV = (text) => {
      let cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned.length > 3) cleaned = cleaned.substring(0, 3);
      setCvv(cleaned);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme Yöntemi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kayıtlı Kartlarım</Text>
            <TouchableOpacity onPress={() => changeSelection('new')} style={styles.addSmallButton}>
                <Ionicons name="add" size={16} color="#00f3ff" />
                <Text style={styles.addSmallText}>Yeni Kart</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.cardListContainer}>
          {savedCards.length === 0 && (
            <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={40} color="#333" />
                <Text style={styles.emptyText}>Henüz kayıtlı kartınız yok.</Text>
            </View>
          )}
          {savedCards.map((card) => {
            const isSelected = selectedCardId === card.id;
            return (
              <TouchableOpacity key={card.id} style={[styles.cardRow, isSelected && styles.cardRowSelected]} onPress={() => changeSelection(card.id)} activeOpacity={0.8}>
                <Ionicons name={isSelected ? "radio-button-on" : "radio-button-off"} size={24} color={isSelected ? "#00f3ff" : "#666"} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardAlias}>{card.alias}</Text>
                  <Text style={styles.cardNumberSmall}>{card.number}</Text>
                </View>
                <Text style={styles.cardType}>{card.type}</Text>
              </TouchableOpacity>
            );
          })}
           
          <TouchableOpacity style={[styles.cardRow, selectedCardId === 'new' && styles.cardRowSelected, { marginTop: 10 }]} onPress={() => changeSelection('new')} activeOpacity={0.8}>
             <Ionicons name={selectedCardId === 'new' ? "radio-button-on" : "radio-button-off"} size={24} color={selectedCardId === 'new' ? "#00f3ff" : "#666"} />
             <View style={styles.cardInfo}>
                 <Text style={styles.cardAlias}>Başka Kart ile Öde</Text>
                 <Text style={styles.cardNumberSmall}>Kart bilgilerinizi giriniz</Text>
             </View>
             <Ionicons name="add-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {selectedCardId === 'new' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Kart Bilgilerini Giriniz</Text>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>KART ÜZERİNDEKİ İSİM</Text>
                <TextInput style={styles.input} placeholder="Ad Soyad" placeholderTextColor="#666" value={cardName} onChangeText={setCardName} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>KART NUMARASI</Text>
                <TextInput style={styles.input} placeholder="0000 0000 0000 0000" placeholderTextColor="#666" keyboardType="numeric" maxLength={19} value={cardNumber} onChangeText={formatCardNumber} />
            </View>
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>SKT (AA/YY)</Text>
                    <TextInput style={styles.input} placeholder="AA/YY" placeholderTextColor="#666" keyboardType="numeric" maxLength={5} value={expiryDate} onChangeText={formatExpiry} />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput style={styles.input} placeholder="123" placeholderTextColor="#666" keyboardType="numeric" maxLength={3} secureTextEntry value={cvv} onChangeText={formatCVV} />
                </View>
            </View>

            <TouchableOpacity 
                style={styles.saveOptionRow}
                onPress={() => setShouldSaveCard(!shouldSaveCard)}
                activeOpacity={0.8}
            >
                <Ionicons 
                    name={shouldSaveCard ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={shouldSaveCard ? "#00f3ff" : "#666"} 
                />
                <Text style={[styles.saveOptionText, shouldSaveCard && {color: '#fff'}]}>
                    Kartımı sonraki alışverişlerim için sakla
                </Text>
            </TouchableOpacity>

          </View>
        )}

        <View style={styles.footerContainer}>
           <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam Tutar</Text>
              <Text style={styles.totalValue}>{totalPrice} ₺</Text>
           </View>
           
           <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
              <Text style={styles.payButtonText}>
                  {selectedCardId === 'new' && shouldSaveCard ? 'ÖDE VE KAYDET' : 'ÖDEMEYİ TAMAMLA'}
              </Text>
              <Ionicons name="lock-closed" size={18} color="#000" style={{marginLeft: 8}}/>
           </TouchableOpacity>
           
           <View style={styles.securityLogos}>
              <Text style={styles.securityText}>🔒 256-Bit SSL ile Güvenli Ödeme</Text>
           </View>
        </View>
        <View style={{height: 50}} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backButton: { padding: 8, backgroundColor: '#1E1E1E', borderRadius: 12, marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  contentContainer: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  addSmallButton: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  addSmallText: { color: '#00f3ff', fontSize: 12, marginLeft: 5 },
  cardListContainer: { marginBottom: 20 },
  emptyState: { alignItems: 'center', padding: 20, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', borderRadius: 12, marginBottom: 15 },
  emptyText: { color: '#666', marginTop: 10, fontSize: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  cardRowSelected: { borderColor: '#00f3ff', backgroundColor: 'rgba(0, 243, 255, 0.05)' },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardAlias: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cardNumberSmall: { color: '#888', fontSize: 12 },
  cardType: { color: '#ccc', fontSize: 12, fontWeight: 'bold', fontStyle: 'italic' },
  formContainer: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  formTitle: { color: '#00f3ff', fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  label: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 5, marginLeft: 2 },
  input: { backgroundColor: '#121212', color: '#fff', paddingHorizontal: 15, height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#333', fontSize: 16 },
  row: { flexDirection: 'row' },
  saveOptionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingVertical: 5 },
  saveOptionText: { color: '#888', marginLeft: 10, fontSize: 13 },
  footerContainer: { marginTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { color: '#aaa', fontSize: 16 },
  totalValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  payButton: { backgroundColor: '#00f3ff', height: 55, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#00f3ff', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  payButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  securityLogos: { marginTop: 15, alignItems: 'center' },
  securityText: { color: '#666', fontSize: 12 },
});

export default PaymentScreen;