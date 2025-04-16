import { http, localData } from 'src/modules/lambdatt-ui-toolcase/services.js'

export default {
  isSuperAdmin: null,
  regularPermissions: [],
  customPermissions: [],

  getUserPermissions() {
    return http.get('/api/iam/permissions/v1/user-permissions')
      .then((response) => {
        this.isSuperAdmin = response.data?.isSuperAdmin == 'Y';
        this.regularPermissions = response.data.regularPermissions;
        this.customPermissions = response.data.customPermissions;
      })
  },

  canExecute(keys) {
    if (this.isSuperAdmin) return true

    if (keys instanceof Array) {
      for (let i = 0; i < keys.length; i++) {
        if (this.canExecute(keys[i]) === false) return false;
      }
      return true;
    } else {
      var permission = this.customPermissions.find(p => p.ds_key == keys);
      return !!permission;
    }
  },

  validatePermissions(requiredPermissions) {
    if (this.isSuperAdmin) return true

    for (let entity in requiredPermissions) {
      let level = requiredPermissions[entity].toUpperCase();

      let p = this.regularPermissions.find(p => p.ds_entity_name == entity);
      if (!p) return false;

      if (level.includes('C') && p.do_create != 'Y') return false;
      if (level.includes('R') && p.do_read != 'Y') return false;
      if (level.includes('U') && p.do_update != 'Y') return false;
      if (level.includes('D') && p.do_delete != 'Y') return false;
    }

    return true;
  }
}