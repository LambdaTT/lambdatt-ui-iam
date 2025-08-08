import $sys from 'src/lambdatt.js';
import ENDPOINTS from '../ENDPOINTS';

const REQUIRE_ALL = 1; // All permissions must be granted
const REQUIRE_ANY = 2; // At least one permission must be granted

export default {
  isSuperAdmin: null,
  regularPermissions: [],
  customPermissions: [],

  getUserPermissions() {
    return $sys.getService('toolcase/http').get(ENDPOINTS.PERMISSIONS.READ)
      .then((response) => {
        this.isSuperAdmin = response.data?.isSuperAdmin == 'Y';
        this.regularPermissions = response.data.regularPermissions;
        this.customPermissions = response.data.customPermissions;
      })
  },

  canExecute(keys, mode = REQUIRE_ALL) {
    if (this.isSuperAdmin || utils.empty(keys)) return true

    if (keys instanceof Array) {
      let allow = false;

      for (let i = 0; i < keys.length; i++) {
        allow = this.canExecute(keys[i], mode);
        if (allow && mode === REQUIRE_ANY) break;
      }

      return allow;
    } else {
      var permission = this.customPermissions.find(p => p.ds_key == keys);
      return !!permission;
    }
  },

  validatePermissions(requiredPermissions, mode = REQUIRE_ALL) {
    if (this.isSuperAdmin || utils.empty(requiredPermissions)) return true

    const lvlDict = {
      'C': 'do_create',
      'R': 'do_read',
      'U': 'do_update',
      'D': 'do_delete'
    };

    let result = false;
    for (let entity in requiredPermissions) {
      let level = requiredPermissions[entity].toUpperCase();

      let p = this.regularPermissions.find(p => p.ds_entity_name == entity);
      if (!p && mode === REQUIRE_ALL) return false;
      else if (!p) continue;

      for (let i = 0; i < level.length; i++) {
        let translated = lvlDict[level[i]];
        if (!translated) {
          console.warn(`Invalid permission level: ${level[i]} for entity: ${entity}`);
          continue;
        }
        result = p[translated] == 'Y';
        if (!result && mode === REQUIRE_ANY) break;
      }
    }

    return result;
  }
}