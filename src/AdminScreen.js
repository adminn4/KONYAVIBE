import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, StatusBar, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from './firebaseConfig'; // firebaseConfig bir üst dizindeyse '../'
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'; 

const AdminScreen = ({ navigation }) => {
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Konser');

  // --- YENİ FİYAT SİSTEMİ ---
  const [priceGeneral, setPriceGeneral] = useState('');
  const [priceVip, setPriceVip] = useState('');
  const [priceLoca, setPriceLoca] = useState('');
   
  const [existingEvents, setExistingEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExistingEvents(list);
    } catch (e) {
      console.log("Hata:", e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    // Sadece GENEL fiyat zorunlu, diğerleri opsiyonel
    if (!artist || !date || !location || !priceGeneral) {
      Alert.alert("Eksik Bilgi", "Lütfen en azından Sanatçı, Tarih, Mekan ve Genel Giriş fiyatını giriniz.");
      return;
    }

    try {
      
      const prices = {
          general: priceGeneral
      };
      if (priceVip) prices.vip = priceVip;
      if (priceLoca) prices.loca = priceLoca;

      const newEvent = {
        artist: artist,
        date: date,
        time: time || '21:00',
        location: location, 
        image: image || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9', 
        category: category,
        
       
        ticketPrices: prices,
        
        createdAt: new Date()
      };

      await addDoc(collection(db, "events"), newEvent);
      Alert.alert("Başarılı! 🎉", "Etkinlik eklendi.");
       
      setArtist(''); setDate(''); setLocation(''); 
      setPriceGeneral(''); setPriceVip(''); setPriceLoca(''); 
      setImage('');
      fetchEvents();
     
    } catch (error) {
      Alert.alert("Hata", error.message);
    }
  };

  const handleDeleteEvent = (id) => {
    Alert.alert("Sil", "Emin misin?", [
        { text: "Vazgeç", style: "cancel" },
        { text: "SİL", style: 'destructive', onPress: async () => {
            await deleteDoc(doc(db, "events", id));
            fetchEvents();
        }}
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yönetici Paneli 🛠️</Text>
        <View style={{width: 40}} /> 
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
           
          <Text style={styles.sectionTitle}>✨ Yeni Etkinlik Oluştur</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Etkinlik Adı</Text>
            <TextInput style={styles.input} placeholder="Örn: Manga Konseri" placeholderTextColor="#666" value={artist} onChangeText={setArtist}/>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, {flex:1, marginRight: 5}]}>
                <Text style={styles.label}>Tarih</Text>
                <TextInput style={styles.input} placeholder="15 ŞUBAT" placeholderTextColor="#666" value={date} onChangeText={setDate} />
            </View>
            <View style={[styles.inputContainer, {flex:1, marginLeft: 5}]}>
                <Text style={styles.label}>Saat</Text>
                <TextInput style={styles.input} placeholder="21:00" placeholderTextColor="#666" value={time} onChangeText={setTime} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mekan</Text>
            <TextInput style={styles.input} placeholder="Mekan Adı" placeholderTextColor="#666" value={location} onChangeText={setLocation} />
          </View>

          {/* --- FİYATLAR (Boş bırakılabilir uyarısı) --- */}
          <Text style={[styles.label, {marginTop: 10, color: '#00f3ff'}]}>Fiyatlandırma (Boş bırakılan kategori gözükmez)</Text>
          <View style={styles.row}>
             <View style={[styles.inputContainer, {flex:1, marginRight: 5}]}>
                <Text style={styles.label}>Genel (Zorunlu)</Text>
                <TextInput style={styles.input} placeholder="500" keyboardType="numeric" placeholderTextColor="#666" value={priceGeneral} onChangeText={setPriceGeneral} />
             </View>
             <View style={[styles.inputContainer, {flex:1, marginHorizontal: 5}]}>
                <Text style={styles.label}>VIP</Text>
                <TextInput style={styles.input} placeholder="Opsiyonel" keyboardType="numeric" placeholderTextColor="#666" value={priceVip} onChangeText={setPriceVip} />
             </View>
             <View style={[styles.inputContainer, {flex:1, marginLeft: 5}]}>
                <Text style={styles.label}>Loca</Text>
                <TextInput style={styles.input} placeholder="Opsiyonel" keyboardType="numeric" placeholderTextColor="#666" value={priceLoca} onChangeText={setPriceLoca} />
             </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Resim URL</Text>
            <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#666" value={image} onChangeText={setImage} autoCapitalize="none"/>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
            <Text style={styles.addButtonText}>YAYINLA</Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>📋 Yayındaki Etkinlikler</Text>
           
          {existingEvents.map((item) => (
              <View key={item.id} style={styles.eventRow}>
                  <View style={{flex: 1}}>
                      <Text style={styles.eventRowName}>{item.artist}</Text>
                      {/* Fiyat gösterimi */}
                      <Text style={styles.eventRowDetails}>
                          {item.date} • {item.ticketPrices?.general || item.price}₺
                      </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
              </View>
          ))}
          <View style={{height: 50}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#333' },
  backButton: { padding: 8, backgroundColor: '#333', borderRadius: 10 },
  headerTitle: { color: '#00f3ff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, marginBottom: 15, fontWeight: 'bold' },
  inputContainer: { marginBottom: 15 },
  label: { color: '#ccc', fontSize: 12, marginBottom: 5, fontWeight: 'bold', marginLeft: 2 },
  input: { backgroundColor: '#1E1E1E', color: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#333', fontSize: 16 },
  row: { flexDirection: 'row' },
  addButton: { backgroundColor: '#00f3ff', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 30 },
  eventRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  eventRowName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  eventRowDetails: { color: '#888', fontSize: 12, marginTop: 2 },
  deleteButton: { backgroundColor: '#ff4757', padding: 10, borderRadius: 10 },
  catBadge: { padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#444', marginRight: 10 },
  catText: { color: '#888' }
});

export default AdminScreen;