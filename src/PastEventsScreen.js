import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StatusBar,
  Modal, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext'; 

//  FIREBASE IMPORTS
import { db } from './firebaseConfig'; 
import { doc, updateDoc, increment, writeBatch } from 'firebase/firestore';

const PastEventsScreen = ({ navigation }) => {
  const { user, myTickets } = useUser(); 
   
  // --- STATE ---
  const [modalVisible, setModalVisible] = useState(false); 
  const [currentRating, setCurrentRating] = useState(0);    
  const [selectedTicket, setSelectedTicket] = useState(null); // Keep track of which ticket is being rated
  const [submitting, setSubmitting] = useState(false);

  //  FILTER: Show only Used tickets (isUsed === true) öenmli kısım
  // You can also add your date logic here if needed
  const pastTickets = myTickets.filter(ticket => ticket.isUsed === true);

  // --- OPEN MODAL ---
  const openRatingModal = (ticket) => {
    setSelectedTicket(ticket);
    setCurrentRating(0); 
    setModalVisible(true); 
  };

  // ---  SAVE RATING ---
  const submitRating = async () => {
    if (!selectedTicket || currentRating === 0) return;

    setSubmitting(true);

    try {
        const batch = writeBatch(db);

        // 1. Kullanıcı Biletini Updateliyoruz 
        const ticketRef = doc(db, 'users', user.uid, 'tickets', selectedTicket.id);
        batch.update(ticketRef, {
            isRated: true,        // Flag to hide button later
            userRating: currentRating // Store what they gave
        });

        // 2. UPDATE GLOBAL EVENT STATS
        
        if (selectedTicket.eventId) {
            const eventRef = doc(db, 'events', selectedTicket.eventId);
           
            batch.update(eventRef, {
                ratingTotal: increment(currentRating),
                ratingCount: increment(1)
            });
        }

        // Commit all changes
        await batch.commit();

        Alert.alert("Teşekkürler! 🎉", "Puanınız kaydedildi.");
        setModalVisible(false);

    } catch (error) {
        console.log("Puanlama hatası:", error);
        Alert.alert("Hata", "Puan kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
        setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Use safe image fallback */}
      <Image 
        source={{ uri: item.eventImage || item.image || 'https://via.placeholder.com/400' }} 
        style={styles.image} 
      />
      <View style={styles.overlay} />
       
      <View style={styles.infoContainer}>
        <Text style={styles.artist}>{item.eventName || item.artist}</Text>
        <Text style={styles.details}>{item.date} • {item.venue}</Text>
        
        {/* DYNAMIC UI: Show Stars if Rated, Button if Not */}
        {item.isRated ? (
            <View style={styles.ratedContainer}>
                <Text style={styles.yourRatingText}>Senin Puanın:</Text>
                <View style={{flexDirection:'row'}}>
                    {[...Array(item.userRating || 0)].map((_, i) => (
                        <Ionicons key={i} name="star" size={16} color="#FFD700" />
                    ))}
                </View>
            </View>
        ) : (
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => openRatingModal(item)}
            >
              <Ionicons name="star-outline" size={16} color="#000" />
              <Text style={styles.rateText}>Değerlendir</Text>
            </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geçmiş Etkinlikler</Text>
      </View>

      <FlatList
        data={pastTickets}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
            <View style={{alignItems:'center', marginTop: 50}}>
                <Ionicons name="time-outline" size={60} color="#333" />
                <Text style={{color:'#666', textAlign:'center', marginTop: 20}}>Henüz geçmiş bir etkinliğiniz yok.</Text>
                <Text style={{color:'#444', textAlign:'center', fontSize:12, marginTop:5}}>Kullanılan biletler buraya düşer.</Text>
            </View>
        }
      />

      {/* --- RATING MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <Text style={styles.modalTitle}>Etkinliği Değerlendir</Text>
            <Text style={styles.modalSubtitle}>
                {selectedTicket?.eventName || 'Etkinlik'} performansı nasıldı?
            </Text>

            {/* 1'den 10'a kadar yıldız */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <TouchableOpacity 
                  key={star} 
                  onPress={() => setCurrentRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={star <= currentRating ? "star" : "star-outline"} 
                    size={28} 
                    color="#FFD700" 
                    style={{ marginHorizontal: 1 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingText}>
                {currentRating > 0 ? `${currentRating} / 10 Puan` : 'Puanlamak için yıldızlara dokunun'}
            </Text>

            <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Vazgeç</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={submitRating} 
                    style={[styles.submitButton, (currentRating === 0 || submitting) && {opacity: 0.5}]}
                    disabled={currentRating === 0 || submitting}
                >
                      {submitting ? (
                        <ActivityIndicator color="#000" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>GÖNDER</Text>
                    )}
                </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backButton: { padding: 8, backgroundColor: '#1E1E1E', borderRadius: 12, marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 20 },
   
  // CARD STYLES
  card: { height: 180, marginBottom: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333' },
  image: { width: '100%', height: '100%', opacity: 0.6 }, 
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  infoContainer: { position: 'absolute', bottom: 15, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  artist: { color: '#ccc', fontSize: 20, fontWeight: 'bold' }, 
  details: { color: '#888', fontSize: 12 },
   
  // BUTTONS
  rateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  rateText: { color: '#000', fontWeight: 'bold', fontSize: 12, marginLeft: 5 },
   
  // RATED UI
  ratedContainer: { alignItems: 'flex-end' },
  yourRatingText: { color: '#FFD700', fontSize: 10, marginBottom: 2, fontWeight:'bold' },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#1E1E1E', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  modalSubtitle: { color: '#aaa', fontSize: 14, marginBottom: 20 },
  starsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  ratingText: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', marginBottom: 25 },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelButton: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10 },
  cancelButtonText: { color: '#aaa', fontWeight: 'bold' },
  submitButton: { flex: 1, backgroundColor: '#FFD700', padding: 15, borderRadius: 15, alignItems: 'center', marginLeft: 10 },
  submitButtonText: { color: '#000', fontWeight: 'bold' }
});

export default PastEventsScreen;