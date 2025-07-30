import { Canvas, extend, useFrame, useLoader, useThree } from "@react-three/fiber"
import MainCharacter from "./MainCharacter"
import SelectTable from "./SelectTable"
import { AxesHelper, Group, TextureLoader } from "three"
import React, { useRef } from "react"
import { Environment } from "@react-three/drei"
import { OrbitControls } from '@react-three/drei'
import AxisHelperWithLabels from "../../../components/Axis/Axis"




const BackgroundSetter = ({ url }: { url: string }) => {
    const texture = useLoader(TextureLoader, url)
    const { scene } = useThree()


    React.useEffect(() => {
        scene.background = texture
    }, [scene, texture])

    return null
}




const CharacterMix = () => {

    return (
        <div className="h-screen w-screen bg-gradient-to-r from-blue-300 to-green-600 flex justify-between" >

            {/*display main character */}
            <div className="h-screen w-2/3" >

                <Canvas camera={{ position: [3, 3, 5], fov: 50 }} style={{ height: "100vh" }} shadows  >
                    <Environment preset="sunset" environmentIntensity={0.3} />
                    {/* <primitive object={new AxesHelper(5)} /> */}
                    <OrbitControls />

                    <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.31}>
                        <planeGeometry args={[20.7, 20.7]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <directionalLight
                        position={[5, 5, 5]}
                        intensity={2.2}
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                        shadow-bias={-0.0001}
                    />
                    {/* Fill Light */}
                    <directionalLight position={[-5, 5, 5]} intensity={0.7} />
                    {/* Back Lights */}
                    <directionalLight position={[3, 3, -5]} intensity={6} color={"#ff3b3b"} />
                    <directionalLight
                        position={[-3, 3, -5]}
                        intensity={8}
                        color={"#3cb1ff"}
                    />

                    <gridHelper args={[20, 20, 0xff22aa, 0x55ccff]} />
                    <BackgroundSetter url="/images/commonImgs/gacha.png" />
                    <color attach={"background"} args={["#555"]} />
                    <fog attach={"fog"} args={["#555", 15, 25]} />

                    <MainCharacter scale={[0.005, 0.005, 0.005]} />

                </Canvas>
            </div>


            {/*select components of chacracter */}
            <div className="h-screen w-1/3" >
                <SelectTable />
            </div>

        </div>
    )
}

export default CharacterMix


