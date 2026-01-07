import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Home from './components/Home';
import Signup from './components/ChatSign';
import Chat from './components/Chat';
import './App.css';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import ChatBoxes from './components/ChatBoxes';

const APP_ID = import.meta.env.VITE_COMETCHAT_APPID;
const REGION = "us";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (APP_ID) {
      const appSetting = new CometChat.AppSettingsBuilder()
        .subscribePresenceForAllUsers()
        .setRegion(REGION)
        .autoEstablishSocketConnection(true)
        .build();

      CometChat.init(APP_ID, appSetting)
        .then(() => {
          console.log("CometChat initialized successfully");
          setIsInitialized(true);
        })
        .catch((error) => {
          console.log("CometChat init failed:", error);
          setIsInitialized(true);
        });
    }
  }, []);

  if (!isInitialized) return <div>Loading...</div>;

  return (
    <Provider store={store}>
      <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chatboxes" element={<ChatBoxes />} />

      </Routes>
    </Provider>
  );
}


export default App;