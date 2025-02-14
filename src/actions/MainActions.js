import Pact from "pact-lang-api";
import SignClient from "@walletconnect/sign-client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import anime from 'animejs/lib/anime.es.js';
import { getDocs, query, collection, where, documentId } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import moment from 'moment'
import { calcLevelWizard } from '../components/common/CalcLevelWizard'
import _ from 'lodash'
import {
	NODE_URL,
	CONTRACT_NAME,
	ADMIN_ADDRESS,
	CLERIC_MINT_ADDRESS,
	LOAD_USER,
	DEFAULT_GAS_PRICE,
	MAIN_NET_ID,
	TEST_NET_ID,
	SET_NETWORK_SETTINGS,
	SET_NETWORK_URL,
	LOAD_ALL_NFTS,
	LOAD_USER_MINTED_NFTS,
	UPDATE_TRANSACTION_STATE,
	CLEAR_TRANSACTION_STATE,
	CLEAR_USER,
	SET_IS_X_WALLET,
	SET_IS_WALLET_CONNECT_QR,
	SET_QR_WALLET_CONNECT_CLIENT,
	LOAD_ALL_NFTS_IDS,
	SET_BLOCK_ID,
	COUNT_MINTED,
	ITEMS_PER_BLOCK,
	LOGOUT,
	LOAD_BUYIN,
	LOAD_FEE_TOURNAMENT,
	LOAD_MONTEPREMI,
	WIZ_BANK,
	LOAD_SUBSCRIBED,
	STORE_FILTERS_STATS,
	CONTRACT_NAME_WIZA,
	WIZA_TOKEN_BANK,
	SAVE_WIZA_BALANCE,
	LOAD_WIZARDS_STAKED,
	STORE_CIRCULATING_SUPPLY,
	STORE_TOTAL_MINED,
	SET_SFIDA,
	SET_SFIDA_PVE,
	SET_AVG_LEVEL_PVP,
	SET_WIZARD_SELECTED_SHOP,
	CONTRACT_NAME_EQUIPMENT,
	STORE_WIZA_NOT_CLAIMED,
	RING_MINT_PRICE,
	LOAD_BUYIN_WIZA,
	LOAD_BUYIN_ELITE,
	LOAD_FEE_TOURNAMENT_WIZA,
	LOAD_SUBSCRIBED_WIZA,
	LOAD_SUBSCRIBED_ELITE,
	SELECT_WIZARD,
	UPDATE_TRANSACTION_TO_CONFIRM_TEXT,
	STORE_WALLET_XP,
	HIDE_NAV_BAR,
	SET_CHALLENGES_SENT,
	SET_CHALLENGES_RECEIVED,
	HIDE_MODAL_TX,
	CLEAR_TRANSACTION_STATE_PACT_CODE,
	SET_TIME_TO_HALVENING,
	SET_VISUAL_COLORS,
	SET_SUBSCRIBERS_PVP,
	REVEAL_CAP,
	SET_IS_LINX_WALLET
} from './types'

//const URL_2 = `https://api.kda.kaddex.xyz/chainweb/0.0/${MAIN_NET_ID}/chain/1/pact`;


export const setNetworkSettings = (netId, chainId, gasPrice = DEFAULT_GAS_PRICE) => {
	return {
		type: SET_NETWORK_SETTINGS,
		payload: { netId, chainId, gasPrice }
	}
}

export const setNetworkUrl = (netId, chainId) => {
	return (dispatch) => {
		if (!netId && !chainId) {
			dispatch({ type: SET_NETWORK_URL, payload: undefined })
			return
		}

		let url;
		if (netId === TEST_NET_ID) {
			url = `https://api.testnet.chainweb.com/chainweb/0.0/${TEST_NET_ID}/chain/${chainId}/pact`;
		}
		else if (netId === MAIN_NET_ID) {
			//url = `https://api.chainweb.com/chainweb/0.0/${MAIN_NET_ID}/chain/${chainId}/pact`;
			url = `https://${NODE_URL}/chainweb/0.0/${MAIN_NET_ID}/chain/${chainId}/pact`;
		}

		dispatch({ type: SET_NETWORK_URL, payload: url })
	}
}

export const setIsXwallet = (payload) => {
	return {
		type: SET_IS_X_WALLET,
		payload
	}
}

export const setIsLinxWallet = (payload) => {
	return {
		type: SET_IS_LINX_WALLET,
		payload
	}
}

export const setIsWalletConnectQR = (payload) => {
	return {
		type: SET_IS_WALLET_CONNECT_QR,
		payload
	}
}

export const setQrWalletConnectClient = (payload) => {
	return {
		type: SET_QR_WALLET_CONNECT_CLIENT,
		payload
	}
}

export const connectXWallet = (netId, chainId, gasPrice, gasLimit, networkUrl, callback) => {
	return async (dispatch) => {
		let error;
		let res;

		connectlabel: try {
			await window.kadena.request({ method: "kda_disconnect", networkId: netId })

			res = await window.kadena.request({ method: "kda_connect", networkId: netId })

			//console.log(res)

			if (res.status !== "success") {
				error = `Could not connect to X Wallet`
				break connectlabel
			}
		}
		catch (e) {
			//console.log(e)
		}

		if (error) {
			dispatch(logout(true, netId))
		}
		else {
			//console.log(res);
			dispatch(setIsXwallet(true))

			dispatch(fetchAccountDetails(res.account.account, chainId, gasPrice, gasLimit, networkUrl, callback))

		}
	}
}

export const connectChainweaver = (account, chainId, gasPrice, gasLimit, networkUrl, netId, callback) => {
	return async (dispatch) => {
		dispatch(setIsXwallet(false))
		dispatch(setIsLinxWallet(false))
		dispatch(setIsWalletConnectQR(false))

		let pactCode = `(free.${CONTRACT_NAME}.check-your-account "${account}")`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmdToSign = {
			pactCode,
			caps,
			sender: account,
			gasLimit: 1000,
			gasPrice,
			chainId,
			type: 'exec',
			ttl: 600,
			networkId: netId,
			signingPubKey: account.replace("k:", "")
		}

		let signedCmd;

		try {
			signedCmd = await Pact.wallet.sign(cmdToSign)

			if (!signedCmd) {
				console.log("Failed to sign the command in the wallet")
				if (callback) {
					callback("The account could not be verified")
				}
				return
			}

		} catch(e) {
			console.log(e)
			console.log("Failed to sign the command in the wallet")
			return
		}

		let localRes = null

		if (signedCmd) {
			try {
				localRes = await fetch(`${networkUrl}/api/v1/local`, mkReq(signedCmd));
			} catch(e) {
				console.log(e)
				console.log("Failed to confirm transaction with the network")
				if (callback) {
					callback("The account could not be verified")
				}
				return
			}
		}
		//console.log(localRes);

		const parsedLocalRes = await parseRes(localRes);

		if (parsedLocalRes && parsedLocalRes.result && parsedLocalRes.result.status === "success") {
			dispatch(setIsLinxWallet(true))
			dispatch(fetchAccountDetails(account, chainId, gasPrice, gasLimit, networkUrl, callback))
		}
		else {
			if (callback) {
				callback("The account could not be verified")
			}
		}
	}
}


export const connectWalletConnect = (netId, chainId, gasPrice, gasLimit, networkUrl, callback) => {
	return async (dispatch) => {

		const signClient = await SignClient.init({
		  projectId: process.env.REACT_APP_WALLET_CONNECT_ID,
		  metadata: {
			name: "WizardsArena",
			description: "Wizards Arena NFTGame",
			url: "https://www.wizardsarena.net",
			icons: ["https://firebasestorage.googleapis.com/v0/b/raritysniperkda.appspot.com/o/android-chrome-384x384.png?alt=media&token=e5946e6e-ac87-446a-91f4-f6144906ef22"],
		  },
		});


		const requiredNamespaces = {
			kadena: {
				methods: ["kadena_sign"],
				chains: ["kadena:mainnet01"],
				events: []
			}
		}

		try {

			/*
			const pairings = signClient.core.pairing.getPairings()
			//console.log(pairings);
			let topic = pairings && pairings.length > 0 && pairings[pairings.length - 1].topic
			console.log(topic);
			*/

			const { uri, approval } = await signClient.connect({
				//pairingTopic: topic,
				requiredNamespaces
			})

			//console.log(uri);

			if (uri) {
				QRCodeModal.open(uri, () => {}, {
					desktopLinks: [],
            		mobileLinks: [],
				})
			}

			const session = await approval()
			//console.log(session);

			const wallet = session.peer.metadata.name

			dispatch(setIsWalletConnectQR(true))

			dispatch(setQrWalletConnectClient({ pairingTopic: session.topic }))

			const accounts = session.namespaces["kadena"].accounts.map((item) => {
				//console.log(item);
				let normalAccountName = item;
				["mainnet01"].forEach(chain => {
					if (wallet && wallet.includes("Koala")) {
						normalAccountName = normalAccountName.replace("**", ":").replace(`kadena:${chain}:`, "")
					}
					else {
						normalAccountName = `k:${normalAccountName.replace(`kadena:${chain}:`, "")}`
					}

				})
				return normalAccountName
			})

			//console.log(accounts);

			if (accounts && accounts.length > 0) {
				dispatch(fetchAccountDetails(accounts[0], chainId, gasPrice, gasLimit, networkUrl, callback))
			}

			QRCodeModal.close()

		}
		catch(e) {
			console.log(e);
			dispatch(logout(false, netId))
			dispatch(setQrWalletConnectClient(undefined))
		}
		finally {
			QRCodeModal.close()
		}
	}
}

