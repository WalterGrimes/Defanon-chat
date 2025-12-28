import Chat from './components/Chat';
import './App.css'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { useEffect } from 'react';
import { CometChat } from '@cometchat-pro/chat';

console.log("Все переменные окружения:", import.meta.env);
const APP_ID = import.meta.env.VITE_COMETCHAT_APPID;
console.log("Мой APP_ID:", APP_ID);

if (!APP_ID) {
  throw new Error("VITE_COMETCHAT_APP is missing")
}

const appSettings = new CometChat.AppSettingsBuilder()
  .subscribePresenceForAllUsers()
  .setRegion("us")
  .build()

function App() {
  useEffect(() => {
    CometChat.init(APP_ID, appSettings)
      .then(() => {
        console.log("CometChat initialized");
      })
      .catch((error) => {
        console.error("CometChat init failed", error);
      });
  }, [])

  return (
    <Provider store={store}>
      <Chat />
      <link rel='stylesheet'
      href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'
      crossOrigin='anonymous'/>
    </Provider>
  )
}

export default App
