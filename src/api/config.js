export const wsUrl = process.env.NODE_ENV === 'production' ? 'wss://gapi.sghen.cn/ws' : 'ws://localhost:8086/ws'
export const loginUrl = process.env.NODE_ENV === 'production' ? 'https://www.sghen.cn/#/blank' : 'http://localhost:8080/#/blank'
