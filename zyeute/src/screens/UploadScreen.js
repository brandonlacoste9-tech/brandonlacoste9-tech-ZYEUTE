import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export default function UploadScreen() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'On a besoin d\'accès à tes photos!');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'On a besoin d\'accès à ta caméra!');
      return;
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!image) {
      Alert.alert('Oups!', 'Choisis une photo d\'abord!');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Oups!', 'Écris un caption!');
      return;
    }

    try {
      setUploading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        Alert.alert('Erreur', 'Tu dois être connecté pour publier!');
        return;
      }

      // Convert image URI to blob for upload
      const response = await fetch(image);
      const blob = await response.blob();
      const fileExt = image.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('publications')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Erreur', 'Erreur lors de l\'upload de la photo');
        return;
      }

      // Create publication record with media_url (storage path)
      const { data, error: insertError } = await supabase
        .from('publications')
        .insert({
          user_id: user.id,
          content: caption.trim(),
          visibilite: 'public', // or 'amis' | 'prive'
          media_url: filePath, // Store the storage path (e.g., "user_id/filename.jpg")
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        Alert.alert('Erreur', 'Erreur lors de la publication. Les permissions d\'écriture seront ajoutées bientôt!');
        return;
      }

      // Success!
      Alert.alert('Tiguidou!', 'Ton post a été publié! 🔥⚜️', [
        {
          text: 'OK',
          onPress: () => {
            setCaption('');
            setImage(null);
          },
        },
      ]);
    } catch (err) {
      console.error('Error in handlePost:', err);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Publier sur Zyeuté 🔥</Text>

      {/* Image Picker */}
      <View style={styles.imageSection}>
        {image ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setImage(null)}
            >
              <Text style={styles.removeImageText}>✕ Retirer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Pas de photo</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, uploading && styles.buttonDisabled]} 
            onPress={pickImage}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>📱 Galerie</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, uploading && styles.buttonDisabled]} 
            onPress={takePhoto}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>📸 Caméra</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption Input */}
      <View style={styles.captionSection}>
        <Text style={styles.label}>Caption en Joual ⚜️</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Tabarnak que c'est beau!"
          placeholderTextColor="#8B7355"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={500}
          editable={!uploading}
        />
        <Text style={styles.charCount}>{caption.length}/500</Text>
      </View>

      {/* Suggestions */}
      <View style={styles.suggestions}>
        <Text style={styles.suggestionsTitle}>Suggestions Joual:</Text>
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={styles.suggestionChip}
            onPress={() => setCaption(caption + ' Tiguidou!')}
            disabled={uploading}
          >
            <Text style={styles.chipText}>Tiguidou!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.suggestionChip}
            onPress={() => setCaption(caption + ' 🔥')}
            disabled={uploading}
          >
            <Text style={styles.chipText}>🔥 Feu!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.suggestionChip}
            onPress={() => setCaption(caption + ' ⚜️')}
            disabled={uploading}
          >
            <Text style={styles.chipText}>⚜️ Québec</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Publish Button */}
      <TouchableOpacity 
        style={[styles.publishButton, uploading && styles.publishButtonDisabled]} 
        onPress={handlePost}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#2A1F16" />
        ) : (
          <Text style={styles.publishText}>🔥 Publier</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1410', // Very dark leather
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5C842', // Gold
    marginBottom: 24,
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: '#2A1F16',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F5C842',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    height: 250,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: '#8B7355',
    fontSize: 16,
  },
  previewText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#F5C842', // Gold
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#2A1F16', // Dark leather
    fontSize: 16,
    fontWeight: 'bold',
  },
  captionSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F5C842',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A1F16',
    borderWidth: 1,
    borderColor: '#F5C842',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#8B7355',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  suggestions: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#B8A890',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#2A1F16',
    borderWidth: 1,
    borderColor: '#F5C842',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chipText: {
    color: '#F5C842',
    fontSize: 14,
    textAlign: 'center',
  },
  publishButton: {
    backgroundColor: '#F5C842',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#F5C842',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishText: {
    color: '#2A1F16',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
