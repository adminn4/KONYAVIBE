import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Vibration } from 'react-native';
import { CameraView, Camera } from "expo-camera"; 
import { Ionicons } from '@expo/vector-icons';
import { db } from './firebaseConfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { useUser } from './UserContext'; 

export default function ScannerScreen() {
  //  Buraya 'user' ekledim ki  hangi mekanda çalıştığımı belli olsun
  const { user, logout } = useUser(); 
  
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
      
    setScanned(true);
    setLoading(true);
    Vibration.vibrate(); 

    try {
      // 1. QR KODU PARÇALA
      const parts = data.split('|');
      
      if (parts.length !== 2) {
          throw new Error("Geçersiz QR Formatı");
      }

      const [userId, ticketId] = parts;

      // 2. VERİTABANINDAN BİLETİ ÇEK
      const ticketRef = doc(db, 'users', userId, 'tickets', ticketId); // 'users' koleksiyonunda biletler firebasede
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
          throw new Error("Bilet bulunamadı!");
      }

      const ticketData = ticketSnap.data();

     // --- 🔥 GÜVENLİK DUVARI V2.0 🔥 ---
      
      // 1. KONTROL: Biletin içinde Event ID var mı?
      if (!ticketData.eventId) {
          Alert.alert("HATA", "Bu bilet eski sürüm veya hatalı. Etkinlik ID'si yok.");
          setResultData({
              status: 'error',
              title: 'Hatalı Bilet',
              eventName: 'Güvenlik verisi eksik',
              owner: 'Eski Bilet',
              date: '-'
          });
          return;
      }

      // 2. KONTROL: Etkinlik Veritabanında var mı?
      const eventRef = doc(db, 'events', ticketData.eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
          Alert.alert("HATA", "Bu biletin ait olduğu etkinlik silinmiş.");
          setIsValid(false);
          return;
      }

      const eventData = eventSnap.data();

      // DEBUG İÇİN: Konsola (veya ekrana alert ile) ne okuduğu yazılıyor
      console.log("Görevli Yeri:", user?.workPlace);
      console.log("Etkinlik Yeri:", eventData.location);

      // 3. KONTROL: MEKAN EŞLEŞİYOR MU?
      // Eğer Admin değilse VE (Mekanlar uyuşmuyorsa)
      // NOT: Harf hatasını önlemek için ikisini de küçültüp (toLowerCase) ve boşlukları silip (trim) kıyaslamış gemini
      const staffPlace = user?.workPlace?.trim().toLowerCase();
      const eventPlace = eventData.location?.trim().toLowerCase();

      if (user?.role !== 'admin' && staffPlace !== eventPlace) {
          
          Vibration.vibrate([0, 500, 200, 500]); // Çift titreşim (Hata uyarısı) verdim
          setResultData({
              status: 'error',
              title: '⛔ YANLIŞ MEKAN',
              eventName: 'Giriş Yetkiniz Yok!',
              owner: `Bilet: ${eventData.location}`,
              date: `Siz: ${user?.workPlace || 'Tanımsız'}`
          });
          return; // DUR!
      }
      // --- 🔥 GÜVENLİK DUVARI SONU 🔥 ---


      // 3. KONTROL ET: KULLANILMIŞ MI?
      if (ticketData.isUsed === true) {
          //  ZATEN KULLANILMIŞ!
          setResultData({
              status: 'used',
              title: 'Bilet Daha Önce Kullanılmış',
              eventName: ticketData.eventName || 'Etkinlik',
              owner: ticketData.name || ticketData.ownerName || 'Bilinmiyor',
              date: ticketData.date,
              usedAt: ticketData.usedAt ? new Date(ticketData.usedAt.seconds * 1000).toLocaleTimeString() : 'Bilinmiyor'
          });
      } else {
          // ✅ TEMİZ BİLET! KULLANILDI OLARAK İŞARETLE
          await updateDoc(ticketRef, {
              isUsed: true,
              usedAt: new Date(), 
              status: 'KULLANILDI' 
          });

          setResultData({
              status: 'success',
              title: 'Bilet Onaylandı',
              eventName: ticketData.eventName,
              owner: ticketData.name || 'Misafir',
              date: ticketData.date
          });
      }

    } catch (error) {
      //  HATA DURUMU
      setResultData({
          status: 'error',
          title: 'Geçersiz Bilet',
          eventName: 'Sistemde bulunamadı veya QR hatalı',
          owner: '-',
          date: '-'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setResultData(null);
  };

  if (hasPermission === null) return <View style={styles.container}><Text>İzin isteniyor...</Text></View>;
  if (hasPermission === false) return <View style={styles.container}><Text>Kamera izni yok.</Text></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* KARARTMA VE ÇERÇEVE */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
              <Text style={styles.title}>Bilet Kontrol</Text>
              <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                  <Ionicons name="log-out-outline" size={24} color="#fff" />
              </TouchableOpacity>
        </View>
        <View style={styles.middleRow}>
              <View style={styles.sideOverlay} />
              <View style={styles.cutout} />
              <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
              <Text style={styles.instruction}>QR Kodu çerçeveye hizalayın</Text>
              {/* Görevlinin nerede çalıştığını altına ufak not olarak düşelim ki emin olsun */}
              <Text style={{color:'#666', fontSize:12, marginTop:5}}>
                  Görev Yeri: {user?.workPlace || 'Admin'}
              </Text>
        </View>
      </View>

      {/* SONUÇ KARTI */}
      {resultData && (
        <View style={styles.resultModal}>
            <View style={[styles.resultHeader, 
                resultData.status === 'success' ? styles.bgSuccess : 
                resultData.status === 'used' ? styles.bgWarning : styles.bgError
            ]}>
                <Ionicons 
                    name={resultData.status === 'success' ? "checkmark-circle" : "alert-circle"} 
                    size={32} color="#fff" 
                />
                <Text style={styles.resultTitle}>{resultData.title}</Text>
            </View>
            
            <View style={styles.resultBody}>
                <Text style={styles.eventName}>{resultData.eventName}</Text>
                <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{resultData.date}</Text>
                </View>
                
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Etkinlik Tarihi</Text>
                        <Text style={styles.value}>{resultData.date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Sahibi / Detay</Text>
                        <Text style={styles.value}>{resultData.owner}</Text>
                    </View>
                </View>

                {resultData.status === 'used' && (
                      <View style={styles.errorBox}>
                         <Text style={styles.errorText}>
                            ⚠️ Bu bilet saat {resultData.usedAt} civarında zaten okutulmuş.
                         </Text>
                      </View>
                )}

                <View style={{flexDirection:'row', gap: 10, marginTop: 20}}>
                    <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
                        <Ionicons name="scan" size={20} color="#000" />
                        <Text style={styles.scanAgainText}>Yeniden Tara</Text>
                    </TouchableOpacity>
                    
                    {resultData.status === 'success' && (
                        <View style={styles.successBadge}>
                            <Ionicons name="checkmark" size={20} color="#fff" />
                            <Text style={{color:'#fff', fontWeight:'bold'}}>Onaylandı</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
      )}

      {loading && (
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#00f3ff" />
              <Text style={{color:'#fff', marginTop:10}}>Sorgulanıyor...</Text>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1 },
  topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  middleRow: { flexDirection: 'row', height: 280 }, 
  sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  cutout: { width: 280, borderColor: '#fff', borderWidth: 2, borderRadius: 20 }, 
  bottomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', paddingTop: 20 },
   
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { position: 'absolute', right: 20, top: 55 },
  instruction: { color: '#ccc', fontSize: 14 },

  resultModal: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 10 },
  resultHeader: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  resultTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
   
  bgSuccess: { backgroundColor: '#4caf50' }, // Yeşil
  bgWarning: { backgroundColor: '#ff9800' }, // Turuncu
  bgError: { backgroundColor: '#f44336' },   // Kırmızı

  resultBody: { padding: 20, alignItems: 'center' },
  eventName: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  tagContainer: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10, marginTop: 10 },
  tagText: { color: '#666', fontWeight: 'bold' },

  infoContainer: { flexDirection: 'row', width: '100%', marginTop: 20, justifyContent: 'space-between', backgroundColor: '#fafafa', padding: 15, borderRadius: 10 },
  infoRow: { alignItems: 'center', flex: 1 },
  label: { color: '#999', fontSize: 12, marginBottom: 5 },
  value: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  errorBox: { marginTop: 15, backgroundColor: '#fff3e0', padding: 10, borderRadius: 5, width: '100%' },
  errorText: { color: '#e65100', textAlign: 'center', fontWeight: 'bold' },

  scanAgainButton: { flex: 1, flexDirection: 'row', backgroundColor: '#e0e0e0', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scanAgainText: { marginLeft: 5, fontWeight: 'bold', color: '#333' },
   
  successBadge: { flex: 1, flexDirection: 'row', backgroundColor: '#4caf50', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }
});