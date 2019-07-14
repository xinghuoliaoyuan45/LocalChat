import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Linking
} from 'react-native';

import io from "socket.io-client";
import { createStackNavigator, createAppContainer } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';

class App extends Component {
  static navigationOpens = {
    header: null
  }
  state = {
    user : undefined
  }
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      chatMessages: [],
    }
  }

  componentDidMount() {

    // this.socket makes a global variable 
    this.socket = io("http://192.168.1.124:3000");
    this.socket.on("chat message", message => {
      this.setState({ chatMessages: [...this.state.chatMessages, message]});
      // console.log(this.state.chatMessages)
    })

     // Add event listener to handle OAuthLogin:// URLs
     Linking.addEventListener('url', this.handleOpenURL);
     // Launched from an external URL
     Linking.getInitialURL().then((url) => {
       if (url) {
         this.handleOpenURL({ url });
       }
     });
  }

  componentWillUnmount() {
    // Remove event listener
    Linking.removeEventListener('url', this.handleOpenURL);
  };

  handleOpenURL = ({ url }) => {
    // Extract stringified user string out of the URL
    const [, user_string] = url.match(/user=([^#]+)/);
    this.setState({
      // Decode the user string and parse it into JSON
      user: JSON.parse(decodeURI(user_string))
    });
    if (Platform.OS === 'ios') {
      SafariView.dismiss();
    }
  };

  loginWithFacebook = () => this.openURL('https://localhost:3000/auth/facebook');

  // Handle Login with Google button tap
  loginWithGoogle = () => this.openURL('https://localhost:3000/auth/google');

  // Open URL in a browser
  openURL = (url) => {
    // Use SafariView on iOS
    if (Platform.OS === 'ios') {
      SafariView.show({
        url: url,
        fromBottom: true,
      });
    }
    // Or Linking.openURL on Android
    else {
      Linking.openURL(url);
    }
  };

  // sending chat message to server
  submitMessage() {
    // console.log("sent")
    this.socket.emit("chat message", this.state.message);
    this.setState({ message: ""})
  }

  onPress = () => {
    this.props.navigation.push('Login');

  }

  render() {
    const chatMessages = this.state.chatMessages.map(chatMessage => {
      return <Text> {chatMessage} </Text>});
    return(
      <View style = { {flex: 1} }>
        <TextInput
          style = {{ height: 40, borderWidth: 2, backgroundColor: 'green' }}
          autoCorrect = { false }
          value = {this.state.message}

          // send
          onSubmitEditing = {() => {this.submitMessage()}}

          // typing
          onChangeText = { message => {
            this.setState({ message });
          }}
        />
        <Text onPress = {this.onPress}>
          Click meee
        </Text>
        {chatMessages}
      </View>
    )
  }
}

class DetailsScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Details Screen</Text>
      </View>
    );
  }
}

class LoginScreen extends Component {
  render() {
    const user  = this.state;
    return (
      <View style={styles.container}>
        { user
          ? // Show user info if already logged in
            <View style={styles.content}>
              <Text style={styles.header}>
                Welcome {user.name}!
              </Text>
              <View style={styles.avatar}>
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              </View>
            </View>
          : // Show Please log in message if not
            <View style={styles.content}>
              <Text style={styles.header}>
                Welcome Stranger!
              </Text>
              <View style={styles.avatar}>
                <Icon name="user-circle" size={100} color="rgba(0,0,0,.09)" />
              </View>
              <Text style={styles.text}>
                Please log in to continue {'\n'}
                
              </Text>
            </View>
        }
        {/* Login buttons */}
        <View style={styles.buttons}>
          <Icon.Button
            name="facebook"
            backgroundColor="#3b5998"
            onPress={this.loginWithFacebook}
            {...iconStyles}
          >
            Login with Facebook
          </Icon.Button>
          <Icon.Button
            name="google"
            backgroundColor="#DD4B39"
            onPress={this.loginWithGoogle}
            {...iconStyles}
          >
            Or with Google
          </Icon.Button>
        </View>
      </View>
    );
  }
}

const AppNavigator = createStackNavigator(
  {
    Home: App,
    Details: DetailsScreen,
    Login: LoginScreen
  },
  {
    initialRouteHome: LoginScreen
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    margin: 20,
  },
  avatarImage: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  text: {
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  buttons: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    margin: 20,
    marginBottom: 30,
  },
});

const iconStyles = {
  borderRadius: 10,
  iconStyle: { paddingVertical: 5 },
};

export default createAppContainer(AppNavigator);

