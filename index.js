import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ActivityIndicator,
  Image,
  View,
  StyleSheet,
  Platform,
  Animated,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  contained: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  progress: {
    position: 'absolute',
    top: 300, // How to get this centered?
    left: 150,
  },
});

const DefaultIndicator = ActivityIndicator;
const AnimatedImage = Animated.createAnimatedComponent(Image);

class ImageProgress extends Component {
  static propTypes = {
    indicator: PropTypes.func,
    indicatorProps: PropTypes.object,
    onPress: PropTypes.func,
    renderIndicator: PropTypes.func,
    threshold: PropTypes.number,
    thumbnailSource: PropTypes.object,
    thumbnailBlurRadius: PropTypes.number,
  };

  static defaultProps = {
    threshold: 50,
    thumbnailBlurRadius: 2,
    thumbnailFadeDuration: 250,
    imageFadeDuration: 250,
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      progress: 0,
      thresholdReached: !props.threshold,
      imageOpacity: new Animated.Value(0),
      thumbnailOpacity: new Animated.Value(0),
    };
  }

  componentDidMount() {
    if (this.props.threshold) {
      this._thresholdTimer = setTimeout(() => {
        this.setState({ thresholdReached: true });
        this._thresholdTimer = null;
      }, this.props.threshold);
    }
  }

  componentWillUnmount() {
    if (this._thresholdTimer) {
      clearTimeout(this._thresholdTimer);
    }
  }

  componentWillReceiveProps(props) {
    if (!this.props.source || !props.source || this.props.source.uri !== props.source.uri) {
      this.setState({
        loading: false,
        progress: 0,
      });
    }
  }

  onLoadThumbnail() {
    Animated.timing(this.state.thumbnailOpacity, {
      toValue: 1,
      duration: this.props.thumbnailFadeDuration,
    }).start()
  }

  onLoadImage() {
    Animated.timing(this.state.imageOpacity, {
      toValue: 1,
      duration: this.props.imageFadeDuration,
    }).start()
  }

  hasThumbnail() {
    return !!this.props.thumbnailSource
  }

  ref = null;
  handleRef = (ref) => {
    this.ref = ref;
  };

  setNativeProps(nativeProps) {
    if (this.ref) {
      this.ref.setNativeProps(nativeProps);
    }
  }

  bubbleEvent(propertyName, event) {
    if (typeof this.props[propertyName] === 'function') {
      this.props[propertyName](event);
    }
  }

  handleLoadStart = () => {
    if (!this.state.loading && this.state.progress !== 1) {
      this.setState({
        loading: true,
        progress: 0,
      });
    }

    this.bubbleEvent('onLoadStart');
  };

  handleProgress = (event) => {
    const progress = event.nativeEvent.loaded / event.nativeEvent.total;
    // RN is a bit buggy with these events, sometimes a loaded event and then a few
    // 100% progress – sometimes in an infinite loop. So we just assume 100% progress
    // actually means the image is no longer loading
    if (progress !== this.state.progress && this.state.progress !== 1) {
      this.setState({
        loading: progress < 1,
        progress: progress,
      });
    }
    this.bubbleEvent('onProgress', event);
  };

  handleError = (event) => {
    this.setState({
      loading: false,
    });
    this.bubbleEvent('onError', event);
  };

  handleLoad = (event) => {
    if (this.state.progress !== 1) {
      this.setState({
        loading: false,
        progress: 1,
      });
    }

    if(this.hasThumbnail) this.onLoadImage()
    this.bubbleEvent('onLoad', event);
  };

  render() {
    const { indicator, indicatorProps, renderIndicator, source, threshold, ...props } = this.props;
    const { progress, thresholdReached, loading } = this.state;

    let style = this.props.style;
    let content = this.props.children;

    if ((loading || progress < 1) && thresholdReached) {
      style = style ? [styles.container, style] : styles.container;
      if (renderIndicator) {
        content = renderIndicator(progress, !loading || !progress);
      } else {
        const IndicatorComponent = (typeof indicator === 'function' ? indicator : DefaultIndicator);
        content = (<IndicatorComponent progress={progress} indeterminate={!loading || !progress} {...indicatorProps} />);
      }
    }

    const containedImage =
      <AnimatedImage
        {...props}
        key={source ? source.uri || source : undefined}
        onLoadStart={this.handleLoadStart}
        onProgress={this.handleProgress}
        onError={this.handleError}
        onLoad={this.handleLoad}
        ref={this.handleRef}
        source={source}
        style={[styles.contained, {opacity: this.state.imageOpacity}]}
      />

    return (
      <View style={style}>
        <View style={styles.progress}>
          {content}
        </View>

        {this.props.thumbnailSource ?
          <AnimatedImage
            blurRadius={this.props.thumbnailBlurRadius}
            onLoad={() => this.onLoadThumbnail()}
            source={this.props.thumbnailSource}
            style={[style, {opacity: this.state.thumbnailOpacity}]}
          >
            {containedImage}
          </AnimatedImage>
          :
          containedImage
        }
      </View>
    );
  }
}

module.exports = ImageProgress;