export const connectLinx = (chainId, gasPrice, gasLimit, networkUrl, currentAccount, callback) => {
	return async (dispatch) => {
		try {
			//console.log(await inLinx());
			if (await inLinx()) {
				const account = await linx(linxNewRequest("Account", "get address", {}, false))
				//console.log(account);
				if (account && (!currentAccount || currentAccount.account !== account)) {
					dispatch(setIsXwallet(false))
					dispatch(setIsWalletConnectQR(false))

					dispatch(fetchAccountDetails(account, chainId, gasPrice, gasLimit, networkUrl, callback))
				}
				else {
					console.log("Linx account not found");
					if (callback) {
						callback("Can't connect to Linx Wallet")
					}
					return
				}
			}
			else {
				console.log("Linx not found");
				if (callback) {
					callback("Can't connect to Linx Wallet")
				}
				return
			}
		}
		catch(error) {
			if (callback) {
				callback("Can't connect to Linx Wallet: ", error)
			}
		}
	}
}

export const inLinx = async () => {
	const e = await window.flutter_inappwebview && window.flutter_inappwebview.callHandler("LinxWallet")
	if (e) {
		return true
	}
	return false
}

export const linx = (...args) =>
  window.flutter_inappwebview.callHandler("LinxWallet", ...args);

const linxNewRequest = function(request, description, requestData, needsApproval) {
	return {
		request: request,
		description: description,
		data: requestData,
		needsApproval: needsApproval
	}
}

const linxRequestData = function(signingRequest, itemDescription, imageUrl, chainId, tokenId, amount, dappFee, feeTokenId, chainless) {
	return {
		signingRequest: signingRequest,
		itemDescription: itemDescription,
		imageUrl: imageUrl,
	    chainId: chainId,
	    tokenId: tokenId,
	    amount: amount,
	    dappFee: dappFee,
	    feeTokenId: feeTokenId,
	    chainless: chainless,
	}
}

export const fetchAccountDetails = (accountName, chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, callback) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(coin.details ${JSON.stringify(accountName)})`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(async (response) => {
			//console.log(response)

			if (response.account) {
				dispatch(loadUser(response))

				if (callback) {
					callback()
				}
			}
			else {
				dispatch(clearUser())
				//console.log('error')
				if (callback) {
					callback(response)
				}
			}
		})
	}
}

//get all ids of nfts minted
export const loadAllNftsIds = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.all-wizards)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response) {
				//console.log("response post reduce", blocks)
				dispatch({ type: LOAD_ALL_NFTS_IDS, payload: { allNftsIds: response } })

				let partsBlock = _.chunk(response, Math.ceil(response.length/30))

				let promises = []
                partsBlock.map(pr => {
                    let promise = Promise.resolve(dispatch(loadBlockNftsSplit(chainId, gasPrice, 180000, networkUrl, pr)))
                    promises.push(promise)
                })

				Promise.all(promises).then(values => {
					//console.log(values);

					let final = []
					values.map(i => {
						final.push(...i)
					})

					//console.log(final);
					final = final.filter(i => i.owner !== "wiz-bank")

					let totalCountNfts = final.length

					let maxStats = { hp: 0, defense: 0, attack: 0, damage: 0, speed: 0, ap: 0 }

					final.map(i => {
						//console.log(i);

						i.level = i.level.int

						if (i.hp.int > maxStats.hp) {
							maxStats['hp'] = i.hp.int
						}
						if (i.defense.int > maxStats.defense) {
							maxStats['defense'] = i.defense.int
						}
						if (i.attack.int > maxStats.attack) {
							maxStats['attack'] = i.attack.int + i['upgrades-spell'].attack.int
						}
						if (i.damage.int > maxStats.damage) {
							maxStats['damage'] = i.damage.int + i['upgrades-spell'].damage.int
						}
						if (i.speed.int > maxStats.speed) {
							maxStats['speed'] = i.speed.int
						}
						if (i.ap.int > maxStats.ap) {
							maxStats['ap'] = i.ap.int
						}
					})


					const ranges = dispatch(calcRanges(maxStats))
					//console.log(ranges);

					final.sort((a, b) => {
						if (parseInt(a.price) === 0) return 1;
						if (parseInt(b.price) === 0) return -1
						return a.price - b.price
					})

					dispatch({
						type: LOAD_ALL_NFTS,
						payload: { allNfts: final, nftsBlockId: 0, totalCountNfts, ranges }
					})

					if (callback) {
						callback(final)
					}
				})
			}
		})
	}
}

export const loadBlockNftsSplit = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, block) => {
	return async (dispatch) => {
		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wizard-fields-for-ids [${block}])`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		const response = await dispatch(readFromContract(cmd, true, networkUrl))
		//console.log(response);

		return response
	}
}

const calcRanges = (maxStats) => {
	return (dispatch) => {

		//console.log(maxStats);

		const ranges = {}

		ranges["hp"] = []
		const rangeHp = Math.round(maxStats["hp"] / 10)
		//console.log(rangeHp);
		for (var i = 0; i < rangeHp; i++) {
			let start = 40 + (i * 10)
			let end = start + 9

			if (start <= maxStats["hp"]) {
				ranges['hp'].push(`${start} - ${end}`)
			}
		}

		ranges["hp"] = ranges["hp"].reverse()

		ranges["defense"] = []
		const rangeDef = Math.round(maxStats["defense"] / 3)
		//console.log(rangeHp);
		for (var i = 0; i < rangeDef; i++) {
			let start = 14 + (i * 3)
			let end = start + 2

			if (start <= maxStats["defense"]) {
				ranges['defense'].push(`${start} - ${end}`)
			}
		}

		ranges["defense"] = ranges["defense"].reverse()

		ranges["attack"] = []
		const rangeAtk = Math.round(maxStats["attack"] / 3) + 1
		//console.log(rangeHp);
		for (var i = 0; i < rangeAtk; i++) {
			let start = (i * 3)
			let end = start + 2

			if (start <= maxStats["attack"] + 1) {
				ranges['attack'].push(`${start} - ${end}`)
			}
		}

		ranges["attack"] = ranges["attack"].reverse()

		ranges["damage"] = []
		const rangeDmg = Math.round(maxStats["damage"] / 3) + 1
		//console.log(rangeDmg);
		for (var i = 0; i < rangeDmg; i++) {
			let start = (i * 3)
			let end = start + 2

			if (start <= maxStats["damage"] + 1) {
				ranges['damage'].push(`${start} - ${end}`)
			}
		}

		ranges["damage"] = ranges["damage"].reverse()

		ranges["speed"] = []
		const rangeSpe = Math.round(maxStats["speed"] / 2) + 1
		//console.log(rangeHp);
		for (var i = 0; i < rangeSpe; i++) {
			let start = (i * 2)
			let end = start + 1

			if (start <= maxStats["speed"] + 1) {
				ranges['speed'].push(`${start} - ${end}`)
			}
		}

		ranges["speed"] = ranges["speed"].reverse()

		ranges["ap"] = []
		const rangeAp = Math.round(maxStats["ap"] / 2) + 1
		//console.log(rangeHp);
		for (var i = 0; i < rangeAp; i++) {
			let start = (i * 10)
			let end = start + 9

			if (start <= maxStats["ap"] + 1) {
				ranges['ap'].push(`${start} - ${end}`)
			}
		}

		ranges["ap"] = ranges["ap"].reverse()

		return ranges
	}
}

