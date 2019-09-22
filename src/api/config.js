export const baseUrl = 'http://sapi.sghen.cn'
export const wsUrl = process.env.NODE_ENV === 'production' ? 'ws://gapi.sghen.cn/ws' : 'ws://localhost:8086/ws'