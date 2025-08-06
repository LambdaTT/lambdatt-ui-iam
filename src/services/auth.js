import { TOOLCASE } from 'src/modules/lambdatt-ui-toolcase'
import ENDPOINTS from '../ENDPOINTS';
// import { getCurrentRoute, getRouter } from 'src/boot/global-helpers';

export default {
  loggedUser: null,

  async authenticate() {
    if (navigator.onLine === false) return;

    TOOLCASE.SERVICES.eventbroadcaster.$broadcast('load', 'auth');

    try {
      const response = await TOOLCASE.SERVICES.http.get(ENDPOINTS.AUTH.LOGGED_USER)
      this.loggedUser = response.data;
    } catch (error) {
      console.error(error);
      if (error.response?.status == 401) {
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
        TOOLCASE.SERVICES.routehelpers.getRouter().push(`/login?goTo=${TOOLCASE.SERVICES.routehelpers.getCurrentRoute().path}`)
      }
    } finally {
      TOOLCASE.SERVICES.eventbroadcaster.$broadcast('loaded', 'auth');
    }
  },

  logout() {
    TOOLCASE.SERVICES.eventbroadcaster.$broadcast('load', 'logout');

    var url = ENDPOINTS.AUTH.LOGOUT;

    if (localStorage.getItem('authtoken'))
      url += '?token=' + localStorage.getItem('authtoken');

    return TOOLCASE.SERVICES.http.delete(url)
      .then(function () {
        TOOLCASE.SERVICES.eventbroadcaster.$broadcast('loaded', 'logout');
        localStorage.removeItem('authtoken');
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
      });
  }
}
