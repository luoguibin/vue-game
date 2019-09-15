import GameScene from "./game-scene";
import GameConst from "./game-const";
import Tween from "./tween";

class OrderCenter {

    parseOrder(order) {
        switch (order.type || 0) {
            case GameConst.CT_Data:
                this.parseDataOrder(order);
            case GameConst.CT_Action:
                this.parseActionOrder(order);
                break;

            default:
                break;
        }
    }

    parseDataOrder(order) {
        switch (order.id) {
            case GameConst.CT_Data_Player:
                // 连接成功后返回角色数据，初始化游戏场景
                GameScene.initPlayerData(order.data);
                break;

            default:
                break;
        }
    }

    parseActionOrder(order) {
        const fromModel = GameScene.getPlayer(order.fromId),
            toModel = GameScene.getPlayer(order.toId);
        switch (order.id) {
            case GameConst.CT_Action_Move:
                this.execActionMove(order, fromModel)
                break;

            default:
                break;
        }
    }

    execActionMove(order, model) {
        const position = model.position,
            data = order.data,
            val = Math.sqrt(Math.pow(data.x - position.x, 2) + Math.pow(data.z - position.z, 2));
        
        let tween = model.tween;
        tween && tween.remove();
        tween = Tween.newTween(position)
            .to({x: data.x, z: data.z}, val * (100 - model.userData.speed))
            .start();
        model.tween = tween;
    }
}

export default new OrderCenter();