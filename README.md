# CTX Websocket Example
This demonstrates how to connect to the CTX API via websocket in order to receive payment events.

## Configuration
Update the `Credentials` object in `./index.mjs` by setting your API key/secret.

## Running
```
npm install
node .
```

## Client Considerations
### Authentication
Connecting to the websocket endpoint itself doesn't require credentials, but the connection will be closed by the API if a `subscribe` event is not sent with valid credentials within an acceptable time window. Events will not be broadcast to clients until the subscribe message is received.

### Ping/Pong
A custom ping response must be sent within a timely manner or the backend will close the connection.

### Event Format
Events received by websocket will have a `type` property which will contain one of the `Event` definitions declared in `./index.mjs`.

There will also be a `payment` property for payment events, which will contain the same data as the get payment endpoint response.

### API Disconnections
Our CI/CD pipeline allows us to push updates as soon as they're ready, which me make use of regularly. This means client websocket connections will often be disconnected as the backend shuts down and new versions start up. All crypto transactions that are missed during this time will be caught as we rescan the blockchain, but clients that haven't reconnected will miss out on these events.

We may implement webhooks in the near future to solve this problem, but for now we recommend manually polling all pending payments after re-connecting a websocket in order to ensure our systems are fully in sync.