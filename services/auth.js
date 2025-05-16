import { http, eventbroadcaster } from 'src/modules/lambdatt-ui-toolcase/services.js'
import { getCurrentRoute, getRouter } from 'src/boot/global-helpers';

export default {
  loggedUser: null,

  async authenticate() {
    if (navigator.onLine === false) return;

    eventbroadcaster.$broadcast('load', 'auth');

    try {
      const response = await http.get('/api/iam/auth/v1/logged-user')
      this.loggedUser = response.data;
    } catch (error) {
      console.error(error);
      if (error.response?.status == 401) {
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
        getRouter().push(`/login?goTo=${getCurrentRoute().path}`)
      }
    } finally {
      eventbroadcaster.$broadcast('loaded', 'auth');
    }
  },

  logout($component) {
    $component.$emit('load', 'logout');

    var url = '/api/iam/auth/v1/logout';

    if (localStorage.getItem('authtoken'))
      url += '?token=' + localStorage.getItem('authtoken');

    return http.delete(url)
      .then(function () {
        $component.$emit('loaded', 'logout');
        localStorage.removeItem('authtoken');
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
      });
  }
}
