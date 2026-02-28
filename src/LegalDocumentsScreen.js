import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

//  YENİ OLUŞTURDUĞUMUZ VERİ DOSYASINI ÇAĞIRIYORUZ
import { LEGAL_DATA } from './LegalData';

const LegalDocumentsScreen = ({ navigation, route }) => {
  const { title, type } = route.params || { title: 'Belge', type: 'user_agreement' };

  // Veri dosyasından ilgili metni çek, yoksa hata mesajı göster
  const content = LEGAL_DATA[type] || "İçerik yüklenemedi. Lütfen internet bağlantınızı kontrol edin.";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
       
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.textBox}>
            {/* Metni ekrana basıyoruz */}
            <Text style={styles.text}>{content}</Text>
        </View>
        
        <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#666" />
            <Text style={styles.footerText}>KonyaVibe Hukuk Birimi Tarafından Hazırlanmıştır.</Text>
        </View>
        
        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backButton: { padding: 8, backgroundColor: '#1E1E1E', borderRadius: 12, marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1 }, // Flex ekledim ki uzun başlık sığsın
  content: { padding: 20 },
   
  textBox: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  text: { color: '#ddd', fontSize: 15, lineHeight: 24, textAlign: 'left' },

  footerNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, opacity: 0.5 },
  footerText: { color: '#666', fontSize: 12, marginLeft: 5 }
});

export default LegalDocumentsScreen;