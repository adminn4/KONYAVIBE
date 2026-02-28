import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';



const CouponsScreen = ({ navigation }) => {
   
  // --- KAMPANYA VERİLERİ ---
  //  Kampanya yapacağım zaman bu listenin içini dolduracağız.
  // Şu an özel gün olmadığı için listeyi boş bıraktım.
  const coupons = [
    /*  Kampanya Olunca Bu Yorum Satırlarını Kaldırılıcak
    {
      id: '1',
      title: 'Yılbaşı Özel',
      description: 'Yılbaşı partisi biletlerinde geçerli.',
      discount: '%20',
      code: 'YILBASI2026',
      color: '#00f3ff', 
      expiry: '3 Gün Kaldı'
    },
    */
  ];

  const handleCopyCode = (code) => {
    Alert.alert("Başarılı! 🎉", `"${code}" kodu kopyalandı.`);
  };

  const renderCoupon = ({ item }) => (
    <View style={styles.couponCard}>
      <View style={[styles.leftSide, { backgroundColor: item.color }]}>
        <View style={styles.verticalTextContainer}>
          <Text style={styles.verticalText}>KUPON</Text>
        </View>
      </View>
      <View style={styles.rightSide}>
        <View>
          <Text style={[styles.discountText, { color: item.color }]}>{item.discount}</Text>
          <Text style={styles.couponTitle}>{item.title}</Text>
          <Text style={styles.couponDesc}>{item.description}</Text>
        </View>
        <View style={styles.dashedLine} />
        <View style={styles.cardFooter}>
          <Text style={styles.expiryText}>⏳ {item.expiry}</Text>
          <TouchableOpacity 
            style={[styles.copyButton, { borderColor: item.color }]}
            onPress={() => handleCopyCode(item.code)}
          >
            <Text style={[styles.codeText, { color: item.color }]}>{item.code}</Text>
            <Ionicons name="copy-outline" size={16} color={item.color} style={{marginLeft: 5}} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />
    </View>
  );

  // --- BOŞ DURUM TASARIMI (Varsayılan) ---
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="gift-outline" size={80} color="#333" />
        {/* Üzerine yasak/bekleme işareti */}
        <View style={styles.badge}>
            <Ionicons name="time" size={30} color="#D500F9" />
        </View>
      </View>
       
      <Text style={styles.emptyTitle}>Sessizlik Hakim...</Text>
      <Text style={styles.emptySubText}>
        Şu an aktif bir kampanya veya kupon bulunmuyor.
        {'\n\n'}
        <Text style={{color: '#00f3ff'}}>Özel günleri ve festivalleri bekle!</Text>
        {'\n'}Sürprizler çok yakında.
      </Text>

      {/* Bildirim Butonu (Süs) */}
      <TouchableOpacity style={styles.notifyButton} onPress={() => Alert.alert('Bildirimler Açık', 'Kampanya olduğunda sana haber vereceğiz!')}>
        <Ionicons name="notifications-outline" size={20} color="#000" />
        <Text style={styles.notifyButtonText}>Kampanya Gelince Haber Ver</Text>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Kuponlarım</Text>
      </View>

      <FlatList
        data={coupons}
        renderItem={renderCoupon}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        // Liste boşsa bunu göster:
        ListEmptyComponent={renderEmptyState} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backButton: { padding: 8, backgroundColor: '#1E1E1E', borderRadius: 12, marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 50, flexGrow: 1 },

  // --- BOŞ DURUM STİLLERİ ---
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyIconBox: {
    marginBottom: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptySubText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 30,
  },
  notifyButton: {
    marginTop: 40,
    backgroundColor: '#00f3ff', // Neon Mavi
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#00f3ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  notifyButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10,
  },

  // --- KUPON KARTI STİLLERİ (Kampanya olunca lazım olacak) ---
  couponCard: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 15, marginBottom: 20, overflow: 'hidden', height: 160, borderWidth: 1, borderColor: '#333' },
  leftSide: { width: 40, justifyContent: 'center', alignItems: 'center' },
  verticalTextContainer: { width: 100, transform: [{ rotate: '-90deg' }] },
  verticalText: { color: '#000', fontWeight: 'bold', fontSize: 14, textAlign: 'center', letterSpacing: 3 },
  rightSide: { flex: 1, padding: 15, justifyContent: 'space-between' },
  discountText: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  couponTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  couponDesc: { color: '#aaa', fontSize: 12 },
  dashedLine: { height: 1, borderWidth: 1, borderColor: '#444', borderStyle: 'dashed', marginVertical: 5 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expiryText: { color: '#ff4757', fontSize: 12, fontWeight: 'bold' },
  copyButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  codeText: { fontWeight: 'bold', fontSize: 14 },
  circleTop: { position: 'absolute', left: 32, top: -10, width: 16, height: 16, borderRadius: 8, backgroundColor: '#121212' },
  circleBottom: { position: 'absolute', left: 32, bottom: -10, width: 16, height: 16, borderRadius: 8, backgroundColor: '#121212' },
});

export default CouponsScreen;