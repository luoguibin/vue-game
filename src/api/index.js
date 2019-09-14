import request from './axios'
import CryptoJS from 'crypto-js'

const baseHmacMd5 = (data, key) => {
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacMD5(data, key))
}
const privateKey = CryptoJS.enc.Utf8.parse('sghenmorge')

export const createUser = data =>
  request({
    url: '/v1/user/create',
    method: 'post',
    data
  })

export const loginByAccount = ({ uId, pw }) =>
  request({
    url: '/v1/user/login',
    method: 'post',
    data: {
      uId,
      pw: baseHmacMd5(pw, privateKey)
    }
  })
