import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import * as THREE from "three";
import MainCharacter from "../../CharacterMix/MainCharacter";
import Helper from "../../../../helper/Helper";
import { mapZones } from "../../../../constants";
import { myStore } from "../../../../store";
import type { LobbyState } from "../../../../types";

type Rect2 = [Function, Function, Function, Function]


const CharacterController = () => {
    const mainCharRef = useRef<Group>(null);
    const { camera } = useThree();

    const keysPressed = useRef<{ [key: string]: boolean }>({})

    const isMouseDown = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    const cameraTarget = useRef<THREE.Vector3>(new THREE.Vector3());
    const cameraOffset = useRef(new THREE.Vector3(0, 15, -20));

    const accumulatedYaw = useRef(0); // Góc quay quanh trục Y (radian)
    const accumulatedPitch = useRef(0); // Góc pitch quanh trục X (lên/xuống)

    const min = new THREE.Vector3(-182.875, -0.7867861915018802, -63.65117333491793)
    const max = new THREE.Vector3(177.6934131730098, 122.82035142976031, 303.6165253987978)


    const deltaLobbyState = useRef<LobbyState>({
        deltaPosition: new THREE.Vector3(0, 0, 0),
        deltaRotateY: 0
    })



    const lastTransform = useRef({
        position: new THREE.Vector3(),
        rotationY: 0
    });


    const changeIsStateChanged = useMemo(() => {
        return myStore.getState().changeIsStateChanged
    }, [])

    const addDeltaSate = useMemo(() => {
        return myStore.getState().addDeltaSate
    }, [])



    const KeyPressedType = ["w", "a", "s", "d"];

    const rects = useMemo(() => {
        return mapZones.map((zone) => {
            return {
                zoneName: zone.zoneName,
                rect: Helper.createRectFromFourPoints(zone.point1, zone.point2, zone.point3, zone.point4)
            }
        })
    }, [])


    // Xoay camera bằng chuột
    useEffect(() => {

        if (mainCharRef.current) {
            mainCharRef.current.position.set(0, 0, 0);
        }

        const handleMouseDown = (e: MouseEvent) => { // bat dau quay
            isMouseDown.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            const isStateChanged = myStore.getState().isStateChanged
            changeIsStateChanged({
                isRotate: true,
                isRunning: isStateChanged.isRunning
            })
        };

        const handleMouseUp = () => { // dung quay
            isMouseDown.current = false;
            // console.log("sumDeltaRotateY : ", deltaLobbyState.current.deltaRotateY)
            // deltaLobbyState.current.deltaRotateY = 0
            const isStateChanged = myStore.getState().isStateChanged
            changeIsStateChanged({
                isRotate: false,
                isRunning: isStateChanged.isRunning
            })
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isMouseDown.current) return;

            const deltaX = e.clientX - lastMousePos.current.x;
            const deltaY = e.clientY - lastMousePos.current.y;

            // Update góc quay ngang và dọc
            accumulatedYaw.current += -deltaX * 0.002;
            accumulatedPitch.current += -deltaY * 0.002;

            // Giới hạn góc nhìn lên/xuống (pitch)
            const maxPitch = Math.PI / 2 - 0.5;
            const minPitch = -Math.PI / 2 + 2;
            accumulatedPitch.current = Math.max(minPitch, Math.min(maxPitch, accumulatedPitch.current));

            // (Tùy chọn) Giới hạn yaw trong khoảng [-π, π]
            accumulatedYaw.current = ((accumulatedYaw.current + Math.PI) % (2 * Math.PI)) - Math.PI;

            // Tạo quaternion xoay camera dựa trên pitch + yaw
            const euler = new THREE.Euler(
                accumulatedPitch.current,
                accumulatedYaw.current,
                0,
                "YXZ"
            );
            const quat = new THREE.Quaternion().setFromEuler(euler);

            // Áp dụng xoay vào camera offset
            cameraOffset.current.set(0, 0, -20).applyQuaternion(quat);

            lastMousePos.current = { x: e.clientX, y: e.clientY };
        };



        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);


    // Điều khiển bằng WASD
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const keyPressed = e.key.toLocaleLowerCase()
            if (KeyPressedType.includes(keyPressed)) { //bat dau di chuyen
                // console.log("---------------------------------------");

                keysPressed.current[keyPressed] = true
                const isStateChanged = myStore.getState().isStateChanged
                changeIsStateChanged({
                    isRotate: isStateChanged.isRotate,
                    isRunning: true
                })
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            const keyPressed = e.key.toLocaleLowerCase()
            if (KeyPressedType.includes(keyPressed)) {
                delete keysPressed.current[keyPressed]


                //kiem tra nhan vat da ngung di chuyen hay chua => tinh toan sumdelta
                if (Object.keys(keysPressed.current).length == 0) {  // ngung di chuyen
                    // console.log("deltaPosition", deltaLobbyState.current.deltaPosition);
                    // deltaLobbyState.current.deltaPosition = new THREE.Vector3(0, 0, 0)
                    // console.log("+++++++++++++++++++++++++++++++++++++++++++");
                    const isStateChanged = myStore.getState().isStateChanged
                    changeIsStateChanged({
                        isRotate: isStateChanged.isRotate,
                        isRunning: false
                    })

                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useFrame((_, delta) => {
        if (mainCharRef.current) {

            //rotate character
            const charPos = mainCharRef.current.position;
            cameraTarget.current.copy(charPos);

            const desiredCameraPos = charPos.clone().add(cameraOffset.current);
            camera.position.lerp(desiredCameraPos, 0.05);
            camera.lookAt(cameraTarget.current);

            // Gán góc xoay Y cho nhân vật (nếu muốn nhân vật xoay theo camera)
            mainCharRef.current.rotation.y = accumulatedYaw.current;

            //movement
            const moveSpeed = 30 * delta
            const direction = new THREE.Vector3()


            if (keysPressed.current['w']) direction.z += 1
            if (keysPressed.current['s']) direction.z -= 1
            if (keysPressed.current['a']) direction.x += 1
            if (keysPressed.current['d']) direction.x -= 1
            const yawQuat = new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0, 1, 0),
                accumulatedYaw.current
            );
            direction.applyQuaternion(yawQuat);
            direction.normalize().multiplyScalar(moveSpeed);


            //check zone trigger
            //  Tính vị trí sau khi di chuyển
            const futurePos = mainCharRef.current.position.clone().add(direction)

            //  Kiểm tra vùng cấm
            let inBlockedZone = false
            rects.forEach((rect) => {
                if (Helper.checkPointInRect(rect.rect as Rect2, [futurePos.x, futurePos.z])) {
                    alert(`Vào vùng cấm: ${rect.zoneName}`)
                    keysPressed.current = {}
                    //xu ly hien popup o day

                    inBlockedZone = true
                }
            })


            if (!inBlockedZone) {
                mainCharRef.current.position.add(direction)
            } else {
                console.log("Không thể di chuyển vào vùng này")
            }
            // Clamp từng trục:
            const pos = mainCharRef.current.position;
            pos.x = THREE.MathUtils.clamp(pos.x, min.x + 2, max.x - 2);
            pos.y = THREE.MathUtils.clamp(pos.y, min.y, max.y);
            pos.z = THREE.MathUtils.clamp(pos.z, min.z + 2, max.z - 2);


            const currentPos = mainCharRef.current.position;
            const currentRotY = mainCharRef.current.rotation.y;

            // Tính delta vị trí
            const deltaPosition = new THREE.Vector3().subVectors(currentPos, lastTransform.current.position);

            // Tính delta góc quay
            const deltaRotationY = currentRotY - lastTransform.current.rotationY;

            // Kiểm tra có thay đổi đủ lớn để emit (tránh spam micro movement)
            const hasMoved = deltaPosition.lengthSq() > 0.0001;  // di chuyển ít nhất một chút
            const hasRotated = Math.abs(deltaRotationY) > 0.001;

            if (hasMoved || hasRotated) {
                // console.log({
                //     deltaPosition: {
                //         x: deltaPosition.x,
                //         y: deltaPosition.y,
                //         z: deltaPosition.z
                //     },
                //     deltaRotationY: deltaRotationY
                // })
                // tinh toan lai tong so luong postion da thay doi
                // deltaLobbyState.current.deltaPosition.add(deltaPosition)
                // deltaLobbyState.current.deltaRotateY += deltaRotationY
                addDeltaSate({
                    deltaPosition: deltaPosition,
                    deltaRotateY: deltaRotationY
                })

                // Cập nhật lại transform
                lastTransform.current.position.copy(currentPos);
                lastTransform.current.rotationY = currentRotY;
            }




        }
    });


    return (
        <>
            <MainCharacter ref={mainCharRef} scale={[0.02, 0.02, 0.02]} />
        </>
    );
};

export default CharacterController;
