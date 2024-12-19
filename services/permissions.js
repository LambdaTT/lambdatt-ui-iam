import {http, localData} from 'src/modules/lambdatt-ui-toolcase/services.js'

export default {
  getUserPermissions() {
    return http.get('/api/permissions/v1/user-permissions')
      .then((response) => {
        localStorage.removeItem('regularPermissions');
        localData.insert('regularPermissions', response.data.regularPermissions);
        localStorage.removeItem('customPermissions');
        localData.insert('customPermissions', response.data.customPermissions);
      })
  },

  canExecute(key) {
    localData.init('customPermissions');
    var permission = localData.first('customPermissions', { 'ds_key': key });

    if (!!permission) return true;
    else return false;
  },

  validatePermissions(requiredPermissions) {
    localData.init('regularPermissions');
    for (let entity in requiredPermissions) {
      let level = requiredPermissions[entity].toUpperCase();

      let p = localData.first('regularPermissions', { 'ds_entity_name': entity });
      if (!p) return false;

      if (level.includes('C') && p.do_create != 'Y') return false;
      if (level.includes('R') && p.do_read != 'Y') return false;
      if (level.includes('U') && p.do_update != 'Y') return false;
      if (level.includes('D') && p.do_delete != 'Y') return false;
    }

    return true;
  }
}