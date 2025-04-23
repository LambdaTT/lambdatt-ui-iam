import { http } from 'src/modules/lambdatt-ui-toolcase/services.js'

export default {
  loggedUser: null,

  authenticate: function ($component) {
    $component.$emit('load', 'auth');

    return http.get('/api/iam/auth/v1/logged-user')
      .then((response) => {
        this.loggedUser = response.data;
        $component.$emit('loaded', 'auth');
      })
      // .catch((error) => {
      //   console.error(error);
      //   if (error.response.status == 401) {
      //     localStorage.removeItem('xsrf_token');
      //     localStorage.removeItem('iam_session_key');
      //     localStorage.removeItem('regularPermissions');
      //     localStorage.removeItem('customPermissions');
      //     location.href = `/login?goTo=${$component.$route.path}`;
      //   }
      // });
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
