import $sys from 'src/lambdatt.js'
import ENDPOINTS from '../ENDPOINTS'

const REQUIRE_ALL = 1 // All permissions must be granted
const REQUIRE_ANY = 2 // At least one permission must be granted

// Cached authorization state of the logged user, loaded via getUserPermissions().
// In the flat tag-based model (IAM v1.3.0+), a user holds a plain list of permission
// records (identified by their ds_tag), inherited from their access profiles.
let isSuperAdmin = false
let grantedPermissions = []
let loaded = false

function canExecute(tags, mode = REQUIRE_ALL) {
  const utils = $sys.getService('toolcase/utils')

  if (isSuperAdmin || utils.empty(tags)) return true

  const required = tags instanceof Array ? tags : [tags]
  if (utils.empty(required)) return true

  const granted = (tag) => grantedPermissions.some((p) => p.ds_tag == tag)

  return mode === REQUIRE_ANY ? required.some(granted) : required.every(granted)
}

export default {
  // Loads the logged user's authorization state: the superadmin flag plus the flat list of
  // permission records granted through their access profiles.
  getUserPermissions() {
    return $sys
      .getService('toolcase/http')
      .get(ENDPOINTS.AUTH.LOGGED_PERMISSIONS)
      .then((response) => {
        isSuperAdmin = response.data?.isSuperAdmin == 'Y'
        grantedPermissions = response.data?.permissions ?? []
        loaded = true
      })
      .catch((error) => {
        isSuperAdmin = false
        grantedPermissions = []
        loaded = true
        throw error
      })
  },

  isLoaded() {
    return loaded
  },

  isSuperAdmin() {
    return isSuperAdmin
  },

  // Returns the flat list of permission tags granted to the logged user.
  getGrantedTags() {
    return grantedPermissions.map((p) => p.ds_tag)
  },

  requireAny(tags) {
    return canExecute(tags, REQUIRE_ANY)
  },

  requireAll(tags) {
    return canExecute(tags, REQUIRE_ALL)
  },
}
