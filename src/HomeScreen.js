import React, {useState, useEffect} from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext'; 

const HomeScreen = ({ navigation }) => {
  const { user, isGuest } = useUser();

  // MEKAN LİSTESİ
  const venues = [
    {
      id: '3',
      name: 'PENTAGON',
      image: 'https://r.resimlink.com/98jo_yHDnA.jpeg',
      desc: 'Canlı müzik ve performans.',
      gallery: [
         'https://r.resimlink.com/P40Lq8_JMg-Q.jpeg',
         'https://r.resimlink.com/MA1y8Yaop-.webp',
         'https://r.resimlink.com/98jo_yHDnA.jpeg',
      ]
    },
    {
      id: '2',
      name: 'Selçuklu Kongre',
      image : 'https://scckonya.com/Images/News/PVJPP7TD_image00030-600x398.jpeg',
      desc: 'Dev konserler ve tiyatrolar.',
      gallery: [
        'https://images.unsplash.com/photo-1475721027766-966970794ca5?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1459749411177-d4a428c3e8cb?q=80&w=600&auto=format&fit=crop'
      ]
    },
    {
      id: '1',
      name: 'Club Inferno',
      image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
      desc: 'Konya\'nın en büyük gece kulübü.',
      gallery: [
        'https://images.unsplash.com/photo-1574391884720-385e6e28266b?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop'
      ]
    },
    {
      id: '4',
      name: 'MR FROG',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop',
      desc: 'Lüks otel etkinlikleri.',
      gallery: [
          'https://images.unsplash.com/photo-1561587352-7aa745277156?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1560942542-a7d5a52467d0?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600&auto=format&fit=crop'
      ]
    },
    {
      id: '5',
      name: 'KAHVA',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
      desc: 'Gala ve özel geceler.',
      gallery: [
          'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop'
      ]
    },
    {
    id: '6',
    name: 'KAR BEYAZI',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop',
    desc: 'Bembeyaz Gecelere...',
    gallery: [
        'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1459749411177-d4a428c3e8cb?q=80&w=600&auto=format&fit=crop'
    ]
    }
  ];

  const renderVenueItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('VenueEvents', { venue: item })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.overlay} />
       
      <View style={styles.cardContent}>
        <Text style={styles.venueName}>{item.name}</Text>
        <Text style={styles.venueDesc}>{item.desc}</Text>
        <View style={styles.arrowIcon}>
             <Ionicons name="arrow-forward-circle" size={40} color="#00f3ff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        {/* LOGO KISMI */}
        <View>
          <Text style={styles.brandText}>KONYA<Text style={styles.brandVibe}>VIBE</Text></Text>
          <Text style={styles.subGreeting}>Şehrin ritmini yakala 🔥</Text>
        </View>

        {/* PROFİL İKONU */}
        <TouchableOpacity onPress={() => navigation.navigate('Profil')}>
           <View style={styles.profileIcon}>
             <Ionicons name="person" size={20} color="#000" />
           </View>
        </TouchableOpacity>
      </View>

      {/* MEKAN LİSTESİ */}
      <FlatList
        data={venues}
        renderItem={renderVenueItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
   
  // --- LOGO STİLLERİ ---
  brandText: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  brandVibe: { color: '#00f3ff' },
  subGreeting: { color: '#888', fontSize: 12, marginTop: 2 },
  // --------------------------

  profileIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00f3ff', justifyContent: 'center', alignItems: 'center' },
   
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 }, 
  card: { height: 180, marginBottom: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1E1E1E' },
  cardImage: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
   
  cardContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  venueName: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 5 },
  venueDesc: { color: '#ccc', fontSize: 14 },
   
  arrowIcon: { position: 'absolute', right: 0, bottom: 5 }
});

export default HomeScreen;