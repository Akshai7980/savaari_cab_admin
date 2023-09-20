import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  firebaseConfig: {
    apiKey: 'AIzaSyAID4j7iI4fRGT6X3bZkyoiVdbTnz46_Gs',
    authDomain: 'savaaricabadminapp.firebaseapp.com',
    projectId: 'savaaricabadminapp',
    storageBucket: 'savaaricabadminapp.appspot.com',
    messagingSenderId: '837565731771',
    appId: '1:837565731771:web:83a7fce3395f9b1d46aa9e',
    measurementId: 'G-ZKHTDW4Y64'
  }
};
