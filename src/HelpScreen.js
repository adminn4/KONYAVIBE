import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Android'de animasyonun çalışması için gereken ayar
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const HelpScreen = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState(null);

  // SIKÇA SORULAN SORULAR VERİSİ
  const faqData = [
    {
      id: 1,
      category: 'BİLET İŞLEMLERİ',
      questions: [
        { id: 101, q: 'Biletim nerede?', a: 'Satın aldığınız biletler Profil > Biletlerim sekmesine anında yüklenir.' },
        { id: 102, q: 'QR Kod okumuyor?', a: 'Ekran parlaklığını en sona getirin. Sorun devam ederse bilet kodunu (KV-xxxx) gişeye söyleyin.' },
      ]
    },
    {
      id: 2,
      category: 'İPTAL VE İADE',
      questions: [
        { id: 201, q: 'İade edebilir miyim?', a: 'Etkinliğe 48 saat kala yapılan iptallerde kesintisiz iade yapılır.' },
        { id: 202, q: 'Etkinlik iptal olursa?', a: 'Organizatör iptallerinde ücret otomatik olarak kartınıza iade edilir.' },
      ]
    },
    {
      id: 3,
      category: 'HESAP',
      questions: [
        { id: 301, q: 'Şifremi unuttum', a: 'Giriş ekranındaki "Şifremi Unuttum" butonunu kullanabilirsiniz.' },
      ]
    }
  ];

  // Aç/Kapa Animasyonu
  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım Merkezi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {faqData.map((section) => (
          <View key={section.id} style={styles.sectionContainer}>
            <Text style={styles.categoryTitle}>{section.category}</Text>

            {section.questions.map((item) => {
              const isOpen = expandedId === item.id;
               
              return (
                <View key={item.id} style={styles.faqItem}>
                  <TouchableOpacity 
                    style={styles.questionRow} 
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.questionText, isOpen && { color: '#00f3ff' }]}>
                      {item.q}
                    </Text>
                    <Ionicons 
                      name={isOpen ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={isOpen ? "#00f3ff" : "#666"} 
                    />
                  </TouchableOpacity>
                   
                  {/* CEVAP KISMI (Sadece açıksa görünür) */}
                  {isOpen && (
                    <View style={styles.answerBox}>
                      <Text style={styles.answerText}>{item.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {/* SATICIYA SOR YÖNLENDİRMESİ */}
        <View style={styles.contactBox}>
          <Text style={styles.contactText}>Cevabı bulamadınız mı?</Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <Text style={styles.contactButtonText}>Satıcıya Sor</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backButton: { padding: 8, backgroundColor: '#1E1E1E', borderRadius: 12, marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 50 },
  sectionContainer: { marginBottom: 25 },
  categoryTitle: { color: '#D500F9', fontSize: 14, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  faqItem: { backgroundColor: '#1E1E1E', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  questionText: { color: '#fff', fontSize: 15, fontWeight: '500', flex: 1, marginRight: 10 },
  answerBox: { padding: 15, paddingTop: 0, backgroundColor: '#1E1E1E' },
  answerText: { color: '#ccc', fontSize: 14, lineHeight: 20 },
   
  contactBox: { marginTop: 20, alignItems: 'center', padding: 20, backgroundColor: '#1A1A1A', borderRadius: 20, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed' },
  contactText: { color: '#fff', marginBottom: 15 },
  contactButton: { backgroundColor: '#00f3ff', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20 },
  contactButtonText: { color: '#000', fontWeight: 'bold' }
});

export default HelpScreen;