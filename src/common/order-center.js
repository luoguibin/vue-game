class GameOrder {

    dealOrder(order) {
        console.log(JSON.parse(JSON.stringify(order)));
    }
}

export default new GameOrder();