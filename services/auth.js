import { http } from 'src/modules/lambdatt-ui-toolcase/services.js'

export default {
  authenticate: function ($component) {
    $component.$emit('load', 'auth');

    return http.get('/api/auth/v1/logged-user')
      .then(() => {
        $component.$emit('loaded', 'auth');
      })
      .catch((error) => {
        if (error.response.status == 401) {
          localStorage.removeItem('xsrf_token');
          localStorage.removeItem('iam_session_key');
          localStorage.removeItem('regularPermissions');
          localStorage.removeItem('customPermissions');
          location.href = `/login?goTo=${$component.$route.path}`;
        }
      });
  }
}
