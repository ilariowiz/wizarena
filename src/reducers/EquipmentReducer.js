import {
    LOAD_ALL_ITEMS_IDS,
    LOAD_ALL_ITEMS,
    SET_BLOCK_ID_ITEM,
    STORE_FILTERS_STATS_EQUIP
} from '../actions/types'

const INITIAL_STATE = {
    allItems: [],
    allItemsIds: [],
    statSearchedEquipment: undefined,
    totalCountItems: 0,
    itemsBlockId: 0
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
        case LOAD_ALL_ITEMS_IDS: {
			const { allItemsIds, totalCountItems } = action.payload
			return { ...state, allItemsIds, totalCountItems }
		}
        case LOAD_ALL_ITEMS: {
			const { allItems, itemsBlockId } = action.payload

			let oldItemsBlockId = state.itemsBlockId
			if (!oldItemsBlockId) {
				oldItemsBlockId = itemsBlockId
			}

			return { ...state, allItems, itemsBlockId: oldItemsBlockId }
		}
        case SET_BLOCK_ID_ITEM:
			return { ...state, itemsBlockId: action.payload }
        case STORE_FILTERS_STATS_EQUIP:
    		return { ...state, statSearchedEquipment: action.payload }
        default:
    		return state
    }
}
