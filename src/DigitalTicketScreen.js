import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  StatusBar, 
  TouchableOpacity, 
  Dimensions,
  Animated, 
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg'; //  YENİ KÜTÜPHANE
import { useUser } from './UserContext'; //  USER ID İÇİN EKLENDİ (Bir üst dizindeyse '../')

const { width } = Dimensions.get('window');

const DigitalTicketScreen = ({ route, navigation }) => {
  const { user } = useUser(); 
  const ticketData = route.params?.ticket || {
    id: 'test-id', // ID yoksa patlamasın diye
    artist: 'Sanatçı Bilgisi Yok',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop',
    venue: 'Mekan Bilgisi Yok',
    date: 'Tarih Yok',
    time: '--:--',
    category: 'STANDART',
    userName: 'Misafir',
    ticketCode: 'KV-0000-00',
    isUsed: false // Kullanıldı mı?
  };

  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.linear
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.linear
        })
      ])
    ).start();
  }, []);

  //  GÜVENLİK İÇİN USER ID KONTROLÜ
  const qrValue = user ? `${user.uid}|${ticketData.id}` : `GUEST|${ticketData.id}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Dijital Biletiniz</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.ticketCard}>
          
          <Image source={{ uri: ticketData.image }} style={styles.eventImage} />
          
          <View style={styles.headerInfo}>
            <Text style={styles.artistName}>{ticketData.artist}</Text>
            <View style={styles.venueRow}>
              <Ionicons name="location-sharp" size={16} color="#00f3ff" />
              <Text style={styles.venueName}>{ticketData.venue}</Text>
            </View>
          </View>

          <View style={styles.dashedLineContainer}>
            <View style={styles.circleLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.circleRight} />
          </View>

          {/* 2. ORTA KISIM: AKILLI QR KOD */}
          <View style={styles.qrSection}>
            <View style={styles.qrBorder}>
              {/* ESKİ IMAGE YERİNE BU GELDİ */}
              <QRCode 
                value={qrValue} 
                size={150} 
                backgroundColor='white' 
                color='black'
              />
              
              {/* Eğer bilet kullanıldıysa damga bas */}
              {ticketData.isUsed && (
                 <View style={styles.usedStamp}>
                     <Text style={styles.usedText}>KULLANILDI</Text>
                 </View>
              )}
            </View>
            
            <Text style={styles.codeLabel}>BİLET KODU</Text>
            <Text style={styles.ticketCode}>{ticketData.ticketCode || ticketData.id}</Text>

            <View style={styles.securityBox}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={styles.liveDot} />
                </Animated.View>
                <Text style={styles.securityText}>Canlı Bilet • Ekran Görüntüsü Geçersizdir</Text>
            </View>
          </View>

          <View style={styles.dashedLineContainer}>
            <View style={styles.circleLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.circleRight} />
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>AD SOYAD</Text>
              <Text style={styles.value}>{ticketData.userName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>TARİH</Text>
              <Text style={styles.value}>{ticketData.date}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>SAAT</Text>
              <Text style={styles.value}>{ticketData.time}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>KATEGORİ</Text>
              <Text style={[styles.value, { color: '#D500F9', fontWeight: '900' }]}>
                {ticketData.category}
              </Text>
            </View>
          </View>

          <View style={styles.ticketFooter}>
            <Text style={styles.brandText}>KONYA<Text style={styles.brandVibe}>VIBE</Text></Text>
            <Text style={styles.secureText}>Güvenli Giriş Sistemi</Text>
          </View>

        </View>

        <Text style={styles.brightnessHint}>
            💡 Girişte lütfen ekran parlaklığınızı açınız.
        </Text>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 5 },
  pageTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  scrollContent: { alignItems: 'center', paddingBottom: 50 },

  ticketCard: {
    width: width * 0.85, 
    backgroundColor: '#1E1E1E', 
    borderRadius: 20, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#333',
    shadowColor: '#00f3ff', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 20, 
    elevation: 10,
  },

  eventImage: { width: '100%', height: 180, resizeMode: 'cover' },
  headerInfo: { padding: 20, alignItems: 'center', backgroundColor: '#1E1E1E' },
  artistName: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 5 },
  venueRow: { flexDirection: 'row', alignItems: 'center' },
  venueName: { color: '#ccc', fontSize: 16, marginLeft: 5 },

  dashedLineContainer: { flexDirection: 'row', alignItems: 'center', height: 30, backgroundColor: '#1E1E1E', overflow: 'hidden' },
  circleLeft: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#000', marginLeft: -15 },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: '#444', borderStyle: 'dashed', marginHorizontal: 10 },
  circleRight: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#000', marginRight: -15 },

  qrSection: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#1E1E1E' },
  qrBorder: { padding: 10, backgroundColor: '#fff', borderRadius: 10, position: 'relative' },
   
  // 🔥 YENİ EKLENEN STİL: DAMGA
  usedStamp: {
      position: 'absolute', top: 40, left: -10, right: -10,
      backgroundColor: 'rgba(255, 0, 0, 0.85)', padding: 5,
      transform: [{ rotate: '-45deg' }], alignItems: 'center', justifyContent: 'center', zIndex: 10
  },
  usedText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 2 },

  codeLabel: { color: '#666', fontSize: 10, marginTop: 15, letterSpacing: 2 },
  ticketCode: { color: '#00f3ff', fontSize: 20, fontWeight: 'bold', letterSpacing: 2, marginTop: 5 },

  securityBox: { flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00ff00', marginRight: 8, shadowColor: '#00ff00', shadowRadius: 5, shadowOpacity: 1 },
  securityText: { color: '#888', fontSize: 10, fontWeight: 'bold' },

  detailsSection: { padding: 25, backgroundColor: '#1E1E1E' },
  detailRow: { marginBottom: 15 },
  label: { color: '#666', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 3 },
  value: { color: '#fff', fontSize: 16, fontWeight: '600' },

  ticketFooter: { alignItems: 'center', paddingBottom: 25, backgroundColor: '#1E1E1E', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 15 },
  brandText: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  brandVibe: { color: '#00f3ff' },
  secureText: { color: '#444', fontSize: 10, marginTop: 5 },

  brightnessHint: { color: '#666', marginTop: 20, fontSize: 12, fontStyle: 'italic' }
});

export default DigitalTicketScreen;