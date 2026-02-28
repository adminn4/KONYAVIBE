import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ContactSupportScreen = ({ navigation }) => {

  
  // 1. WhatsApp numaram 
  const WHATSAPP_NUMBER = "905063442506"; 
   
  // 2. Kendi e-posta adresim
  const SUPPORT_EMAIL = "attopal267@gmail.com"; 
   
  // 3. Instagram profil linki
  const INSTAGRAM_URL = "https://www.instagram.com/konyavibeofficial";


  // WHATSAPP FONKSİYONU
  const handleWhatsApp = () => {
    // Kullanıcı tıkladığında ONUN telefonunda yazılı olacak mesaj:
    const message = "Merhaba KonyaVibe Destek Ekibi, bir konu hakkında yardımınıza ihtiyacım var. 👋";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
     
    Linking.openURL(url).catch(() => {
      alert("WhatsApp uygulaması bulunamadı.");
    });
  };

  // INSTAGRAM FONKSİYONU
  const handleInstagram = () => {
    Linking.openURL(INSTAGRAM_URL).catch(() => {
      alert("Link açılamadı.");
    });
  };

  //  E-POSTA FONKSİYONU
  const handleEmail = () => {
    const subject = "KonyaVibe Destek Talebi";
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
     
    Linking.openURL(url).catch(() => {
      alert("E-posta uygulaması açılamadı.");
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
       
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Destek & İletişim</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Bilgi Kutusu */}
        <View style={styles.infoBox}>
           <View style={styles.iconCircle}>
              <Ionicons name="headset-outline" size={40} color="#00f3ff" />
           </View>
           <Text style={styles.infoTitle}>Size Nasıl Yardımcı Olabiliriz?</Text>
           <Text style={styles.infoText}>
             Aşağıdaki kanallardan bize 7/24 ulaşabilirsiniz. En kısa sürede dönüş yapacağız.
           </Text>
        </View>

        {/* İLETİŞİM BUTONLARI */}
        <View style={styles.buttonsArea}>

            {/* 1. WHATSAPP BUTONU */}
            <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                    <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
                </View>
                <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>WhatsApp Destek Hattı</Text>
                    <Text style={styles.cardDesc}>Anında canlı sohbet başlatın</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            {/* 2. INSTAGRAM BUTONU */}
            <TouchableOpacity style={styles.contactCard} onPress={handleInstagram}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(225, 48, 108, 0.15)' }]}>
                    <Ionicons name="logo-instagram" size={28} color="#E1306C" />
                </View>
                <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>Instagram'da Takip Et</Text>
                    <Text style={styles.cardDesc}>@konyavibeofficial</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            {/* 3. E-POSTA BUTONU */}
            <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(0, 243, 255, 0.15)' }]}>
                    <Ionicons name="mail" size={28} color="#00f3ff" />
                </View>
                <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>E-posta Gönder</Text>
                    <Text style={styles.cardDesc}>Detaylı sorularınız için</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

        </View>

        {/* Alt Bilgi */}
        <Text style={styles.footerText}>
            Çalışma Saatleri: 09:00 - 02:00
        </Text>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backButton: { padding: 8, backgroundColor: '#1E1E1E', borderRadius: 12, marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
   
  content: { padding: 20, paddingBottom: 50 },
   
  infoBox: { alignItems: 'center', marginBottom: 30, padding: 10 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0, 243, 255, 0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  infoTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  infoText: { color: '#aaa', textAlign: 'center', lineHeight: 22, fontSize: 14 },

  buttonsArea: { gap: 15 }, // Kartlar arası boşluk bıraktım

  // KART TASARIMI 
  contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1E1E1E',
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#333',
  },
  cardIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { color: '#888', fontSize: 12 },

  footerText: { color: '#444', textAlign: 'center', marginTop: 40, fontSize: 12 }
});

export default ContactSupportScreen;