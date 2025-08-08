import $sys from 'src/lambdatt.js';
import ENDPOINTS from '../ENDPOINTS';
// import { getCurrentRoute, getRouter } from 'src/boot/global-helpers';

export default {
  loggedUser: null,

  async authenticate() {
    if (navigator.onLine === false) return;

    $sys.getService('toolcase/eventbroadcaster').$broadcast('load', 'auth');

    try {
      const response = await $sys.getService('toolcase/http').get(ENDPOINTS.AUTH.LOGGED_USER)
      this.loggedUser = response.data;
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
      $sys.getService('toolcase/eventbroadcaster').$broadcast('loaded', 'auth');
    }
  },

  logout() {
    $sys.getService('toolcase/eventbroadcaster').$broadcast('load', 'logout');

    var url = $sys.getModule('iam').ENDPOINTS.AUTH.LOGOUT;

    if (localStorage.getItem('authtoken'))
      url += '?token=' + localStorage.getItem('authtoken');

    return $sys.getService('toolcase/http').delete(url)
      .then(function () {
        $sys.getService('toolcase/eventbroadcaster').$broadcast('loaded', 'logout');
        localStorage.removeItem('authtoken');
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
      });
  }
}
