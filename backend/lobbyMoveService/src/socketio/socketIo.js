const { Server } = require("socket.io");
const jwt = require("jsonwebtoken")
const Vector3 = require("@rawify/vector3")

require("dotenv").config({ path: "./.env" })

function parseCookie(cookieString) {

    if (typeof cookieString != "string") {
        return {}
    }

    return cookieString
        .split('; ')
        .map(cookie => cookie.split('='))
        .reduce((acc, [key, value]) => {
            acc[decodeURIComponent(key)] = decodeURIComponent(value || '');
            return acc;
        }, {})
}



const configSocketIo = {
    cors: {
        origin: (origin, callback) => {
            const allowedOrigins = [
                process.env.FONT_END_URL,
                'http://localhost:1111',
                'http://localhost:5173/'
            ];

            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error('CORS không được phép từ domain này'));
            }
        },
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }

}

module.exports = { configSocketIo }


class SocketServer extends Server {
    socketMap = new Map()
    io
    inforMetaDataMap = new Map() // emit first time user connect

    constructor(httpServer, config = configSocketIo) {
        super(httpServer, configSocketIo)

        //use middleware for all socket
        this.use((socket, next) => {
            //get token from headers
            let cookie = parseCookie(socket.request.headers?.cookie)
            let accessToken = cookie?.accessToken

            if (!accessToken) {
                next(new Error("not found token"))
                return
            }
            //decode token
            let decodeAccessToken = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY)
            socket.decodeAccessToken = decodeAccessToken // add token decode

            next()
        })

        //handle when socket connect
        this.on("connect", (socket) => { // frist time one user connected
            const userMetaData = socket.decodeAccessToken
            this.socketMap.set(socket.id, socket)
            this.inforMetaDataMap.set(socket.id, {
                userMetaData,
                position: new Vector3(0, 0, 0),
                rotateY: 0,
                userId: userMetaData.userId,
            })

            const initialEmitData = Object.fromEntries(this.inforMetaDataMap);
            console.log(initialEmitData);


            socket.emit("initialStateOtherPeople", initialEmitData)
            socket.emit("initialSocketId", socket.id)


            // console.log("metaData : ", this.inforMetaDataMap)
            // console.log("socketMap : ", this.socketMap)


            socket.on("disconnect", () => {
                console.log(socket.id + " vua ngat ket noi");
                this.socketMap.delete(socket.id)
                this.inforMetaDataMap.delete(socket.id)
            })

            socket.on("clientMove", (msg) => {
                const { socketId, lobbyState } = msg
                const inforOwn = this.inforMetaDataMap.get(socketId)
                inforOwn.position = inforOwn.position.add(lobbyState.deltaPosition)
                inforOwn.rotateY += msg.lobbyState.deltaRotateY
                socket.emit("initialStateOtherPeople", initialEmitData)

            })

        });
    }


}


module.exports = SocketServer