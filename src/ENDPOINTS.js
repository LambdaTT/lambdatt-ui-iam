export default {
  AUTH: {
    LOGGED_USER: '/iam/auth/v1/logged/user',
    LOGIN: '/iam/auth/v1/login',
    LOGIN_SSO: '/iam/auth/v1/login-sso',
    LOGIN_TOKEN: '/iam/auth/v1/login-token',
    LOGOUT: '/iam/auth/v1/logout',
    RENEW_TOKEN: '/iam/auth/v1/renew-token',
    VALIDATE_TOKEN: '/iam/auth/v1/validate-token',
  },

  PERMISSIONS: {
    READ: '/iam/auth/v1/logged/permissions',       // GET  -> { isSuperAdmin, permissions: [...] }
    CREATE: '/iam/permissions/v1/permission'        // POST /{title}/{tag}
  },

  USERS: {
    USER: '/iam/users/v1/user',
    RESET_PASS: {
      REQUEST: '/iam/users/v1/request-password-reset',
      CHANGE: '/iam/users/v1/change-password'
    },
    MY_ACCOUNT: '/iam/users/v1/my-account',
    ADMIN_CHANGE_PASS: '/iam/users/v1/admin-change-pass',
    PROFILES: '/iam/users/v1/profiles',
  },

  PROFILES: {
    PROFILE: '/iam/accessprofiles/v1/profile',
    // Profile <-> permission (tag) associations. In the flat model a profile is simply
    // granted a set of permission tags; there is no longer a per-module grouping.
    //   GET    /{profileKey}                 -> permissions with an `attached` (Y/N) flag
    //   POST   /{profileKey}/{permissionTag} -> attach a permission to the profile
    //   DELETE /{profileKey}/{permissionTag} -> detach a permission from the profile
    PERMISSION: '/iam/accessprofiles/v1/permission',
  },

  DEVICES: {
    DEVICE: "/iam/devices/v1/device"                        // POST
  }

}