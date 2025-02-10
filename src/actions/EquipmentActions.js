import Pact from "pact-lang-api";
import _ from 'lodash'
import {
    CONTRACT_NAME_EQUIPMENT,
    DEFAULT_GAS_PRICE,
    LOAD_ALL_ITEMS_IDS,
    LOAD_ALL_ITEMS,
    ITEMS_PER_BLOCK,
    SET_BLOCK_ID_ITEM,
    STORE_FILTERS_STATS_EQUIP
} from './types'

//get all ids of nfts minted
export const loadAllItemsIds = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 180000, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.all-items)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

            if (response && response.length > 0) {
                dispatch({ type: LOAD_ALL_ITEMS_IDS, payload: { allItemsIds: response } })

                let partsBlock = _.chunk(response, response.length/14)

                //console.log(partsBlock);

                let promises = []
                partsBlock.map(pr => {
                    let promise = Promise.resolve(dispatch(loadBlockItemsSplit(chainId, gasPrice, 175000, networkUrl, pr)))
                    promises.push(promise)
                })

                Promise.all(promises).then(values => {
					//console.log(values);

                    let final = []

                    values.map(i => final.push(...i))

					//console.log(final);

                    let totalMintedItems = 0
                    final.map(i => {
                        if (parseInt(i.id) < 100000) {
                            totalMintedItems ++
                        }
                    })

                    final = final.filter(i => i.owner !== "wiz-equipment-fused")

                    //console.log(final);

                    final.sort((a, b) => {
    	                return parseInt(a.id) - parseInt(b.id)
    	            })

					final.sort((a, b) => {
						if (parseInt(a.price) === 0) return 1;
						if (parseInt(b.price) === 0) return -1
						return a.price - b.price
					})

					dispatch({
						type: LOAD_ALL_ITEMS,
						payload: { allItems: final, itemsBlockId: 0, totalCountItems: final.length, totalMintedItems }
					})

					if (callback) {
						callback(final)
					}
				})
            }
            else {
                dispatch({ type: LOAD_ALL_ITEMS_IDS, payload: { allItemsIds: response } })
                dispatch({
                    type: LOAD_ALL_ITEMS,
                    payload: { allItems: [], itemsBlockId: 0, totalCountItems: 0, totalMintedItems: 0 }
                })
                if (callback) {
                    callback([])
                }
            }
		})
	}
}

export const loadBlockItemsSplit = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, block) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-equipment-fields-for-ids ${JSON.stringify(block)})`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		const response = await dispatch(readFromContract(cmd, true, networkUrl))
		//console.log(response);

		return response
	}
}

export const getPageBlockItems = (res, blockId, callback) => {
	return (dispatch) => {
		let block = res.reduce((rows, item, index) => {
			//console.log(index);
			//se array row è piena, aggiungiamo una nuova row = [] alla lista
			if (index % ITEMS_PER_BLOCK === 0 && index > 0) {
				rows.push([]);
			}

			//prendiamo l'ultima array della lista e aggiungiamo item
			rows[rows.length - 1].push(item);
			return rows;
		}, [[]]);

		dispatch(setBlockId(blockId))

		if (callback) {
			callback(block[blockId])
		}
	}
}

export const setBlockId = (blockId) => {
	return {
		type: SET_BLOCK_ID_ITEM,
		payload: blockId
	}
}

export const getEquipmentVolume = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-volume)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response) {
				if (callback) {
					callback(response)
				}

				dispatch({ type: 'fake' })
			}
		})
	}
}

export const getInfoItemEquippedMass = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 180000, networkUrl, idnfts) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-equipped-fields-for-ids ${JSON.stringify(idnfts)})`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

        const response = await dispatch(readFromContract(cmd, true, networkUrl))
		//console.log(response);

		return response
	}
}

export const getInfoItemEquipped = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 3000, networkUrl, idnft) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-equipped-fields-for-id "${idnft}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

        const response = await dispatch(readFromContract(cmd, true, networkUrl))
		//console.log(response);

		return response
	}
}


export const getInfoNftEquipment = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 3000, networkUrl, iditem, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-equipment-fields-for-id "${iditem}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (callback) {
				callback(response)
			}
		})
	}
}

export const getInfoAura = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 180000, networkUrl, idnft) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-aura-for-nft "${idnft}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

        const response = await dispatch(readFromContract(cmd, true, networkUrl))
		//console.log(response);

		return response
	}
}

export const getInfoAuraMass = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 180000, networkUrl, idnfts) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-aura-for-nfts ${JSON.stringify(idnfts)})`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

        const response = await dispatch(readFromContract(cmd, true, networkUrl))
		//console.log(response);

		return response
	}
}

export const getDiscountLevel = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 3000, networkUrl, account, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-discount-level "${account.account}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (callback) {
				callback(response)
			}
		})
	}
}

export const getForgeLevel = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 3000, networkUrl, account, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-forge-xp "${account.account}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (callback) {
				callback(response)
			}
		})
	}
}

export const getEquipmentMintPhase = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 3000, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-value "mint_start")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (callback) {
				callback(response)
			}
		})
	}
}

export const getEquipmentMintPrice = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 3000, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-price)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (callback) {
				callback(response)
			}
		})
	}
}

export const getMaxMintable = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 3000, networkUrl, account, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-max-items "${account}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (callback) {
				callback(response)
			}
		})
	}
}

export const getAmountMinted = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 3000, networkUrl, account, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-minted "${account}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (callback) {
				callback(response)
			}
		})
	}
}


export const readFromContract = (cmd, returnError, networkUrl) => {
	return async (dispatch) => {

		try {
			let data = await Pact.fetch.local(cmd, networkUrl);

			if (data && data.result && data.result.status === "success") {
				//console.log(data.result)
				return data.result.data
			}
			else {
				//console.log(data)
				if (returnError === true) {
					if (data && data.result) {
						return data.result
					}
					return null;
				}
				return null
			}
		}
		catch (e) {
			//console.log(e)
			console.log("Had trouble fetching data from the blockchain")
		}

		dispatch({ type: 'fake' })
	}
}

export const storeFiltersStatsEquip = (filters) => {
	return {
		type: STORE_FILTERS_STATS_EQUIP,
		payload: filters
	}
}


export const defaultMeta = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit) => {
	return Pact.lang.mkMeta(
		"",
		chainId,
		gasPrice,
		gasLimit || 150000,
		creationTime(),
		600
	)
}

const creationTime = () => {
	return Math.round(new Date().getTime() / 1000) - 10;
}

const parseRes = async (raw) => {
	const rawRes = await raw;
	const res = await rawRes

	if (res.ok) {
		const resJSON = await rawRes.json()
		return resJSON
	}
	else {
		const resText = await rawRes.text()
		return resText
	}
}

const mkReq = (cmd) => {
	return {
		headers: {
			"Content-Type": "application/json"
		},
		method: "POST",
		body: JSON.stringify(cmd)
	}
}
