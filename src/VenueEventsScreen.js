import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions, ScrollView, Modal, Linking, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from './firebaseConfig'; 
import { collection, getDocs, query, where } from 'firebase/firestore'; 

const { width, height } = Dimensions.get('window');

const VenueEventsScreen = ({ route, navigation }) => {
  const { venue } = route.params; 
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MODAL & GALERİ STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [initialSlideIndex, setInitialSlideIndex] = useState(0); // Hangi resimden başlayacağını tutar
  
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop';
  
  //  GALERİ RESİMLERİ (Yoksa ana resmi çoğaltır)
  const galleryImages = venue.gallery && venue.gallery.length > 0 
    ? venue.gallery 
    : [venue.image, venue.image, venue.image]; 

  useEffect(() => {
    const fetchVenueEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where("location", "==", venue.name));
        const querySnapshot = await getDocs(q);
        const fetchedEvents = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedEvents.push({ 
            id: doc.id, 
            ...data,
            image: data.image || null
          });
        });

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueEvents();
  }, [venue.name]);

  const openMap = () => {
    const query = `${venue.name} Konya`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(query)}`,
      android: `geo:0,0?q=${encodeURIComponent(query)}`
    });
    Linking.openURL(url).catch(() => {
      const browserUrl = `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(query)}`;
      Linking.openURL(browserUrl);
    });
  };

  //  RESME TIKLAYINCA O RESİMDEN BAŞLATAN FONKSİYON
  const openGallery = (index) => {
    setInitialSlideIndex(index);
    setModalVisible(true);
  };

  const closeGallery = () => {
    setModalVisible(false);
  };

  // --- HEADER BÖLÜMÜ ---
  const renderHeader = () => (
    <View style={{ position: 'relative' }}>
      
      <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
      >
          <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Mekan Kapak Resmi (Buna basınca da galeri ilk resimden açılır) */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => openGallery(0)} style={styles.heroContainer}>
          <Image source={{ uri: venue.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          
          <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{venue.name}</Text>
              
              <TouchableOpacity 
                style={styles.locationRow} 
                onPress={openMap} 
                activeOpacity={0.7}
              >
                  <Ionicons name="navigate-circle" size={20} color="#00f3ff" />
                  <Text style={styles.heroLocation}>Konumda Gör ↗</Text>
              </TouchableOpacity>
          </View>
      </TouchableOpacity>

      <View style={styles.descSection}>
          <Text style={styles.descText}>{venue.desc} Burada eğlencenin nabzı atıyor.</Text>
      </View>

      {/* --- KÜÇÜK RESİMLER (TIKLAYINCA GALERİ AÇILIR) --- */}
      <View style={styles.gallerySection}>
          <Text style={styles.sectionTitle}>Mekan Atmosferi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingLeft: 20}}>
              {galleryImages.map((imgUrl, index) => (
                  <TouchableOpacity 
                    key={index} 
                    activeOpacity={0.8}
                    onPress={() => openGallery(index)} // Tıklanan resmin indexini gönderiyoruz
                  >
                    <Image source={{ uri: imgUrl }} style={styles.galleryThumb} />
                  </TouchableOpacity>
              ))}
          </ScrollView>
      </View>

      <Text style={[styles.sectionTitle, {marginLeft: 20, marginTop: 20}]}>Yaklaşan Etkinlikler</Text>
    </View>
  );

  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.gridCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('TicketSelection', { event: item })}
    >
      <Image source={{ uri: item.image ? item.image : DEFAULT_IMAGE }} style={styles.gridImage} />
      <View style={styles.gridOverlay} />
      
      <View style={styles.gridContent}>
        <Text style={styles.gridArtist} numberOfLines={1}>{item.artist}</Text>
        <Text style={styles.gridDate}>{item.date}</Text>
        <Text style={styles.gridPrice}>Genel: {item.ticketPrices?.general || item.price}₺</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#00f3ff" /></View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          numColumns={2} 
          columnWrapperStyle={styles.row} 
          contentContainerStyle={{ paddingBottom: 50 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Bu mekanda henüz etkinlik yok.</Text>
          }
        />
      )}

      {/* 🔥 TAM EKRAN KAYDIRMALI GALERİ MODALI 🔥 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={closeGallery}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          
          {/* Kapatma Butonu */}
          <TouchableOpacity style={styles.modalCloseButton} onPress={closeGallery}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>

          {/* Kaydırmalı Liste (Horizontal FlatList) */}
          <FlatList
            data={galleryImages}
            horizontal
            pagingEnabled // Sayfa sayfa kaymasını sağlar
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialSlideIndex} // Tıklanan resimden başlar
            getItemLayout={(data, index) => (
              { length: width, offset: width * index, index }
            )}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
                <Image 
                  source={{ uri: item }} 
                  style={styles.modalImage} 
                  resizeMode="contain" 
                />
              </View>
            )}
          />
          
          {/* Alttaki Bilgi Yazısı (Örn: 1/3) */}
          <View style={styles.pagination}>
             <Text style={{color: '#fff'}}></Text>
          </View>

        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroContainer: { height: 250, width: '100%' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  backButton: { 
      position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.6)', 
      padding: 8, borderRadius: 12, zIndex: 999, elevation: 10
  },
  heroContent: { position: 'absolute', bottom: 20, left: 20 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
  locationRow: { 
    flexDirection: 'row', alignItems: 'center', marginTop: 5, 
    backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20
  },
  heroLocation: { color: '#00f3ff', marginLeft: 5, fontWeight: 'bold' },
  descSection: { padding: 20 },
  descText: { color: '#ccc' },
  
  gallerySection: { marginTop: 10 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10, paddingLeft: 20 },
  galleryThumb: { width: 140, height: 90, borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#333' },

  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  gridCard: { 
      width: (width - 50) / 2, height: 180, backgroundColor: '#1E1E1E', 
      borderRadius: 15, marginBottom: 15, overflow: 'hidden'
  },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  gridContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.7)' },
  gridArtist: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  gridDate: { color: '#ccc', fontSize: 10 },
  gridPrice: { color: '#00f3ff', fontSize: 12, fontWeight: 'bold' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },
  
  // --- YENİ MODAL STİLLERİ ---
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  modalCloseButton: { position: 'absolute', top: 50, right: 20, zIndex: 20 },
  modalImage: { width: width, height: height * 0.8 },
  pagination: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' }
});

export default VenueEventsScreen;