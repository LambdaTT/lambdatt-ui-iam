import $sys from 'src/lambdatt.js';
import ENDPOINTS from '../ENDPOINTS';

var loggedUser = null;

export default {
  async authenticate() {
    if (navigator.onLine === false) return;

    $sys.getService('toolcase/loader').load( 'auth');

    try {
      const response = await $sys.getService('toolcase/http').get(ENDPOINTS.AUTH.LOGGED_USER)
      loggedUser = response.data;
    } catch (error) {
      console.error(error);
      if (error.response?.status == 401) {
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
        $sys.getRouter().push(`/login?goTo=${$sys.getCurrentRoute().path}`)
      }
    } finally {
      $sys.getService('toolcase/loader').loaded( 'auth');
    }
  },

  logout() {
    $sys.getService('toolcase/loader').load( 'logout');

    var url = ENDPOINTS.AUTH.LOGOUT;

    if (localStorage.getItem('authtoken'))
      url += '?token=' + localStorage.getItem('authtoken');

    return $sys.getService('toolcase/http').delete(url)
      .then(function () {
        $sys.getService('toolcase/loader').loaded( 'logout');
        localStorage.removeItem('authtoken');
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
      });
  },

  getLoggedUser() {
    return loggedUser;
  }
}
