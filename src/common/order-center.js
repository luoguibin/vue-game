import GameScene from "./game-scene";
import GameConst from "./game-const";
import Tween from "./tween";

class OrderCenter {

    parseOrder(order) {
        switch (order.type || 0) {
            case GameConst.CT_Data:
                this.parseDataOrder(order);
                break;
            case GameConst.CT_Action:
                this.parseActionOrder(order);
                break;
            case GameConst.CT_MSG:
                this.parseMsgOrder(order);
            default:
                break;
        }
    }

    parseDataOrder(order) {
        switch (order.id) {
            case GameConst.CT_Data_Player:
                // 创建登陆角色
                GameScene.addPlayerData(order.data);
                break;
            case GameConst.CT_Data_Players:
                // 创建在线角色
                GameScene.addPlayerDatas(order.data || []);
                break;
            case GameConst.CT_Data_Remove:
                // 移除下线角色
                GameScene.removePlayer(order.toId);
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
            .onUpdate(v => {
                model.followModel.position.copy(model.position)
            })
            .start();
        model.tween = tween;
    }

    parseMsgOrder(order) {
        switch (order.id) {
            case GameConst.CT_MSG_PERSON:
                GameScene.parsePersonMsg(order)
                break;

            default:
                break;
        }
    }
}

export default new OrderCenter();