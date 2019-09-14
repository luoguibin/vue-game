import axios from 'axios'
import store from '@/store'
import { baseUrl } from './config'
import { Message } from 'element-ui'

axios.defaults.timeout = 10000
axios.defaults.baseURL = baseUrl

axios.interceptors.request.use(
  config => {
    const token = (config.params || {}).token === true

    if (token) {
      // config.headers["Authorization"] = token;
      config.params.token = store.state.user.token
    }
    // headers中配置serialize为true开启序列化
    // if (config.methods === "post" && config.headers.serialize) {
    //   config.data = serialize(config.data)
    //   delete config.data.serialize
    // }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  res => {
    const status = Number(res.status) || 200
    if (status !== 200) {
      const msg = res.msg || res.data.msg
      Message.error({
        message: msg
      })

      return Promise.reject(res)
    }

    return res
  },
  error => {
    Message.error({
      message: error
    })
    return Promise.reject(new Error(error))
  }
)

export default axios
