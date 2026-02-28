import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext'; 

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isGuest, isAdmin } = useUser();
   
  const [legalModalVisible, setLegalModalVisible] = useState(false);

  const openDocument = (title, type) => {
    setLegalModalVisible(false);
    navigation.navigate('LegalDocuments', { title, type });
  };

  const menuItems = [
    { id: 1, title: 'Biletlerim', icon: 'ticket-outline' },
    { id: 2, title: 'Geçmiş Etkinliklerim', icon: 'time-outline' }, 
    { id: 3, title: 'İndirim ve Kampanya Kuponlarım', icon: 'gift-outline' },
    { id: 4, title: 'Satıcıya Sor', icon: 'chatbubbles-outline' },
    { id: 5, title: 'Yasal Belgeler', icon: 'document-text-outline' },
    { id: 6, title: 'Yardım', icon: 'help-circle-outline' },
    { id: 7, title: 'Çıkış Yap', icon: 'log-out-outline', isDanger: true }
  ];

  if (isAdmin) {
    menuItems.splice(6, 0, { id: 99, title: 'Yönetici Paneli (GİZLİ)', icon: 'construct-outline', isDanger: false, color: '#FFD700' });
  }

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapılacak.", [
        { text: "Vazgeç", style: "cancel" },
        { text: "Çıkış Yap", style: "destructive", onPress: () => {
            logout(); 
            navigation.navigate('MainTabs'); 
          }
        }
      ]
    );
  };

  const handleMenuPress = (item) => {
    if (isGuest && item.id <= 4) {
       Alert.alert("Giriş Yapmalısın", "Bu özelliği kullanmak için giriş yapmalısın.", 
       [{ text: "Vazgeç" }, { text: "Giriş Yap", onPress: () => navigation.navigate('Login') }]);
       return;
    }

    if (item.id === 1) navigation.navigate('MyTickets');
    else if (item.id === 2) navigation.navigate('PastEvents');
    else if (item.id === 3) navigation.navigate('Coupons');
    else if (item.id === 4) navigation.navigate('ContactSupport');
    else if (item.id === 5) setLegalModalVisible(true);
    else if (item.id === 6) navigation.navigate('Help'); 
    else if (item.id === 99) navigation.navigate('AdminPanel'); 
    else if (item.id === 7) handleLogout();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={[styles.avatarContainer, isGuest && { backgroundColor: '#333', borderColor: '#555' }]}>
          <Ionicons name={isGuest ? "person-outline" : "person"} size={60} color={isGuest ? "#888" : "#000"} />
        </View>
         
        <Text style={styles.userName}>
          {isGuest ? "Misafir Kullanıcı" : user?.name || "KonyaVıbe Üyesi"}
        </Text>
         
        {isAdmin && <Text style={styles.adminBadge}>👑 YÖNETİCİ</Text>}
         
        <Text style={styles.userTag}>
          {isGuest ? "Gezinmeye devam ediyorsunuz" : "Hoş Geldiniz! 🎉"}
        </Text>

        {isGuest && (
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>GİRİŞ YAP / KAYIT OL</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {menuItems.map((item) => {
          if (isGuest && item.id === 7) return null;

          return (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.menuItem,
                (isGuest && item.id <= 4) && { opacity: 0.5 },
                item.id === 99 && { borderColor: '#FFD700', borderWidth: 1 }
              ]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item)}
            >
              <View style={[styles.iconBox, item.isDanger && { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}>
                <Ionicons 
                  name={item.icon} 
                  size={24} 
                  color={item.color ? item.color : (item.isDanger ? '#ff4757' : '#00f3ff')} 
                />
              </View>
              <Text style={[
                  styles.menuText, 
                  item.isDanger && { color: '#ff4757' },
                  item.color && { color: item.color } 
              ]}>
                {item.title}
              </Text>
              {!item.isDanger && (
                <Ionicons name="chevron-forward" size={20} color="#666" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={legalModalVisible}
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLegalModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yasal Bilgilendirme</Text>
                            <TouchableOpacity onPress={() => setLegalModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>Lütfen incelemek istediğiniz belgeyi seçiniz.</Text>

                        <TouchableOpacity style={styles.docItem} onPress={() => openDocument('Kullanıcı Sözleşmesi', 'user_agreement')}>
                            <Ionicons name="document-text" size={20} color="#00f3ff" />
                            <Text style={styles.docText}>Kullanıcı Sözleşmesi</Text>
                            <Ionicons name="chevron-forward" size={16} color="#444" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.docItem} onPress={() => openDocument('Gizlilik Politikası', 'privacy_policy')}>
                            <Ionicons name="shield-checkmark" size={20} color="#00f3ff" />
                            <Text style={styles.docText}>Gizlilik Politikası</Text>
                            <Ionicons name="chevron-forward" size={16} color="#444" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.docItem} onPress={() => openDocument('KVKK Aydınlatma Metni', 'kvkk')}>
                            <Ionicons name="finger-print" size={20} color="#00f3ff" />
                            <Text style={styles.docText}>KVKK Aydınlatma Metni</Text>
                            <Ionicons name="chevron-forward" size={16} color="#444" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.docItem} onPress={() => openDocument('Mesafeli Satış Sözleşmesi', 'sales_agreement')}>
                            <Ionicons name="cart" size={20} color="#00f3ff" />
                            <Text style={styles.docText}>Mesafeli Satış Sözleşmesi</Text>
                            <Ionicons name="chevron-forward" size={16} color="#444" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.docItem} onPress={() => openDocument('İptal ve İade Koşulları', 'cancellation')}>
                            <Ionicons name="refresh-circle" size={20} color="#00f3ff" />
                            <Text style={styles.docText}>İptal ve İade Koşulları</Text>
                            <Ionicons name="chevron-forward" size={16} color="#444" />
                        </TouchableOpacity>

                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={{height: 100}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#00f3ff', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 4, borderColor: '#fff' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  userTag: { fontSize: 14, color: '#888', marginBottom: 20 },
  adminBadge: { color: '#FFD700', fontWeight: 'bold', fontSize: 12, marginBottom: 5, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.1)' },
  loginButton: { paddingVertical: 12, paddingHorizontal: 30, backgroundColor: '#00f3ff', borderRadius: 25, shadowColor: '#00f3ff', shadowOpacity: 0.5, elevation: 5 },
  loginButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
   
  menuContainer: { paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', paddingVertical: 18, paddingHorizontal: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, color: '#fff', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#1E1E1E', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333', elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalSubtitle: { color: '#888', fontSize: 12, marginBottom: 20 },
   
  docItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252525', padding: 15, borderRadius: 12, marginBottom: 10 },
  docText: { flex: 1, color: '#ddd', marginLeft: 15, fontSize: 14, fontWeight: '500' }
});

export default ProfileScreen;