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

export default {
  REQUIRE_ALL,
  REQUIRE_ANY,

  // Loads the logged user's authorization state: the superadmin flag plus the flat list of
  // permission records granted through their access profiles.
  getUserPermissions() {
    return $sys
      .getService('toolcase/http')
      .get(ENDPOINTS.PERMISSIONS.READ)
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

  // Checks whether the logged user holds the given execution permission tag(s).
  // `tags` may be a single tag string or an array of tags; `mode` selects whether all
  // (REQUIRE_ALL, default) or any (REQUIRE_ANY) of them must be granted. Superadmins always
  // pass, and an empty requirement is treated as "no restriction".
  canExecute(tags, mode = REQUIRE_ALL) {
    const utils = $sys.getService('toolcase/utils')

    if (isSuperAdmin || utils.empty(tags)) return true

    const required = tags instanceof Array ? tags : [tags]
    if (utils.empty(required)) return true

    const granted = (tag) => grantedPermissions.some((p) => p.ds_tag == tag)

    return mode === REQUIRE_ANY ? required.some(granted) : required.every(granted)
  },

  /**
   * @deprecated The module/entity + CRUD permission model was removed in the IAM
   * permissions-domain simplification (IAM v1.3.0). Authorization is now tag-based — use
   * `canExecute(tags)` with explicit permission tags instead.
   *
   * This shim is kept so host-app pages that still gate on entity/CRUD maps (e.g.
   * `validatePermissions({ CTP_PRODUCT: 'R' })`) keep working: it mirrors the backend route
   * guards, which were reduced to authentication-only, by resolving permissive (true).
   * Migrate those call sites to `canExecute()` as tags are defined for each feature.
   */
  validatePermissions() {
    return true
  },
}