export const loadBlockNftsSubscribed = (response, tournamentType, callbackSubscribed) => {
	return (dispatch) => {

		let newResponse = []

		response.map(i => {
			const temp = {
				level: i.level.int,
				element: i.element,
				id: i.id,
				name: i.name,
				nickname: i.nickname,
				owner: i.owner
			}

			newResponse.push(temp)
		})

		//console.log(newResponse);

		newResponse.sort((a, b) => {
			return parseInt(a.id) - parseInt(b.id)
		})

		let subscribedSpellGraph = {}

		newResponse.map((item) => {
			if (!subscribedSpellGraph[item.element]) {
				subscribedSpellGraph[item.element] = 1
			}
			else {
				subscribedSpellGraph[item.element] += 1
			}
		})

		//console.log(subscribedSpellGraph, tournamentType);

		if (callbackSubscribed) {
			callbackSubscribed(newResponse)
		}

		if (tournamentType === "kda") {
			dispatch({ type: LOAD_SUBSCRIBED, payload: { nfts: newResponse, subscribedKdaSpellGraph: subscribedSpellGraph } })
		}
		else if (tournamentType === "wiza") {
			dispatch({ type: LOAD_SUBSCRIBED_WIZA, payload: { nfts: newResponse, subscribedWizaSpellGraph: subscribedSpellGraph } })
		}
		else if (tournamentType === "elite") {
			dispatch({ type: LOAD_SUBSCRIBED_ELITE, payload: { nfts: newResponse, subscribedEliteSpellGraph: subscribedSpellGraph } })
		}
	}
}

export const loadEquipMinted = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, account, callback) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.all-items)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
            if (response && response.length > 0) {
                let partsBlock = _.chunk(response, response.length/8)

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

                    final = final.filter(i => i.owner === account.account)

                    final.sort((a, b) => {
    	                return parseInt(a.id) - parseInt(b.id)
    	            })

					final.sort((a, b) => {
						if (parseInt(a.price) === 0) return 1;
						if (parseInt(b.price) === 0) return -1
						return a.price - b.price
					})

					if (callback) {
						callback(final)
					}
				})
            }
            else {

            }
		})


		/*
		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.equipment-owned-by "${account.account}")`,
			meta: defaultMeta(chainId, gasPrice, 180000)
		}

		const response = await dispatch(readFromContract(cmd, true, networkUrl))
		//console.log(response);

		if (callback) {
			callback(response)
		}
		*/
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

export const loadBurningNftInfo = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, block, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wizard-fields-for-ids [${block}])`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response) {
				if (callback) {
					callback(response)
				}
			}
		})
	}
}

export const getBurningQueue = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-burning-queue)`,
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

export const getPageBlockNfts = (res, blockId, callback) => {
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
		type: SET_BLOCK_ID,
		payload: blockId
	}
}

export const getNumberMinted = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 500, networkUrl) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-count "minted-post-count-key")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response) {
				dispatch({
					type: COUNT_MINTED,
					payload: response
				})
			}
		})
	}
}

export const readAccountMinted = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, address, phase, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-minted "${phase}" "${address}")`,
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

export const loadUserMintedNfts = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, address, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.wizard-owned-by "${address}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			//torna un array di oggetti, ogni oggetto include solo id [{ id: "0" }]
			if (response && response.status !== 'failure') {
				let onlyId = []

				response.map(i => {
					onlyId.push(i.id)
				})

				let promises = []

				const partsBlock = _.chunk(onlyId, 80)
				partsBlock.map(pr => {
                    let promise = Promise.resolve(dispatch(loadBlockNftsSplit(chainId, gasPrice, 180000, networkUrl, pr)))
                    promises.push(promise)
                })

				Promise.all(promises).then(values => {
					//console.log(values);
					let final = []
					values.map(i => {
						final.push(...i)
					})

					//console.log(final);

					let maxStats = { hp: 0, defense: 0, attack: 0, damage: 0, speed: 0, ap: 0 }

					final.map(i => {
						i.level = i.level.int

						if (i.hp.int > maxStats.hp) {
							maxStats['hp'] = i.hp.int
						}
						if (i.defense.int > maxStats.defense) {
							maxStats['defense'] = i.defense.int
						}
						if (i.attack.int > maxStats.attack) {
							maxStats['attack'] = i.attack.int
						}
						if (i.damage.int > maxStats.damage) {
							maxStats['damage'] = i.damage.int
						}
						if (i.speed.int > maxStats.speed) {
							maxStats['speed'] = i.speed.int
						}
						if (i.ap.int > maxStats.ap) {
							maxStats['ap'] = i.ap.int
						}
					})

					const ranges = dispatch(calcRanges(maxStats))
					//console.log(ranges);

					final.sort((a, b) => {
		                return parseInt(a.id) - parseInt(b.id)
		            })

					final.sort((a, b) => {
						if (parseInt(a.price) === 0) return 1;
						if (parseInt(b.price) === 0) return -1
						return a.price - b.price
					})

					dispatch({
						type: LOAD_USER_MINTED_NFTS,
						payload: {
							userMintedNfts: final,
							ranges
						}
					})

					if (callback) {
						callback(final)
					}
				})
			}
			else {
				if (callback) {
					callback([])
				}
			}
		})
	}
}

export const loadSingleNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 8000, networkUrl, idNft, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wizard-fields-for-id ${idNft})`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response && response.level) {

				response["level"] = response.level.int

				if (callback) {
					callback(response)
				}

				dispatch({ type: 'fake' })
			}
			else {
				if (callback) {
					callback({ error: true })
				}
				dispatch({ type: 'fake' })
			}
		})
	}
}

export const getOffersForNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 60000, networkUrl, id, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-offers-for-id "${id}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response && callback) {
				callback(response)
			}
		})
	}
}

export const getOffersMade = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 60000, networkUrl, account, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-offers-for-buyer "${account.account}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response && callback) {
				callback(response)
			}
		})
	}
}

export const getOffersReceived = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 60000, networkUrl, account, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-offers-for-owner "${account.account}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response && callback) {
				callback(response)
			}
		})
	}
}

export const getCollectionOffers = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 60000, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-collection-offers)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response && callback) {
				callback(response)
			}
		})
	}
}

export const getCollectionOffersForBuyer = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 60000, networkUrl, buyer, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-collection-offers-for-buyer "${buyer}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response && callback) {
				callback(response)
			}
		})
	}
}

export const getEquipmentActiveOffers = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 60000, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-active-offers)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response && callback) {
				callback(response)
			}
		})
	}
}

export const getEquipmentOffersMade = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 60000, networkUrl, account, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-offers-for-buyer "${account.account}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response && callback) {
				callback(response)
			}
		})
	}
}

export const loadMaxItemsPerWallet = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, account, phase, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-max-items-druids "${account.account}" "${phase}")`,
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

export const getMintPhase = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-value "mint-phase")`,
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

export const getMintPrice = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-mint-price)`,
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

export const getPotionEquippedMass = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 30000, networkUrl, keys, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-potion-for-tournament-mass [${keys}])`,
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

export const getPotionEquipped = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, key, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-potion-for-tournament "${key}")`,
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

export const getPvPweek = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-value "pvp-week")`,
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

export const getPvPopen = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-value "pvp-open")`,
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

export const getPvPsubscription = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 150000, networkUrl, pvpweek, callback) => {
	return (dispatch) => {

		let ids = []
		for (var i = 0; i < REVEAL_CAP; i++) {
			ids.push(`${pvpweek}_${i}`)
		}

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-pvp-subscriptions ${JSON.stringify(ids)})`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			response = response.filter(i => i.pvpweek === pvpweek)

			if (callback) {
				callback(response)
			}
		})
	}
}

export const getConquestSubscribersIdsPerSeason = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 180000, networkUrl, season) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-all-subscription-for-season "${season}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

        const response = await dispatch(readFromContract(cmd, true, networkUrl))
		//console.log(response);

		return response
	}
}

export const getDungeonSubscribersIdsPerSeason = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 180000, networkUrl, season) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-all-dungeon-subscription-for-season "${season}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

        const response = await dispatch(readFromContract(cmd, true, networkUrl))
		//console.log(response);

		return response
	}
}

export const getVolume = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-volume)`,
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

export const getSubscriptions = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 57000, networkUrl, ids, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-subscriptions ${JSON.stringify(ids)})`,
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

export const getMontepremi = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-prize)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			dispatch({ type: LOAD_MONTEPREMI, payload: response })
		})
	}
}

export const getBuyin = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, buyinKey) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-value-tournament "${buyinKey}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (buyinKey === "buyin-key") {
				dispatch({ type: LOAD_BUYIN, payload: response })
			}
			else if (buyinKey === "buyin-wiza-key") {
				dispatch({ type: LOAD_BUYIN_WIZA, payload: response })
			}
			else if (buyinKey === "buyin-elite-key") {
				dispatch({ type: LOAD_BUYIN_ELITE, payload: response })
			}
		})
	}
}

export const getFeeTournament = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, feeKey) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-value-tournament "${feeKey}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (feeKey === "fee-tournament-key") {
				dispatch({ type: LOAD_FEE_TOURNAMENT, payload: response })
			}
			else {
				dispatch({ type: LOAD_FEE_TOURNAMENT_WIZA, payload: response })
			}
		})
	}
}

