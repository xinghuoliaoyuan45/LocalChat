import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput  
} from 'react-native';

import io from "socket.io-client";
 
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      chatMessages: []
    }
  }

  componentDidMount() {

    // this.socket makes a global variable 
    this.socket = io("http://192.168.1.124:3000");
    this.socket.on("chat message", message => {
      this.setState({ chatMessages: [...this.state.chatMessages, message]});
      // console.log(this.state.chatMessages)
    })
  }

  // sending chat message to server
  submitMessage() {
    // console.log("sent")
    this.socket.emit("chat message", this.state.message);
    this.setState({ message: ""})
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
        {chatMessages}
      </View>
    )
  }
}
