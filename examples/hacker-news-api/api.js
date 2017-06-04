import Firebase from 'firebase/app';
import Database from 'firebase/database';

const config = {
  databaseURL: 'https://hacker-news.firebaseio.com',
};
Firebase.initializeApp(config);
const version = '/v0';
const api = Firebase.database().ref(version);

export default api;