export const getCountForTournament = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 10000, networkUrl, tournament, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-count-for-tournament "${tournament}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response) {
				if (callback) {
					callback(response)
				}
			}
			else {
				if (callback) {
					callback(0)
				}
			}
		})

	}
}

export const getSubscribed = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 180000, networkUrl, tournament, tournamentType, callback) => {
	return (dispatch) => {

		//console.log(tournament);

		let ids = []
		for (var i = 0; i < REVEAL_CAP; i++) {
			ids.push(`${tournament}_${i}`)
		}

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-subscriptions ${JSON.stringify(ids)})`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response) {

				let onlyId = []
				response.map(i => {
					//console.log(i);
					if (i.idnft) {
						onlyId.push(i.idnft)
					}
				})

				//console.log(onlyId);

				let promises = []

				const partsBlock = _.chunk(onlyId, 80)
				partsBlock.map(pr => {
                    let promise = Promise.resolve(dispatch(loadBlockNftsSplit(chainId, gasPrice, 180000, networkUrl, pr)))
                    promises.push(promise)
                })

				Promise.all(promises).then(values => {
					//console.log(values);
					let final = []
					values.map(i => {
						final.push(...i)
					})

					dispatch(loadBlockNftsSubscribed(final, tournamentType, callback))
				})
			}
		})

	}
}

export const getWizaValue = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 6000, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.wiz-arena.get-wiza-value)`,
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

export const getWizaKDAPool = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 6000, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(kdlaunch.kdswap-exchange.get-pair coin free.wiza)`,
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

export const getInfoNftBurning = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 1000, networkUrl, idnft, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-nft-in-burning-queue "${idnft}")`,
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


export const checkAddressForPrice = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 1000, networkUrl, account, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.check-address-for-prize "${account.account}")`,
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

export const getWalletXp = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 1500, networkUrl, account) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wallet-xp "${account.account}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (!response.status) {
				dispatch({ type: STORE_WALLET_XP, payload: response.int })
			}
		})
	}
}

export const getWalletsXp = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 75000, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wallets-xp-1)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (!response.status && callback) {
				callback(response)
			}
		})
	}
}

export const getAutoTournament = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, tournamentName, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.wiztournaments.get-tournament-info "${tournamentName}")`,
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

