import axios from 'axios'
import Qs from 'qs'
import store from '@/store'
import { baseUrl } from './config'
import { Message } from 'element-ui'

require("promise.prototype.finally").shim();

axios.defaults.timeout = 10000
axios.defaults.baseURL = baseUrl

axios.interceptors.request.use(
  config => {
    if (config.data) {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        config.data = Qs.stringify(config.data)
      }

      if (!config.params) {
        config.params = {}
      }
      config.params.token = store.state.user.token
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  res => {
    const status = Number(res.status) || 0
    const data = res.data || {}
    if (status !== 200 || data.code !== 1000) {
      Message.error({ message: data.msg || '操作失败' })
      return Promise.reject(res)
    }

    return res
  },
  error => {
    Message.error({ message: error })
    return Promise.reject(new Error(error))
  }
)

export default axios
