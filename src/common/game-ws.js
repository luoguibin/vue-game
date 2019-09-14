import OrderCenter from "./order-center";
import { wsUrl } from "@/api/config";
import {Message} from "element-ui";

class GameWS {

    ws = null;
    url = wsUrl;

    connect(token) {
        if (!("WebSocket" in window)) {
            Message.warning({message: "当前浏览器不支持WebSocket"});
            return;
        }

        const ws = new WebSocket(this.url + "?token=" + token);
        if (!ws) {
            console.log("ws create error");
            return;
        }

        ws.onopen = () => {
            console.log("connectServer() ws onopen");
            this.ws = ws;
        };

        ws.onmessage = e => {
            OrderCenter.dealOrder(JSON.parse(e.data));
        };

        ws.onerror = (e) => {
            console.log("ws error", e);
            if (!this.ws) {
                Message.error({message:"connect error"})
            }
        };

        ws.onclose = (e) => {
            console.log("ws close", e);
            this.ws = null;
        };

    }

    sendOrder(order) {
        this.ws.send(JSON.stringify(order));
    }

    release() {
        this.ws && this.ws.close();
    }
}

export default new GameWS();