export const environment = {
  production: false,
  /** Base API : doit inclure le context-path Spring `server.servlet.context-path=/f`. */
  apiUrl: 'http://localhost:8083/f',
  /**
   * Client OAuth Web (Google Cloud Console → identifiants → ID client Web).
   * Doit être identique à `google.oauth.client-id` dans `application.properties`.
   */
  googleClientId:
    '934039181083-90loa0ibafrsqvopn5u1n89nd6jboe51.apps.googleusercontent.com',
};
