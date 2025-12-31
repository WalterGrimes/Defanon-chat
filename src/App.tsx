import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { CometChat } from '@cometchat-pro/chat';

import Home from './components/Home';
import Signup from './components/ChatSign';
import Chat from './components/Chat';
import './App.css';

const APP_ID = import.meta.env.VITE_COMETCHAT_APPID;
const appSettings = new CometChat.AppSettingsBuilder()
  .subscribePresenceForAllUsers()
  .setRegion("us")
  .build();

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (APP_ID) {
      CometChat.init(APP_ID, appSettings)
        .then(() => setIsInitialized(true))
        .catch(() => setIsInitialized(true)); 
    }
  }, []);

  if (!isInitialized) return null;

  return (
    <Provider store={store}>
      <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Provider>
  );
}

export default App;