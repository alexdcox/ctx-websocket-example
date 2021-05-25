import Base64 from 'crypto-js/enc-base64.js'
import hmacSHA256 from 'crypto-js/hmac-sha256.js'
import WebSocket from 'ws'

const Credentials = {
  key: "YOUR_KEY",
  secret: "YOUR_SECRET",
}

const WebsocketUrl = 'wss://api.ctx.com/ws'

const Event = {
  paymentPartPaid: 'PAYMENT_PART_PAID',
  paymentPaidPendingConfirmations: 'PAYMENT_PAID_PENDING_CONFIRMATIONS',
  paymentCompleted: 'PAYMENT_COMPLETED',
  paymentCreated: 'PAYMENT_CREATED',
  paymentExpired: 'PAYMENT_EXPIRED',
  paymentCancelled: 'PAYMENT_CANCELLED',
}

const Error = {
  authTimeout: 'AUTH_TIMEOUT',
  authInvalid: 'AUTH_INVALID',
}

const websocket = new WebSocket(WebsocketUrl)

websocket.binaryType = 'arraybuffer'

websocket.onmessage = message => {
  if (message.data instanceof ArrayBuffer) {
    if (new Uint8Array(message.data)[0] === 137) {
      websocket.send(new Uint8Array([138]).buffer)
    }
    return
  }

  const data = JSON.parse(message.data)

  if ([Error.authInvalid, Error.authTimeout].includes(data.error)) {
    console.log("websocket closed, auth timeout/invalid")
    websocket.onclose = () => {}
    websocket.close()
  }

  console.log('received message', data)
}

websocket.onopen = () => {
  console.log('websocket connected')

  let subscribe = {
    id: 1,
    method: 'subscribe',
    key: Credentials.key,
    signature: Base64.stringify(hmacSHA256(WebsocketUrl, Credentials.secret)),
  }

  websocket.send(JSON.stringify(subscribe))
}

websocket.onclose = () => {
  console.log('websocket disconnected')
}