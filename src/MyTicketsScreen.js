import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext'; 

const MyTicketsScreen = ({ navigation }) => {
  const { myTickets } = useUser(); 

  // Sadece Kullanılmamış (isUsed: false veya undefined) biletleri gösteriyoruz bu şekilde
  const activeTickets = myTickets.filter(ticket => !ticket.isUsed);

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('DigitalTicket', { ticket: item })}
    >
        {/* --- SOL TARAF: RESİM --- */}
        <Image 
            source={{ uri: item.image }} 
            style={styles.ticketImage}
            resizeMode="cover"
        />

        {/* --- SAĞ TARAF: BİLGİLER --- */}
        <View style={styles.ticketInfo}>
            
        <View style={styles.topRow}>
          {/* KATEGORİ ROZETİ RENKLENDİRME */}
            <View style={[
                styles.catBadge, 
                { 
                  backgroundColor: item.category && item.category.includes('VIP') ? '#D500F9' : 
                                   item.category && (item.category.includes('LOCA') || item.category.includes('Loca')) ? '#FFD700' : 
                                   '#00f3ff' 
                }
            ]}>
                <Text style={[
                    styles.catText, 
                    (item.category && !item.category.includes('VIP')) && { color: '#fff' }
                ]}>
                    {item.category || 'Genel Giriş'}
                </Text>
            </View>
        </View>

            {/* Sanatçı Adı */}
            <Text style={styles.artistName} numberOfLines={1}>{item.eventName || item.artist}</Text>
            
            {/* Mekan */}
            <Text style={styles.venueName} numberOfLines={1}>{item.venue}</Text>

            {/* Alt Kısım: Adet ve Buton */}
            <View style={styles.bottomRow}>
                <Text style={styles.countText}>{item.count || 1} Adet</Text>
                
                <View style={styles.goButton}>
                    <Text style={styles.goButtonText}>GÖRÜNTÜLE</Text>
                    <Ionicons name="chevron-forward" size={12} color="#000" />
                </View>
            </View>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Biletlerim</Text>
        <View style={{width: 40}} /> 
      </View>

      {/* LİSTELEME - ARTIK activeTickets KULLANIYORUZ */}
      {activeTickets && activeTickets.length > 0 ? (
        <FlatList
            data={activeTickets}
            renderItem={renderTicketItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
        />
      ) : (
        // BOŞ DURUM
        <View style={styles.emptyContainer}>
           <View style={styles.iconCircle}>
             <Ionicons name="ticket-outline" size={80} color="#333" />
           </View>
           <Text style={styles.emptyTitle}>Aktif Biletin Yok</Text>
           <Text style={styles.emptyDesc}>Satın aldığın biletler burada görünür. Kullanılan biletler "Geçmiş Etkinlikler" sayfasına taşınır.</Text>
           <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('MainTabs')}>
             <Text style={styles.exploreButtonText}>ETKİNLİKLERE GÖZ AT</Text>
           </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#1E1E1E' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  listContainer: { padding: 20 },
   
  // KART TASARIMI
  ticketCard: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 15, marginBottom: 15, overflow: 'hidden', height: 120, borderWidth: 1, borderColor: '#333' },
  ticketImage: { width: 100, height: '100%', backgroundColor: '#333' },
  ticketInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
   
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 5 },
  catText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  artistName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  venueName: { color: '#888', fontSize: 12 },
   
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  countText: { color: '#ccc', fontSize: 12, fontWeight: 'bold' },
   
  goButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00f3ff', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
  goButtonText: { color: '#000', fontSize: 10, fontWeight: 'bold', marginRight: 2 },

  // BOŞ DURUM
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#333' },
  emptyTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  emptyDesc: { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 40 },
  exploreButton: { backgroundColor: '#00f3ff', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  exploreButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});

export default MyTicketsScreen;