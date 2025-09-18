import $sys from 'src/lambdatt.js'

export default {
  async registerDevice() {
    try {
      const response = await $sys.getService('toolcase/http').post('/api/iam/devices/v1/device');
      localStorage.setItem('iam_device_key', response.data.ds_key);
    } catch (error) {
      console.error('An error occurred while attempting to register device.', error);
    }

    return;
  },

  async getDeviceKey() {
    // Handle device key
    var deviceKey = localStorage.getItem('iam_device_key');
    if (!deviceKey) {
      await this.registerDevice();
      deviceKey = localStorage.getItem('iam_device_key');
    }

    return deviceKey;
  },
}