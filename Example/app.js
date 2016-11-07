import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions
} from 'react-native'
import ProgressiveImage from './prog'
import ProgressCircle from 'react-native-progress/Circle';

const TheProgressiveImage = () =>
  <ProgressiveImage
    thumbnailSource={{ uri: 'https://cdn1.thehunt.com/app/public/system/zine_images/10856318/thumb/72f9bcbca08112299697d744b2e1b05f.jpeg?bust' + Math.random() }}
    source={{ uri: 'https://cdn1.thehunt.com/app/public/system/zine_images/10856318/mobile/72f9bcbca08112299697d744b2e1b05f.jpeg?bust' + Math.random() }}
    style={{ flex: 1, backgroundColor: 'rgb(133,139,140)' }}
    thumbnailBlurRadius={2}
    threshold={300}
    indicator={ProgressCircle}
    indicatorProps={{
      size: 80,
      borderWidth: 1,
      color: 'rgba(0, 0, 0, 255)',
      backgroundColor: 'transparent',
      unfilledColor: 'rgba(200, 200, 200, 0)'
    }}
  />

export default () =>
  <View style={styles.container}>
    <StatusBar
      barStyle="light-content"
    />
    <TheProgressiveImage />
  </View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    backgroundColor: '#F5FCFF',
  },
  image: {
    flex: 1,
  }
})
