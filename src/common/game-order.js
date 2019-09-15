export default class {
    // 主体
    fromGroup = 0;
    fromId = 0;

    // 客体
    toGroup = 0;
    toId = 0;

    // 分类行为
    type = 0;
    id = 0;

    // 附加信息
    data = null;

    constructor(fromId, gromGroup) {
        this.fromId = fromId || 0;
        this.fromGroup = this.fromGroup || 0;
    }

    setValue(toGroup, toId, type, id, data) {
        this.toGroup = toGroup || 0;
        this.toId = toId || 0;
        this.type = type || 0;
        this.id = id || 0;
        this.data = data || "";
        return this;
    }
}