export const addNftToBurningQueue = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, idnft, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.add-to-burning-queue "${idnft}" "${account.account}" free.wiz-equipment)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("addNftToBurningQueue", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const removeNftFromBurningQueue = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, idnft, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.remove-from-burning-queue "${idnft}" "${account.account}")`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("removeNftFromBurningQueue", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const forgeItem = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, recipe, ingredients, account, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.forge "${recipe}" ${JSON.stringify(ingredients)} "${account.account}" free.wiza)`;

		let caps = [Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", [])]
		ingredients.map(i => {
			caps.push(
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME_EQUIPMENT}.OWNER`,
          			[account.account, i]
        		)
			)
		})

		caps.push(
			Pact.lang.mkCap(`Forge`, "Pay the fee", `free.wiza.TRANSFER`, [
			    account.account,
			    WIZA_TOKEN_BANK,
			    _.round(amount, 4),
			]),
		)


		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 12000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("forgeItem", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const forgeAp = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, idnft, account, recipe) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.forge-from-ap "${idnft}" "${account.account}" "${recipe}" free.wiz-arena)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME_EQUIPMENT}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME}.OWNER`,
				[account.account, idnft]
			),
			Pact.lang.mkCap(`Forge`, "Pay to forge", `coin.TRANSFER`, [
				account.account,
				ADMIN_ADDRESS,
				5.0,
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 12000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("forgeAp", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const mintNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, amount, account, stage, mintPrice) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.get-druids "${account.account}" ${amount})`;

		let caps = [
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		if (stage !== "free") {
			caps.push(
				Pact.lang.mkCap(`Mint`, "Pay to mint", `coin.TRANSFER`, [
					account.account,
					CLERIC_MINT_ADDRESS,
					mintPrice * amount,
				])
			)
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 6000 * amount,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("mintNft", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const listNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idNft, price, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.list-wizard "${account.account}" "${idNft}" ${price} free.wiz-equipment)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
					"Verify owner",
					"Verify your are the owner",
					`free.${CONTRACT_NAME}.OWNER`,
					[account.account, idNft]
				),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("listNft", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const delistNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, idNft) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.delist-wizard "${account.account}" "${idNft}")`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
					"Verify owner",
					"Verify your are the owner",
					`free.${CONTRACT_NAME}.OWNER`,
					[account.account, idNft]
				),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("delistNft", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}


export const buyNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, nft) => {
	return (dispatch) => {

		const fee = _.round(((nft.price * 7) / 100), 2)
		const gain = _.round(nft.price - fee, 2)

		let pactCode = `(free.${CONTRACT_NAME}.buy-wizard "${nft.id}" "${account.account}")`;

		let caps = [
			Pact.lang.mkCap(`Buy`, "Pay to buy", `coin.TRANSFER`, [
				account.account,
				nft.owner,
				gain,
			]),
			Pact.lang.mkCap(`Buy`, "Marketplace fee", `coin.TRANSFER`, [
				account.account,
				ADMIN_ADDRESS,
				fee,
			]),
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("buyNft", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const makeOffer = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idNft, account, days, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.make-offer "${idNft}" "${account.account}" ${days} ${_.round(amount).toFixed(1)})`;

		let caps = [
			Pact.lang.mkCap(`Make offer`, "Make offer", `coin.TRANSFER`, [
				account.account,
				"wizards-offers-bank",
				_.round(amount, 2),
			]),
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("makeOffer", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const acceptOffer = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idOffer, idNft, account, amount) => {
	return (dispatch) => {

		const fee = _.round(((amount * 7) / 100), 2)
		const gain = _.round(amount - fee, 2)

		let pactCode = `(free.${CONTRACT_NAME}.accept-offer "${idOffer}" free.wiz-equipment)`;

		let caps = [
			Pact.lang.mkCap(`Accept offer`, "Accept offer", `coin.TRANSFER`, [
				"wizards-offers-bank",
				account.account,
				_.round(gain, 2),
			]),
			Pact.lang.mkCap(`Accept offer`, "Accept offer", `coin.TRANSFER`, [
				"wizards-offers-bank",
				ADMIN_ADDRESS,
				_.round(fee, 2),
			]),
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.OWNER`,
				[account.account, idNft]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("acceptOffer", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const declineOffer = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idOffer, idNft, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.decline-offer "${idOffer}")`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.OWNER`,
				[account.account, idNft]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("declineOffer", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const withdrawOffer = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idOffer, account, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.cancel-offer "${idOffer}")`;

		let caps = [
			Pact.lang.mkCap(`Withdraw offer`, "Withdraw offer", `coin.TRANSFER`, [
				"wizards-offers-bank",
				account.account,
				_.round(amount, 2),
			]),
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("withdrawOffer", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const makeCollectionOffer = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, days, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.make-collection-offer "${account.account}" ${days} ${_.round(amount).toFixed(1)})`;

		let caps = [
			Pact.lang.mkCap(`Collection offer`, "Collection offer", `coin.TRANSFER`, [
				account.account,
				"wizards-offers-bank",
				_.round(amount, 2),
			]),
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("makeCollectionOffer", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const acceptCollectionOffer = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idOffer, idNft, account, amount) => {
	return (dispatch) => {

		const fee = _.round(((amount * 7) / 100), 2)
		const gain = _.round(amount - fee, 2)

		let pactCode = `(free.${CONTRACT_NAME}.accept-collection-offer "${idOffer}" "${idNft}" free.wiz-equipment)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.OWNER`,
				[account.account, idNft]
			),
			Pact.lang.mkCap(`Accept offer`, "Accept offer", `coin.TRANSFER`, [
				"wizards-offers-bank",
				account.account,
				_.round(gain, 2),
			]),
			Pact.lang.mkCap(`Accept offer`, "Accept offer", `coin.TRANSFER`, [
				"wizards-offers-bank",
				ADMIN_ADDRESS,
				_.round(fee, 2),
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("acceptCollectionOffer", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const withdrawCollectionOffer = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idOffer, account, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.cancel-collection-offer "${idOffer}")`;

		let caps = [
			Pact.lang.mkCap(`Withdraw Collection offer`, "Withdraw Collection offer", `coin.TRANSFER`, [
				"wizards-offers-bank",
				account.account,
				_.round(amount, 2),
			]),
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("withdrawCollectionOffer", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const mintEquipment = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, amount, account, mintPrice) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.get-equipment-1 "${account.account}" ${amount} free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME_EQUIPMENT}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Mint`, "Pay to mint", `coin.TRANSFER`, [
				account.account,
				ADMIN_ADDRESS,
				mintPrice * amount,
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 3500 * amount,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("mintEquipment", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const listEquipment = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, iditem, price, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.list-equipment "${account.account}" "${iditem}" ${price})`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
					"Verify owner",
					"Verify your are the owner",
					`free.${CONTRACT_NAME_EQUIPMENT}.OWNER`,
					[account.account, iditem]
				),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("listEquipment", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const delistEquipment = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, iditem) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.delist-equipment "${account.account}" "${iditem}")`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
					"Verify owner",
					"Verify your are the owner",
					`free.${CONTRACT_NAME_EQUIPMENT}.OWNER`,
					[account.account, iditem]
				),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("delistEquipment", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const buyEquipment = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, iditem, owner, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.buy-equipment "${iditem}" "${account.account}" free.wiza)`;

		let fee = _.round(((amount * 2) / 100), 2)
		let gain = _.round(amount - fee, 2)

		let caps = [
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME_EQUIPMENT}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Buy equipment`, "Buy equipment", `free.wiza.TRANSFER`, [
				account.account,
				owner,
				gain,
			]),
			Pact.lang.mkCap(`Marketplace fee`, "Marketplace fee", `free.wiza.TRANSFER`, [
				account.account,
				ADMIN_ADDRESS,
				fee,
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("buyNft", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const makeOfferEquipment = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, ringType, days, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.make-offer "${account.account}" "${ringType}" ${days} ${_.round(amount).toFixed(1)} free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME_EQUIPMENT}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Make offer`, "Make offer", `free.wiza.TRANSFER`, [
				account.account,
				"wiz-equipment-offers-bank",
				_.round(amount, 2),
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("makeOfferEquipment", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const acceptOfferEquipment = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idOffer, idYourItem, account, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.accept-offer "${idOffer}" "${idYourItem}" "${account.account}" free.wiza)`;

		const fee = _.round(((amount * 2) / 100), 2)
		const gain = _.round(amount - fee, 2)

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME_EQUIPMENT}.OWNER`,
				[account.account, idYourItem]
			),
			Pact.lang.mkCap(`Accept offer`, "Accept offer", `free.wiza.TRANSFER`, [
				"wiz-equipment-offers-bank",
				account.account,
				_.round(gain, 2),
			]),
			Pact.lang.mkCap(`Accept offer`, "Accept offer", `free.wiza.TRANSFER`, [
				"wiz-equipment-offers-bank",
				ADMIN_ADDRESS,
				_.round(fee, 2),
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("acceptOfferEquipment", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const withdrawEquipmentOffer = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idOffer, account, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.cancel-offer "${idOffer}" free.wiza)`;

		let caps = [
			Pact.lang.mkCap(`Withdraw offer`, "Withdraw offer", `free.wiza.TRANSFER`, [
				"wiz-equipment-offers-bank",
				account.account,
				_.round(amount, 2),
			]),
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME_EQUIPMENT}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("withdrawEquipmentOffer", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const subscribeToTournamentMass = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, buyin, list) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.subscribe-tournament-mass ${JSON.stringify(list)} "${account.account}")`;

		let coinTransferAmount = _.round(buyin*list.length, 2)
		const singleFee = _.round(((buyin * 10) / 100), 2)

		const totalFee = _.round(singleFee * list.length, 2)
		let coinTransferNet = _.round(coinTransferAmount - totalFee, 2)

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Subscribe`, "Pay the buyin", `coin.TRANSFER`, [
				account.account,
				WIZ_BANK,
				coinTransferNet,
			]),
			Pact.lang.mkCap(`Subscribe`, "Pay the fee", `coin.TRANSFER`, [
				account.account,
				ADMIN_ADDRESS,
				totalFee,
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		//console.log(caps);

		let gasL = 6000 * list.length
		if (gasL > 180000) {
			gasL = 180000
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: gasL,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("subscribeToTournamentMass", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const subscribeToTournamentMassWIZA = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, list, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.subscribe-tournament-wiza-mass ${JSON.stringify(list)} "${account.account}" free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Subscribe`, "Pay the buyin", `free.wiza.TRANSFER`, [
				account.account,
				WIZA_TOKEN_BANK,
				_.round(amount, 2),
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		//console.log(caps);

		let gasL = 6000 * list.length
		if (gasL > 180000) {
			gasL = 180000
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: gasL,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("subscribeToTournamentMassWIZA", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const subscribeToTournamentMassELITE = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, list, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.subscribe-tournament-elite-mass ${JSON.stringify(list)} "${account.account}" free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Subscribe`, "Pay the buyin", `free.wiza.TRANSFER`, [
				account.account,
				WIZA_TOKEN_BANK,
				_.round(amount, 2),
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		//console.log(caps);

		let gasL = 6000 * list.length
		if (gasL > 180000) {
			gasL = 180000
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: gasL,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("subscribeToTournamentMassWIZA", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const subscribeToTournamentMassAuto = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, tournamentName, list, amount) => {
	return (dispatch) => {

		let pactCode = `(free.wiztournaments.join-tournament "${tournamentName}" ${JSON.stringify(list)} "${account.account}" free.wiz-arena free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.wiztournaments.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Subscribe`, "Pay the buyin", `free.wiza.TRANSFER`, [
				account.account,
				"wiz-tournament-bank",
				_.round(amount, 2),
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		//console.log(caps);

		let gasL = 6000 * list.length
		if (gasL > 180000) {
			gasL = 180000
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: gasL,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("subscribeToTournamentMassAuto", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const subscribeToLords = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, seasonId, list, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.subscribe-to-lord-season-mass "${account.account}" "${seasonId}" ${JSON.stringify(list)})`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Subscribe`, "Pay the fee", `coin.TRANSFER`, [
				account.account,
				ADMIN_ADDRESS,
				amount,
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		//console.log(caps);

		let gasL = 6000 * list.length
		if (gasL > 180000) {
			gasL = 180000
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: gasL,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("subscribeToLords", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const subscribeToDungeons = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, seasonId, list, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.subscribe-to-dungeon-season-mass "${account.account}" "${seasonId}" ${JSON.stringify(list)})`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Subscribe`, "Pay the fee", `coin.TRANSFER`, [
				account.account,
				ADMIN_ADDRESS,
				amount,
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		//console.log(caps);

		let gasL = 6000 * list.length
		if (gasL > 180000) {
			gasL = 180000
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: gasL,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("subscribeToDungeons", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const subscribeToPvPMass = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, list, amountWiza) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.subscribe-pvp-mass ${JSON.stringify(list)} "${account.account}" free.wiza)`;

		const amount = _.round(list.length * 1.0, 2)

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap(`Subscribe`, "Pay the fee", `coin.TRANSFER`, [
				account.account,
				"k:9ca8b0b628eb386edafcb66cb90cfd79f349433502e1c1dece1fa097f6801250",
				amount,
			]),
			Pact.lang.mkCap(`Subscribe`, "Pay the fee", `free.wiza.TRANSFER`, [
				account.account,
				WIZA_TOKEN_BANK,
				_.round(amountWiza, 2),
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		//console.log(caps);

		let gasL = 6000 * list.length
		if (gasL > 180000) {
			gasL = 180000
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: gasL,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("subscribeToPvPMass", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const incrementFightPvP = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, pvpWeek, idNft, wizaAmount) => {
	return (dispatch) => {

		const key = `${pvpWeek}_${idNft}`

		let pactCode = `(free.${CONTRACT_NAME}.add-rounds-pvp "${key}" ${wizaAmount}.0 free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.OWNER`,
				[account.account, idNft]
			),
			Pact.lang.mkCap(`Increment PvP fights`, "Pay to increment fights", `free.wiza.TRANSFER`, [
			    account.account,
			    WIZA_TOKEN_BANK,
			    _.round(wizaAmount, 2),
			]),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("incrementFightPvP", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const changeSpellTournament = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, idNft, spellSelected) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.change-spell-tournament "${idNft}" "${account.account}" ${JSON.stringify(spellSelected)})`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.OWNER`,
				[account.account, idNft]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("changeSpellTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const transferNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idNft, account, receiver) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.transfer-wizard "${idNft}" "${account.account}" "${receiver}" free.wiz-equipment)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.OWNER`,
				[account.account, idNft]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("transferNft", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const transferEquipment = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, iditem, account, receiver) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.transfer-equipment "${iditem}" "${account.account}" "${receiver}")`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME_EQUIPMENT}.OWNER`,
				[account.account, iditem]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("transferEquipment", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}


export const buyUpgrade = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, stat, increase, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.buy-upgrades "${account.account}" "${idnft}" "${stat}" ${increase} free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Buy upgrades`, "Buy upgrades", `free.wiza.TRANSFER`, [
				    account.account,
				    WIZA_TOKEN_BANK,
				    _.round(amount, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 20000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("buyUpgrade", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const buyUpgradeWithAp = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, stat, increase, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.buy-upgrades-ap "${account.account}" "${idnft}" "${stat}" ${increase} free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Buy upgrades`, "Buy upgrades", `free.wiza.TRANSFER`, [
				    account.account,
				    WIZA_TOKEN_BANK,
				    _.round(amount, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 20000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("buyUpgradeWithAp", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const buyDowngrade = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, stat, decrease, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.retrain "${idnft}" "${account.account}" "${stat}" ${decrease} free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Retrain`, "Pay the fee", `free.wiza.TRANSFER`, [
				    account.account,
				    WIZA_TOKEN_BANK,
				    _.round(amount, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("downgrade", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const buyVial = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, key, potion, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.buy-potions "${account.account}" "${idnft}" "${key}" "${potion}" free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Buy vial`, "Buy vial", `free.wiza.TRANSFER`, [
				    account.account,
				    WIZA_TOKEN_BANK,
				    _.round(amount, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("buyVial", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const buyNickname = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, nickname, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.update-nickname "${idnft}" "${account.account}" "${nickname}" free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Nickname`, "Pay the fee", `free.wiza.TRANSFER`, [
				    account.account,
				    WIZA_TOKEN_BANK,
				    _.round(amount, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("buyNickname", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const swapSpell = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, oldspellname, newspellname, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.swap-spell "${idnft}" "${account.account}" "${oldspellname}" "${newspellname}" free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Swap spell`, "Pay the fee", `free.wiza.TRANSFER`, [
				    account.account,
				    WIZA_TOKEN_BANK,
				    _.round(amount, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 5000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("swapSpell", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const equipItem = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, iditem, account, idnft) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.equip-item "${iditem}" "${account.account}" "${idnft}" free.wiz-arena)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME_EQUIPMENT}.OWNER`,
          			[account.account, iditem]
        		),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("equipItem", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const unequipItem = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, iditem, account, idnft, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.unequip-item "${iditem}" "${account.account}" "${idnft}" free.wiz-arena free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME_EQUIPMENT}.OWNER`,
          			[account.account, iditem]
        		),
				Pact.lang.mkCap(`Unequip`, "Pay the fee", `free.wiza.TRANSFER`, [
				    account.account,
				    WIZA_TOKEN_BANK,
				    _.round(amount, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("unequipItem", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}


export const improveSpell = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, stat, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.improve-spell "${idnft}" "${account.account}" "${stat}" free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Subscribe`, "Pay the buyin", `free.wiza.TRANSFER`, [
				    account.account,
				    WIZA_TOKEN_BANK,
				    _.round(amount, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 5000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("improveSpell", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const resetSpellUpgrades = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.remove-all-upgrades-spell "${idnft}" "${account.account}")`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 5000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("resetSpellUpgrades", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const upgradeAura = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.upgrade-aura "${idnft}" "${account.account}" free.wiz-arena free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME_EQUIPMENT}.ACCOUNT_GUARD`,
          			[account.account]
        		),
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Pay WIZA`, "Pay WIZA", `free.wiza.TRANSFER`, [
					account.account,
					"wiza-token-bank",
					_.round(amount, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 5000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("upgradeAura", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const getSpellUpgradeCost = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 50000, networkUrl, idnft, spellName, callback) => {
	return (dispatch) => {

		const key = `${idnft}_${spellName}`

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wiza-cost-for-improve-spell "${key}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (!response.status && callback) {
				callback(response)
			}
		})
	}
}

export const getAuraUpgradeCost = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 50000, networkUrl, idnft, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_EQUIPMENT}.get-wiza-cost-for-upgrade-aura "${idnft}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (!response.status && callback) {
				callback(response)
			}
		})
	}
}

export const swapKdaWiza = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, amountKda, amountWiza, account) => {
	return (dispatch) => {

		//console.log(amountKda);

		let slippage = 0.05
		let token0AmountWithSplippage = parseFloat(amountKda) + (parseFloat(amountKda) * slippage / 100)
		//console.log(token0AmountWithSplippage);

		let token1AmountWithSlippage = amountWiza - (amountWiza * slippage / 100)

		let pactCode = `(kdlaunch.kdswap-exchange.swap-exact-in (read-decimal "token0Amount") (read-decimal "token1AmountWithSlippage") [coin free.wiza] "${account.account}" "${account.account}" (read-keyset "user-ks"))`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(`Transfer capability`, "swap kda to wiza", `coin.TRANSFER`, [
					account.account,
					"zV4AcMr1UcqDswRfSh6tzmpsmx7hWg5o0IYns0ZuN1I",
					amountKda,
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
				/*
				Pact.lang.mkCap("Gas station", "pay gas", "kdlaunch.kdswap-gas-station.GAS_PAYER", [
					"free-gas",
					1,
					amountKda
				])
				*/
			],
			sender: account.account,
			gasLimit: 5000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account,
				token0Amount: parseFloat(amountKda),
				token0AmountWithSplippage,
				token1Amount: amountWiza,
				token1AmountWithSlippage
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("swapKdaWiza", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

/*********************************
CHALLENGES FUNCTIONS
**********************************/

export const sendChallenge = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, nft1id, nft2id, account, amount, coin) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.send-challenge "${nft1id}" "${nft2id}" ${_.round(amount).toFixed(1)} "${coin}" free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME}.OWNER`,
				[account.account, nft1id]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		if (coin === "kda") {
			caps.push(
				Pact.lang.mkCap(`Send challenge KDA`, "Send challenge KDA", `coin.TRANSFER`, [
					account.account,
					"wizards-offers-bank",
					_.round(amount, 2),
				])
			)
		}
		else {
			caps.push(
				Pact.lang.mkCap(`Send challenge WIZA`, "Send challenge WIZA", `free.wiza.TRANSFER`, [
					account.account,
					"wiz-auto-tournaments-bank",
					_.round(amount, 2),
				])
			)
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("sendChallenge", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const acceptChallenge = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, challengeid, nft2id, account, amount, coin) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.accept-challenge "${challengeid}" free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME}.OWNER`,
				[account.account, nft2id]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		if (coin === "kda") {
			caps.push(
				Pact.lang.mkCap(`Accept challenge`, "Accept challenge", `coin.TRANSFER`, [
					account.account,
					"wizards-offers-bank",
					_.round(amount, 2),
				])
			)
		}
		else {
			caps.push(
				Pact.lang.mkCap(`Accept challenge`, "Accept challenge", `free.wiza.TRANSFER`, [
					account.account,
					"wiz-auto-tournaments-bank",
					_.round(amount, 2),
				])
			)
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("acceptChallenge", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const cancelChallenge = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, challengeid, account, amount, coin) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.cancel-challenge "${challengeid}" free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		if (coin === "kda") {
			caps.push(
				Pact.lang.mkCap(`Cancel challenge`, "Cancel challenge", `coin.TRANSFER`, [
					"wizards-offers-bank",
					account.account,
					_.round(amount, 2),
				]),
			)
		}
		else {
			caps.push(
				Pact.lang.mkCap(`Cancel challenge`, "Cancel challenge", `free.wiza.TRANSFER`, [
					"wiz-auto-tournaments-bank",
					account.account,
					_.round(amount, 2),
				]),
			)
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 5000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("cancelChallenge", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const getChallengesSent = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 75000, networkUrl, address, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-sent-challenges "${address}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			response = response.filter(i => i.amount > 0)

			let pending = []
			let replay = []
			let fight = []

			if (response && response.length > 0) {
				response.map((item) => {
					if (item.fightId) {
						replay.push(item)
					}

					if (item.status === "accepted" && !item.fightId) {
						fight.push(item)
					}

					if (item.status === "pending") {
						pending.push(item)
					}
				})

				replay.sort((a, b) => {
					return parseInt(b.id) - parseInt(a.id)
				})

				let final = []
				final.push(...fight)
				final.push(...pending)
				final.push(...replay)

				dispatch({ type: SET_CHALLENGES_SENT, payload: final })
				if (callback) {
					callback(final)
				}
			}
			else {
				if (callback) {
					callback(undefined)
				}
			}

		})
	}
}

export const getChallengesReceived = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 75000, networkUrl, address, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-received-challenges "${address}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			response = response.filter(i => i.amount > 0)

			response = response.filter(i => {
				const now = moment()
				const expiresat = moment(i.expiresat.timep)
				//console.log(now.isBefore(expiresat));
				if (i.status === 'pending') {
					return now.isBefore(expiresat)
				}
				return true
			})

			let replay = []
			let toaccept = []
			let fight = []

			if (response && response.length > 0) {
				response.map((item) => {
					if (item.fightId) {
						replay.push(item)
					}

					if (item.status === "accepted" && !item.fightId) {
						fight.push(item)
					}

					if (item.status === "pending") {
						toaccept.push(item)
					}
				})

				replay.sort((a, b) => {
					return parseInt(b.id) - parseInt(a.id)
				})

				let final = []
				final.push(...fight)
				final.push(...toaccept)
				final.push(...replay)

				dispatch({ type: SET_CHALLENGES_RECEIVED, payload: final })
				if (callback) {
					callback(final)
				}
			}
			else {
				if (callback) {
					callback(undefined)
				}
			}

		})
	}
}

/////////  BUY AURA

export const buyAura = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, coin, amount) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_EQUIPMENT}.buy-aura "${idnft}" "${account.account}" "${coin}" free.wiz-arena free.wiza)`;

		let caps = [
			Pact.lang.mkCap(
				"Verify your account",
				"Verify your account",
				`free.${CONTRACT_NAME_EQUIPMENT}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		if (coin === "kda") {
			caps.push(
				Pact.lang.mkCap(`Buy Aura`, "Buy Aura", `coin.TRANSFER`, [
					account.account,
					ADMIN_ADDRESS,
					_.round(amount, 2),
				]),
			)
		}
		else {
			caps.push(
				Pact.lang.mkCap(`Buy Aura`, "Buy Aura", `free.wiza.TRANSFER`, [
				    account.account,
				    WIZA_TOKEN_BANK,
				    _.round(amount, 2),
				])
			)
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 5000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("buyAura", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}


/************************************************************************

AUTO TOURNAMENT FUNCTIONS

*************************************************************************/

export const createTournament = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, idnft, account, buyin, maxLevel, name, winners, nPlayers, type) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.create-tournament "${idnft}" "${account.account}" ${_.round(buyin).toFixed(1)} ${maxLevel} "${name}" ${winners} ${nPlayers} "${type}" free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Create Tournament`, "Create flash tournament", `free.wiza.TRANSFER`, [
					account.account,
					"wiz-auto-tournaments-bank",
					_.round(buyin, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("createTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const joinTournament = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, tournamentid, idnft, account, buyin) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.join-tournament "${tournamentid}" "${idnft}" "${account.account}" free.wiza)`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.OWNER`,
          			[account.account, idnft]
        		),
				Pact.lang.mkCap(`Join flash Tournament`, "Join flash tournament", `free.wiza.TRANSFER`, [
					account.account,
					"wiz-auto-tournaments-bank",
					_.round(buyin, 2),
				]),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 6000,
			gasPrice,
			chainId,
			ttl: 600,
			envData: {
				"user-ks": account.guard,
				account: account.account
			},
			signingPubKey: account.guard.keys[0],
			networkId: netId
		}

		//console.log("joinTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}


/************************************************************************

WIZA TOKEN FUNCTIONS

*************************************************************************/

export const getWizaBalance = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, address) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_WIZA}.get-user-balance "${address}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			let balance = response
			if (response && response.decimal) {
				balance = _.floor(response.decimal, 4)
			}

			dispatch({ type: SAVE_WIZA_BALANCE, payload: balance })
		})
	}
}

export const getTotalMined = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 50000, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_WIZA}.get-total-mined)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response) {
				dispatch({ type: STORE_TOTAL_MINED, payload: _.floor(response.decimal, 2) })

				if (callback) {
					callback()
				}
			}

		})
	}
}

export const getCirculatingSupply = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 50000, networkUrl) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_WIZA}.get-circulating-supply)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response) {
				dispatch({ type: STORE_CIRCULATING_SUPPLY, payload: _.floor(response.decimal, 2) })
			}

		})
	}
}


/************************************************************************

GENERAL FUNCTIONS

*************************************************************************/

export const signTransaction = (cmdToSign, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, nftId, callback) => {
	return async (dispatch) => {

		//console.log(cmdToSign)

		dispatch(updateTransactionState("signingCmd", cmdToSign))

		let signedCmd = null

		if (await inLinx()) {

			const caps = cmdToSign.caps
			let coin;
			let amount = 0.0;
			caps.map(i => {
				if (i.cap.name === "coin.TRANSFER") {
					coin = "coin"
					if (i.cap.args.length >= 2) {
						amount += i.cap.args[2]
					}
				}

				if (i.cap.name === "free.wiza.TRANSFER" && (!coin || coin !== "coin")) {
					coin = "free.wiza"
					if (i.cap.args.length >= 2) {
						amount += i.cap.args[2]
					}
				}
			})

			const req = linxRequestData(
				cmdToSign,
				"WizardsArena transaction",
				"https://storage.googleapis.com/wizarena/wiz_logo_centrale.png",
				parseInt(chainId.toString()),
				coin,
				_.round(amount, 2),
				0.0,
				undefined,
				false
			)

			const result = await linx(linxNewRequest("Send", "Approve request for WizardsArena transaction", req, true))
			if (result !== undefined && result.error === undefined) {
				signedCmd = result
			}
			else {
				console.log("Failed to sign the command in Linx wallet")
				dispatch(updateTransactionState("error", `Failed to sign the command in Linx wallet`))
				return
			}
		}
		else if (isXWallet) {

			let xwalletSignRes = null;

			try {
				const accountConnectedRes = await window.kadena.request({
					method: "kda_requestAccount",
					networkId: netId,
					domain: window.location.hostname
				})
				//console.log(accountConnectedRes);

				if (accountConnectedRes && accountConnectedRes.status !== "success") {
					console.log("eckoWallet connection was lost, please re-connect")
					dispatch(updateTransactionState("error", "eckoWallet connection was lost, please re-connect"))
					dispatch(logout(isXWallet, netId))

					return
				}
				else if (accountConnectedRes && accountConnectedRes.wallet && accountConnectedRes.wallet.account !== account.account) {
					console.log(`Wrong X Wallet account selected in extension, please select ${account.account}`)
					dispatch(updateTransactionState("error", `Wrong eckoWallet account selected in extension, please select ${account.account}`))
					return
				}

				xwalletSignRes = await window.kadena.request({
					method: "kda_requestSign",
					networkId: netId,
					data: { networkId: netId, signingCmd: cmdToSign }
				})
			} catch (e) {
				console.log(e)
			}

			if (xwalletSignRes.status !== "success") {
				console.log("Failed to sign the command in eckoWallet")
				dispatch(updateTransactionState("error", `Failed to sign the command in eckoWallet`))
				return
			}

			signedCmd = xwalletSignRes.signedCmd;
		}
		else if(isQRWalletConnect) {

			const signClient = await SignClient.init({
			  projectId: process.env.REACT_APP_WALLET_CONNECT_ID,
			  metadata: {
			    name: "WizardsArena",
			    description: "Wizards Arena NFTGame",
			    url: "https://www.wizardsarena.net",
			    icons: ["https://firebasestorage.googleapis.com/v0/b/raritysniperkda.appspot.com/o/android-chrome-384x384.png?alt=media&token=e5946e6e-ac87-446a-91f4-f6144906ef22"],
			  },
			});

			//console.log(signClient);

			signClient.on("session_delete", () => {
				signClient.removeListener("session_delete")
				dispatch(logout(false, netId))
				dispatch(setQrWalletConnectClient(undefined))
			})

			signClient.on("pairing_delete", () => {
				signClient.removeListener("pairing_delete")
				dispatch(logout(false, netId))
				dispatch(setQrWalletConnectClient(undefined))
			})

			signClient.on("session_expire", () => {
				signClient.removeListener("session_expire")
				dispatch(logout(false, netId))
				dispatch(setQrWalletConnectClient(undefined))
			})

			signClient.on("pairing_expire", () => {
				signClient.removeListener("pairing_expire")
				dispatch(logout(false, netId))
				dispatch(setQrWalletConnectClient(undefined))
			})

			try {
				let topic = qrWalletConnectClient.pairingTopic

				let signRes = await signClient.request({
					topic,
					chainId: "kadena:mainnet01",
					request: {
						method: "kadena_sign",
						params: cmdToSign
					}
				})

				//console.log(signRes);

				signedCmd = signRes.signedCmd

			}
			catch(e) {
				console.log(e);
			}
		}
		else {
			try {
				signedCmd = await Pact.wallet.sign(cmdToSign)

				if (!signedCmd) {
					console.log("Failed to sign the command in the wallet")
					dispatch(updateTransactionState("error", "Failed to sign the command in the wallet"))
					return
				}

			} catch(e) {
				console.log(e)
				console.log("Failed to sign the command in the wallet")
				dispatch(updateTransactionState("error", "Failed to sign the command in the wallet"))
				return
			}
		}


		//console.log(signedCmd)

		dispatch(updateTransactionState("signedCmd", signedCmd))

		let localRes = null

		try {
			localRes = await fetch(`${networkUrl}/api/v1/local`, mkReq(signedCmd));
		} catch(e) {
			console.log(e)
			console.log("Failed to confirm transaction with the network")
			dispatch(updateTransactionState("error", "Failed to confirm transaction with the network"))
			return
		}

		const parsedLocalRes = await parseRes(localRes);

		//console.log(parsedLocalRes);
		//return

		if (parsedLocalRes && parsedLocalRes.result && parsedLocalRes.result.status === "success") {
			let data = null

			const logo = document.querySelector('#logo').getBoundingClientRect()
			const loaderModalTransaction = document.querySelector('#loaderModalTransaction').getBoundingClientRect()

			const diffLeft = logo.left - loaderModalTransaction.left
			const diffTop = logo.top - loaderModalTransaction.top

			anime({
				targets: "#loaderModalTransaction",
				translateX: diffLeft,
				translateY: diffTop,
				duration: 850
			})

			try {
				data = await Pact.wallet.sendSigned(signedCmd, networkUrl)

			} catch (e) {
				console.log(e)
				console.log("Had issues sending the transaction to the blockchain")
				dispatch(updateTransactionState("error", "Had issues sending the transaction to the blockchain"))
				return
			}

			//console.log(data)
			const requestKey = data.requestKeys[0]

			dispatch(updateTransactionState("requestKey", requestKey))
			dispatch(updateTransactionState("sentCmd", signedCmd))
		}
		else {
			let e = `Couldn't sign the transaction`
			if (parsedLocalRes && parsedLocalRes.result && parsedLocalRes.result.status === "failure") {
				if (parsedLocalRes.result.error && parsedLocalRes.result.error.message) {
					e = parsedLocalRes.result.error.message
				}
			}

			console.log(e)
			dispatch(updateTransactionState("error", e))
			return
		}

		if (callback) {
			callback()
		}
	}
}

export const signFightTransaction = (gasPrice, chainId, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient, networkUrl, account, callback) => {
	return async (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.check-your-account "${account.account}")`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
				[account.account]
			),
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		let cmdToSign = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 1000,
			gasPrice,
			chainId,
			type: 'exec',
			ttl: 600,
			networkId: netId,
			signingPubKey: account.account.replace("k:", "")
		}

		let signedCmd = null

		if (await inLinx()) {
			const req = linxRequestData(
				cmdToSign,
				"Sign transaction to fight",
				"https://storage.googleapis.com/wizarena/wiz_logo_centrale.png",
				parseInt(chainId.toString()),
				"coin",
				0.0,
				0.0,
				undefined,
				false
			)

			const result = await linx(linxNewRequest("Send", "Approve request for WizardsArena transaction", req, true))
			if (result !== undefined && result.error === undefined) {
				signedCmd = result
			}
			else {
				console.log("Failed to sign the command in Linx wallet")
				dispatch(updateTransactionState("error", `Failed to sign the command in Linx wallet`))
				return
			}
		}
		else if (isXWallet) {

			let xwalletSignRes = null;

			try {
				const accountConnectedRes = await window.kadena.request({
					method: "kda_requestAccount",
					networkId: netId,
					domain: window.location.hostname
				})
				//console.log(accountConnectedRes);

				if (accountConnectedRes && accountConnectedRes.status !== "success") {
					console.log("eckoWallet connection was lost, please re-connect")
					dispatch(logout(isXWallet, netId))
				}
				else if (accountConnectedRes && accountConnectedRes.wallet && accountConnectedRes.wallet.account !== account.account) {
					console.log(`Wrong X Wallet account selected in extension, please select ${account.account}`)
				}

				xwalletSignRes = await window.kadena.request({
					method: "kda_requestSign",
					networkId: netId,
					data: { networkId: netId, signingCmd: cmdToSign }
				})
			} catch (e) {
				console.log(e)
			}

			if (xwalletSignRes.status !== "success") {
				console.log("Failed to sign the command in eckoWallet")
			}

			//console.log(xwalletSignRes);

			signedCmd = xwalletSignRes.signedCmd;
		}
		else if(isQRWalletConnect) {

			const signClient = await SignClient.init({
			  projectId: process.env.REACT_APP_WALLET_CONNECT_ID,
			  metadata: {
			    name: "WizardsArena",
			    description: "Wizards Arena NFTGame",
			    url: "https://www.wizardsarena.net",
			    icons: ["https://firebasestorage.googleapis.com/v0/b/raritysniperkda.appspot.com/o/android-chrome-384x384.png?alt=media&token=e5946e6e-ac87-446a-91f4-f6144906ef22"],
			  },
			});

			//console.log(signClient);

			signClient.on("session_delete", () => {
				signClient.removeListener("session_delete")
				dispatch(logout(false, netId))
				dispatch(setQrWalletConnectClient(undefined))
			})

			signClient.on("pairing_delete", () => {
				signClient.removeListener("pairing_delete")
				dispatch(logout(false, netId))
				dispatch(setQrWalletConnectClient(undefined))
			})

			signClient.on("session_expire", () => {
				signClient.removeListener("session_expire")
				dispatch(logout(false, netId))
				dispatch(setQrWalletConnectClient(undefined))
			})

			signClient.on("pairing_expire", () => {
				signClient.removeListener("pairing_expire")
				dispatch(logout(false, netId))
				dispatch(setQrWalletConnectClient(undefined))
			})

			try {
				let topic = qrWalletConnectClient.pairingTopic

				let signRes = await signClient.request({
					topic,
					chainId: "kadena:mainnet01",
					request: {
						method: "kadena_sign",
						params: cmdToSign
					}
				})

				//console.log(signRes);

				signedCmd = signRes.signedCmd

			}
			catch(e) {
				console.log(e);
			}
		}
		else {
			try {
				signedCmd = await Pact.wallet.sign(cmdToSign)

				if (!signedCmd) {
					console.log("Failed to sign the command in the wallet")
				}

			} catch(e) {
				console.log(e)
				console.log("Failed to sign the command in the wallet")
			}
		}

		//console.log(signedCmd)

		if (!signedCmd) {
			callback({"error": "fail to sign"})
			return
		}

		let localRes = null

		try {
			localRes = await fetch(`${networkUrl}/api/v1/local`, mkReq(signedCmd));
		} catch(e) {
			console.log(e)
			console.log("Failed to confirm transaction with the network")
			return
		}

		//console.log(localRes);

		const parsedLocalRes = await parseRes(localRes);

		//console.log(parsedLocalRes);
		if (parsedLocalRes && parsedLocalRes.result && parsedLocalRes.result.status === "success") {
			if (callback) {
				callback(signedCmd)
			}
		}
		else {
			if (callback) {
				callback({"error": "fail to sign"})
			}
		}
	}
}

export const readFromContract = (cmd, returnError, networkUrl) => {
	return async (dispatch) => {

		try {
			let data = await Pact.fetch.local(cmd, networkUrl);

			//∞console.log(data, cmd);

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


export const loadUser = (account) => {
	return {
		type: LOAD_USER,
		payload: account
	}
}

export const clearUser = () => {
	return {
		type: CLEAR_USER,
	}
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

export const updateTransactionState = (key, value) => {
	return {
		type: UPDATE_TRANSACTION_STATE,
		payload: { key, value }
	}
}


export const clearTransaction = (requestKey) => {
	return {
		type: CLEAR_TRANSACTION_STATE,
		payload: requestKey
	}
}

export const clearTransactionByPactCode = (pactCode) => {
	return {
		type: CLEAR_TRANSACTION_STATE_PACT_CODE,
		payload: pactCode
	}
}

export const hideModalTx = () => {
	return {
		type: HIDE_MODAL_TX
	}
}

export const storeFiltersStats = (filters) => {
	return {
		type: STORE_FILTERS_STATS,
		payload: filters
	}
}

export const setSfida = (item) => {
	return {
		type: SET_SFIDA,
		payload: item
	}
}

export const setSfidaPvE = (item) => {
	return {
		type: SET_SFIDA_PVE,
		payload: item
	}
}

export const setAvgLevelPvp = (value) => {
	return {
		type: SET_AVG_LEVEL_PVP,
		payload: value
	}
}

export const setWizardSelectedShop = (wizardId) => {
	return {
		type: SET_WIZARD_SELECTED_SHOP,
		payload: wizardId
	}
}

export const selectWizard = (wizardId) => {
	return {
		type: SELECT_WIZARD,
		payload: wizardId
	}
}

export const setHideNavBar = (value) => {
	return {
		type: HIDE_NAV_BAR,
		payload: value
	}
}


export const setVisualColors = (isDarkmode) => {
	return {
		type: SET_VISUAL_COLORS,
		payload: isDarkmode
	}
}

export const logout = (isXWallet, netId) => {
	return async (dispatch) => {

		if (isXWallet) {
			await window.kadena.request({
        		method: "kda_disconnect",
        		networkId: netId,
      		});
		}

		dispatch({
			type: LOGOUT
		})
	}
}
