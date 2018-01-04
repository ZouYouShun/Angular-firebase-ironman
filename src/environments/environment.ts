// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  serverUrl: 'https://us-central1-my-firebase-first-app.cloudfunctions.net',
  websiteTitle: {
    zhTw: 'onfirechat',
    enUS: 'onfirechat',
  },
  nonAuthenticationUrl: ['/', 'auth', 'signin'],
  firebase: {
    apiKey: 'AIzaSyAg7zgatP_9WpjR1b1_3UzEiJU7LmE-EXw',
    authDomain: 'my-firebase-first-app.firebaseapp.com',
    databaseURL: 'https://my-firebase-first-app.firebaseio.com',
    projectId: 'my-firebase-first-app',
    storageBucket: 'my-firebase-first-app.appspot.com',
    messagingSenderId: '601992634037'
  }
};
