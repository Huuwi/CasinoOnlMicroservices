// src/components/Lobby.tsx
import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Room from "./Room/Room";
import CharacterController from "./Character/CharacterController";
import { AxesHelper } from "three";
import sockets from "../../../socketIo/sockets";
import { myStore } from "../../../store";
import { envVars } from "../../../constants";
import * as THREE from "three"

const Lobby: React.FC = () => {

    let lobbySocket = sockets.socketLobby

    // Initialize socket connection
    useEffect(() => {

        let socketConnected = lobbySocket.connect();
        const fps = envVars.VITE_FPS
        const ms = 1000 / fps

        socketConnected.on("initialSocketId", (msg) => {
            localStorage.setItem("socketId", msg)
        })

        socketConnected.on("initialStateOtherPeople", (msg) => {
            console.log("msg", msg)
        })

        const fpsEmitItv = setInterval(() => {
            const isStateChanged = myStore.getState().isStateChanged
            const changeDeltaSate = myStore.getState().changeDeltaSate

            if (!isStateChanged.isRotate && !isStateChanged.isRunning) return
            socketConnected.emit("clientMove", {
                lobbyState: myStore.getState().deltaState,
                socketId: socketConnected.id
            })
            changeDeltaSate({ deltaPosition: new THREE.Vector3(0, 0, 0), deltaRotateY: 0 })

        }, ms);

        return () => {
            // sockets.disconnect();
            clearInterval(fpsEmitItv)
        };
    }, []);


    return (
        <div className="relative w-screen h-screen">
            {/* UI layer */}
            <div
                className="absolute top-0 left-0 z-10"
                style={{ height: "100vh", width: "100vw", pointerEvents: "none" }}
            >
                <button
                    className="rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-3 pointer-events-auto m-4"
                    onClick={() => console.log("Go to lobby clicked")}
                >
                    Go to Lobby
                </button>
            </div>

            {/* ------------------------------------------------------------------- */}

            {/* 3D layer */}
            <Canvas
                camera={{ position: [3, 3, 5], fov: 50 }}
                className="bg-blue-300 z-0"
                style={{ height: "100vh", width: "100vw" }}
            >
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={2.2}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-bias={-0.0001}
                />
                <directionalLight position={[-5, 5, 5]} intensity={0.7} />
                <directionalLight position={[3, 3, -5]} intensity={2} color="#ff3b3b" />
                <directionalLight position={[-3, 3, -5]} intensity={2} color="#3cb1ff" />

                <Suspense fallback={null}>
                    <Physics gravity={[0, -9.81, 0]}>
                        <Room url="./room/room.glb" />
                        <Environment preset="apartment" background />
                        <CharacterController />
                    </Physics>

                </Suspense>

                {/* <OrbitControls makeDefault /> */}
                <primitive object={new AxesHelper(50000)} />

            </Canvas>
        </div>
    );
};

export default Lobby;