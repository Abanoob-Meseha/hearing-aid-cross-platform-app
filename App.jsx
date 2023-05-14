import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button , Image , TouchableOpacity} from 'react-native';
import { Audio } from 'expo-av';
import Slider from 'react-native-slider';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


export default function App() {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [volume, setVolume] = useState(0);


  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    setSound(newSound);
  };

  const playSound = async () => {
    console.log('Playing sound..');
    await sound.stopAsync();
    try {
      if (sound) {
        const { sound: newSound } = await sound.playAsync();
        newSound.setVolumeAsync(volume).then(
          setSound(newSound)
        )
  
        // Set the frequency based on the slider value
        const frequency = 1000 * volume;
        newSound.setPitchAsync(frequency);
  
        // Unload the sound so it can be played again
        newSound.setOnPlaybackStatusUpdate(null);
        await newSound.unloadAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const stopSound = async () => {
    console.log('Stopping sound..');
    await sound.stopAsync();
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/images/bannerImg.png')}/>
      <Text style={styles.title}>Record Voice from Here</Text>
      <TouchableOpacity style={styles.RecordButton} onPress={recording ? stopRecording : startRecording}>
        <Text style={styles.recordButtonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>
      
      {/* player controller section */}
      {sound && (
        <>
          <View style={styles.playControlContainer}>
            <View>
              <TouchableOpacity style={styles.controlButton} onPress={playSound}>
                <Text style={styles.controlButtonText}>Play Sound</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity style={styles.controlButton} onPress={stopSound}>
                <Text style={styles.controlButtonText}>Stop Sound</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gainSlider}>
            <Text>Gain Slider</Text>
            <Slider value={volume} onValueChange={()=>setVolume(volume)} minimumValue={0} maximumValue={1} step={0.1} style={styles.slider} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  
  RecordButton:{
    borderRadius: 25,
    backgroundColor: '#007AFF',
    padding: 15,
    width: '80%',
    height: '10%',
    alignItems: 'center',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
  },
  // player control buttons section
  playControlContainer:{
    marginTop: '10%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent : 'flex-start',
    width: '100%',
    height: '30%'
  },
  controlButton:{
    borderRadius: 25,
    backgroundColor: '#1236',
    padding: 10,
    width: '80%',
    height: '30%',
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gainSlider:{
    marginTop: 0,
  },
  slider: {
    width: 200,
    height: 20,
  },
});
