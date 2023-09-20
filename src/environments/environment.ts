// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: false,
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
