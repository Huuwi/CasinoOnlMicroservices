const { Server } = require("socket.io");
const jwt = require("jsonwebtoken")

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
    inforMetaDataMap = new Map() // emit

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
        this.on("connect", (socket) => {
            console.log(socket.id + " connected ");
            const userMetaData = socket.decodeAccessToken
            this.socketMap.set(userMetaData.userId, socket)
            this.inforMetaDataMap.set(userMetaData.userId, {
                userMetaData,
                position: [0, 0, 0],
                socketId: socket.id,
            })

            socket.on("disconnect", () => {
                console.log(socket.id + " vua ngat ket noi");
                this.socketMap.delete(userMetaData.userId)
                this.inforMetaDataMap.delete(userMetaData.userId)
            })

            socket.on("movement", (msg) => {
                console.log(msg)
            })

        });
    }


}


module.exports = SocketServer