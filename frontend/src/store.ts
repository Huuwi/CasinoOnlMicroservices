import { create, type StateCreator } from 'zustand'
import { categoriesItems } from './constants'
import type { MixCharacterState, LobbyMovementState, CustomItems, Item, ItemType, CustomItemsFull } from './types'
import * as THREE from "three"

function getCustomItemLocal(): CustomItems | null {
    const raw = localStorage.getItem("customItems");

    if (!raw) return null;

    let customItemsLocal: CustomItems | null = JSON.parse(raw);

    if (!customItemsLocal) return null;

    for (let key of Object.keys(customItemsLocal)) {
        delete customItemsLocal.customItemsId // no problem =)))
        if (!customItemsLocal[key as keyof CustomItems]) {
            delete customItemsLocal[key as keyof CustomItems];
        } else {
            customItemsLocal[key as keyof CustomItems] = "./Assets/" + customItemsLocal[key as keyof CustomItems]
        }
    }
    return customItemsLocal;
}

const customItemsLocal = getCustomItemLocal()


let initValueCustomItems: CustomItems = {
    Bottom: categoriesItems.Bottom[0],
    // Bow: categoriesItems.Bow[0],
    // Earring: categoriesItems.Earring[0],
    // EyeBrow: categoriesItems.EyeBrow[0],
    Eyes: categoriesItems.Eyes[4],
    Face: categoriesItems.Face[0],
    // FaceMask: categoriesItems.FaceMask[0],
    // FacialHair: categoriesItems.FacialHair[0],
    // Glasses: categoriesItems.Glasses[0],
    Hair: categoriesItems.Hair[0],
    // Hat: categoriesItems.Hat[0],
    Head: categoriesItems.Head[0],
    // Outfit: categoriesItems.Outfit[0],
    Shoes: categoriesItems.Shoes[0],
    Top: categoriesItems.Top[0],
    Nose: categoriesItems.Nose[0]
}


const createMixCharacterSlice: StateCreator<MixCharacterState> = (set, get, store) => ({
    categoryTypeSelected: 0,
    customItems: customItemsLocal || initValueCustomItems,
    download: 0,
    changeItem: (item: Item) => {
        set((state) => {

            const type: ItemType = item.type

            if (item.path == (state.customItems as CustomItemsFull)[type]) {
                let newCustoms: CustomItems = { ...state.customItems }
                delete newCustoms[type]
                return {
                    customItems: newCustoms
                };
            }

            return {
                customItems: {
                    ...state.customItems,
                    [item.type]: item.path
                }
            };
        });
    },
    changeTypeSelected: (index) => {
        set((state) => ({
            categoryTypeSelected: index
        }))
    },
    clickDonwload: () => {
        set((state) => ({
            download: state.download + 1
        }))
    }
})

type Store = MixCharacterState & LobbyMovementState


const createLobbyMovementSlice: StateCreator<LobbyMovementState> = (set, get, store) => ({

    isStateChanged: {
        isRunning: false,
        isRotate: false
    },
    deltaState: {
        deltaPosition: new THREE.Vector3(0, 0, 0),
        deltaRotateY: 0
    },
    changeIsStateChanged: (value) => {
        set(() => ({
            isStateChanged: value
        }))
    },
    changeDeltaSate: (value) => {
        set(() => ({
            deltaState: value
        }))
    },
    addDeltaSate(value) {
        set((state) => ({
            deltaState: {
                deltaPosition: state.deltaState.deltaPosition.add(value.deltaPosition),
                deltaRotateY: state.deltaState.deltaRotateY + value.deltaRotateY
            }
        }))
    },
    otherPeopleState: []// continue

})

export const myStore = create<Store>((set, get, store) => ({
    ...createMixCharacterSlice(set, get, store),
    ...createLobbyMovementSlice(set, get, store)
}))
