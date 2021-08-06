import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

const subject = webSocket({ url: 'ws://localhost:8999' });

export const getWebsocket: WebSocketSubject<any> = subject;
