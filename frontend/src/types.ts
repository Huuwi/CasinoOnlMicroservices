import { BufferGeometry, Material, SkinnedMesh } from "three";
import * as THREE from "three";

export interface AssetProps {
    url: string,
}

export interface Item {
    type: ItemType,
    path: string
}

export interface loadedType {
    geometry: BufferGeometry;
    material: Material | Material[];
    morphTargetDictionary?: SkinnedMesh['morphTargetDictionary'];
    morphTargetInfluences?: SkinnedMesh['morphTargetInfluences'];
}


export interface MixCharacterState {
    customItems: object
    changeItem: (item: Item) => void,
    categoryTypeSelected: number,
    changeTypeSelected: (index: number) => void,
    download: number,
    clickDonwload: () => void
}



export interface CustomItemsIgnore {
    Bottom?: string,
    Bow?: string,
    Earring?: string,
    EyeBrow?: string,
    Eyes?: string,
    Face?: string,
    FaceMask?: string,
    FacialHair?: string,
    Glasses?: string,
    Hair?: string,
    Hat?: string,
    Head?: string,
    Nose?: string,
    Outfit?: string,
    Shoes?: string,
    Top?: string,
}


export type ItemType = 'Bottom' | 'Bow' | 'Earring' | 'EyeBrow' | 'Eyes' | 'Face' |
    'FaceMask' | 'FacialHair' | 'Glasses' | 'Hair' | 'Hat' |
    'Head' | 'Nose' | 'Outfit' | 'Shoes' | 'Top';

export type CustomItemsFull = {
    [key in ItemType]: string
}

export type CustomItems = CustomItemsFull | CustomItemsIgnore

export interface LobbyState {
    deltaPosition: THREE.Vector3,
    deltaRotateY: number
}

type IsChanged = {
    isRunning: Boolean,
    isRotate: Boolean
}

type deltaValue = {
    deltaPosition: THREE.Vector3,
    deltaRotateY: number
}


export interface LobbyMovementState {

    isStateChanged: IsChanged,
    deltaState: LobbyState,
    changeIsStateChanged: (value: IsChanged) => void,
    changeDeltaSate: (value: LobbyState) => void,
    addDeltaSate: (value: deltaValue) => void,
    otherPeopleState: Array<any> // tiep tuc
}
