export const environment = {
  production: false,
  /**
   * En dev, URL absolue vers Spring pour éviter que le proxy ne redirige par erreur des chemins du front
   * (ex. une URL copiée-collée `…/f/formation` qui ne doit pas partir vers Tomcat).
   * CORS est déjà ouvert côté Spring pour localhost.
   */
  apiUrl: 'http://localhost:8083/f',
  /**
   * Client OAuth Web (Google Cloud Console → identifiants → ID client Web).
   * Doit être identique à `google.oauth.client-id` dans `application.properties`.
   */
  googleClientId:
    '934039181083-90loa0ibafrsqvopn5u1n89nd6jboe51.apps.googleusercontent.com',
};
