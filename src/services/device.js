import $sys from 'src/lambdatt.js'
import ENDPOINTS from '../ENDPOINTS'

export default {
  async registerDevice() {
    try {
      const { data } = await $sys.getService('toolcase/http').post(ENDPOINTS.DEVICES.DEVICE)

      localStorage.setItem('iam_device_key', data.ds_key)
    } catch (error) {
      console.error('An error occurred while attempting to register device.', error)
    }

    return
  },

  async getDeviceKey() {
    // Handle device key
    var deviceKey = localStorage.getItem('iam_device_key')
    if (!deviceKey) {
      await this.registerDevice()
      deviceKey = localStorage.getItem('iam_device_key')
    }

    return deviceKey
  },
}
