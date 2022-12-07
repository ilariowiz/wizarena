import Pact from "pact-lang-api";
import SignClient from "@walletconnect/sign-client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { calcLevelWizard } from '../components/common/CalcLevelWizard'
import _ from 'lodash'
import {
	CONTRACT_NAME,
	ADMIN_ADDRESS,
	LOAD_USER,
	DEFAULT_GAS_PRICE,
	MAIN_NET_ID,
	TEST_NET_ID,
	SET_NETWORK_SETTINGS,
	SET_NETWORK_URL,
	SET_CONNECT_WALLET,
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
	SET_SFIDA
} from './types'


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
			url = `https://api.chainweb.com/chainweb/0.0/${MAIN_NET_ID}/chain/${chainId}/pact`;
		}

		dispatch({ type: SET_NETWORK_URL, payload: url })
	}
}

export const setIsConnectWallet = (payload) => {
	return {
		type: SET_CONNECT_WALLET,
		payload
	}
}

export const setIsXwallet = (payload) => {
	return {
		type: SET_IS_X_WALLET,
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
				dispatch(setIsConnectWallet(false))
				break connectlabel
			}

			/*
			if (res.account && res.account.chainId !== chainId) {
				//console.log(`You need to select chain ${chainId} from X Wallet`)
				error = `You need to select chain ${chainId} from X Wallet`
				dispatch(setIsConnectWallet(false))
				break connectlabel
			}
			*/
		}
		catch (e) {
			//console.log(e)
			dispatch(setIsConnectWallet(false))
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

export const connectChainweaver = (account, chainId, gasPrice, gasLimit, networkUrl, callback) => {
	return (dispatch) => {
		dispatch(setIsXwallet(false))
		dispatch(setIsWalletConnectQR(false))

		dispatch(fetchAccountDetails(account, chainId, gasPrice, gasLimit, networkUrl, callback))
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

		//console.log(signClient);

		const requiredNamespaces = {
			kadena: {
				methods: ["kadena_sign", "kadena_quicksign"],
				chains: ["kadena:mainnet01", "kadena:testnet04"],
				events: ["kadena_transaction_updated"]
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

			dispatch(setIsWalletConnectQR(true))

			dispatch(setQrWalletConnectClient({ pairingTopic: session.topic }))

			const accounts = session.namespaces["kadena"].accounts.map((item) => {
				//console.log(item);
				let normalAccountName = item;
				["mainnet01", "testnet04"].forEach(chain => {
					normalAccountName = normalAccountName.replace("**", ":").replace(`kadena:${chain}:`, "")
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



export const fetchAccountDetails = (accountName, chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, callback) => {
	return async (dispatch) => {

		let cmd = {
			pactCode: `(coin.details ${JSON.stringify(accountName)})`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response.account) {
				dispatch(loadUser(response))
				dispatch(setIsConnectWallet(true))
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
				dispatch({ type: LOAD_ALL_NFTS_IDS, payload: { totalCountNfts: response.length, allNftsIds: response } })

				let partsBlock = _.chunk(response, response.length / 2)

				//console.log(partsBlock);

				Promise.resolve(dispatch(loadBlockNftsSplit(chainId, gasPrice, 100000, networkUrl, partsBlock[0]))).then(response1 => {
					//console.log(response1);

					Promise.resolve(dispatch(loadBlockNftsSplit(chainId, gasPrice, 100000, networkUrl, partsBlock[1]))).then(response2 => {
						//console.log(response2);

						let final = response1.concat(response2)

						//console.log(final);

						final.map(i => {
							const level = calcLevelWizard(i)
							i.level = level
						})

						final.sort((a, b) => {
							if (parseInt(a.price) === 0) return 1;
							if (parseInt(b.price) === 0) return -1
							return a.price - b.price
						})

						dispatch({
							type: LOAD_ALL_NFTS,
							payload: { allNfts: final, nftsBlockId: 0 }
						})

						if (callback) {
							callback(final)
						}
					})
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


export const loadBlockNftsSubscribed = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, block, callbackSubscribed) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wizard-fields-for-ids [${block}])`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response) {
				//console.log(response);
				response.map(i => {
					const level = calcLevelWizard(i)
					i.level = level
				})

				response.sort((a, b) => {
					if (parseInt(a.price) === 0) return 1;
					if (parseInt(b.price) === 0) return -1
					return a.price - b.price
				})

				let subscribedSpellGraph = {}

				response.map((item) => {
					const traits = item.traits
					const spellTrait = traits.find(i => i.trait_type === "Spell")

					const spellMain = spellTrait.value.split(" ")[0]

					if (!subscribedSpellGraph[spellMain]) {
						subscribedSpellGraph[spellMain] = 1
					}
					else {
						subscribedSpellGraph[spellMain] += 1
					}
				})

				//console.log(subscribedSpellGraph);

				if (callbackSubscribed) {
					callbackSubscribed(response)
				}

				dispatch({ type: LOAD_SUBSCRIBED, payload: { nfts: response, subscribedSpellGraph } })
			}
		})
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
				let block = []

				response.map(i => {
					block.push(i.id)
				})

				//block sono tutti gli oggetti dell'utente
				let userMintedGasLimit = block.length * 270
				dispatch(loadBlockUserMintedNfts(chainId, gasPrice, userMintedGasLimit, networkUrl, block, callback))
			}
		})
	}
}

export const loadBlockUserMintedNfts = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, block, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wizard-fields-for-ids [${block}])`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response) {

				response.sort((a, b) => {
					if (parseInt(a.price) === 0) return 1;
					if (parseInt(b.price) === 0) return -1
					return a.price - b.price
				})

				dispatch({
					type: LOAD_USER_MINTED_NFTS,
					payload: response
				})

				if (callback) {
					callback(response)
				}
			}
		})
	}
}

export const loadSingleNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, idNft, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wizard-fields-for-id ${idNft})`,
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

export const loadMaxItemsPerWallet = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, account, phase, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-max-items-clerics "${account.account}" "${phase}")`,
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

export const getAllSubscribersPvP = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 60000, networkUrl, pvpWeek, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-all-subscription-for-pvpweek "${pvpWeek}")`,
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

export const getPvPsubscription = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, id, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-pvp-subscription "${id}")`,
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

export const getWizardsStakedCount = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 50000, networkUrl) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_WIZA}.wizards-staked-count)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			dispatch({ type: LOAD_WIZARDS_STAKED, payload: response })
		})
	}
}

export const getSubscription = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, id, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-subscription "${id}")`,
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

export const getBuyin = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-value-tournament "buyin-key")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			dispatch({ type: LOAD_BUYIN, payload: response })
		})
	}
}

export const getFeeTournament = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-value-tournament "fee-tournament-key")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			dispatch({ type: LOAD_FEE_TOURNAMENT, payload: response })
		})
	}
}

export const getSubscribed = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 150000, networkUrl, tournament, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-all-subscription-for-tournament "${tournament}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response) {
				let onlyId = []
				response.map(i => {
					onlyId.push(i.idnft)
				})

				onlyId.sort((a, b) => {
					return parseInt(a) - parseInt(b)
				})

				dispatch(loadBlockNftsSubscribed(chainId, gasLimit, gasLimit, networkUrl, onlyId, callback))
			}
		})

	}
}

export const getInfoNftBurning = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, idnft, callback) => {
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


export const checkAddressForPrice = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, account, callback) => {
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

export const addNftToBurningQueue = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, idnft, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.add-to-burning-queue "${idnft}" "${account.account}" free.wiza)`;

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
			gasLimit: 3000,
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

export const mintNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, amount, account, stage) => {
	return (dispatch) => {

		const mintPrice = 10.0

		let pactCode = `(free.${CONTRACT_NAME}.get-clerics "${account.account}" ${amount})`;

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
					ADMIN_ADDRESS,
					mintPrice * amount,
				])
			)
		}

		let cmd = {
			pactCode,
			caps,
			sender: account.account,
			gasLimit: 2500 * amount,
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

		let pactCode = `(free.${CONTRACT_NAME}.list-wizard "${account.account}" "${idNft}" ${price} free.wiza)`;

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

		//let fee = nft.price * 5 / 100;
		//let toSeller = nft.price - fee

		//console.log("fee",fee)
		//console.log("toSeller",toSeller)

		let pactCode = `(free.${CONTRACT_NAME}.buy-wizard "${nft.id}" "${account.account}")`;

		let caps = [
			Pact.lang.mkCap(`Buy`, "Pay to buy", `coin.TRANSFER`, [
				account.account,
				nft.owner,
				nft.price,
			]),
			/*
			Pact.lang.mkCap(`Fee`, "Marketplace fee", `coin.TRANSFER`, [
				account.account,
				ADMIN_ADDRESS,
				fee,
			]),
			*/
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

export const subscribeToTournament = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, tournamentName, idNft, buyin, spellSelected) => {
	return (dispatch) => {

		const key = `${tournamentName}_${idNft}`

		let pactCode = `(free.${CONTRACT_NAME}.subscribe-tournament "${key}" "${tournamentName}" "${idNft}" "${account.account}" ${JSON.stringify(spellSelected)})`;

		let caps = [
			Pact.lang.mkCap(`Subscribe`, "Pay the buyin", `coin.TRANSFER`, [
				account.account,
				WIZ_BANK,
				buyin,
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

		//console.log("subscribeToTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const subscribeToPvPweek = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account, pvpWeek, idNft, spellSelected) => {
	return (dispatch) => {

		const key = `${pvpWeek}_${idNft}`

		let pactCode = `(free.${CONTRACT_NAME}.subscribe-pvp "${key}" "${pvpWeek}" "${idNft}" "${account.account}" ${JSON.stringify(spellSelected)})`;

		let caps = [
			/*
			Pact.lang.mkCap(`Subscribe`, "Pay the buyin", `coin.TRANSFER`, [
				account.account,
				ADMIN_ADDRESS,
				1.0,
			]),
			*/
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

		//console.log("subscribeToPvp", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const transferNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idNft, account, receiver) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.transfer-wizard "${idNft}" "${account.account}" "${receiver}" free.wiza)`;

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

		//console.log("subscribeToTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}


export const withdrawPrize = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.withdraw-prize "${account.account}")`;

		let caps = [
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

		//console.log("withdrawPrize", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const buyUpgrade = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, account, idnft, stat) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.buy-upgrade "${account.account}" "${idnft}" "${stat}" free.wiza)`;

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

		//console.log("buyUpgrade", cmd)

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

export const getCirculatingSupply = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 50000, networkUrl) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_WIZA}.get-total-mined)`,
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

export const getWizardStakeInfo = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, idnft, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_WIZA}.get-nft-staked "${idnft}")`,
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

export const calculateReward = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, days, multiplier, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME_WIZA}.calculate-reward ${days} ${multiplier})`,
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

export const getUpgradeCost = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 900, networkUrl, idnft, stat) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.calculate-wiza-cost "${idnft}" "${stat}")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			console.log(response, stat)

		})
	}
}

export const stakeNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idNft, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_WIZA}.stake "${idNft}" "${account.account}")`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME_WIZA}.OWNER`,
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

		//console.log("subscribeToTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const unstakeNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idNft, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_WIZA}.unstake "${idNft}" "${account.account}")`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME_WIZA}.OWNER`,
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

		//console.log("subscribeToTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const claimWithoutUnstake = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idNft, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME_WIZA}.claim-without-unstake "${idNft}" "${account.account}")`;

		let caps = [
			Pact.lang.mkCap(
				"Verify owner",
				"Verify your are the owner",
				`free.${CONTRACT_NAME_WIZA}.OWNER`,
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

		//console.log("subscribeToTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const claimAllWithoutUnstake = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, objects, account) => {
	return (dispatch) => {

		let onlyId = []
		objects.map(i => {
			onlyId.push(i.idnft)
		})

		let objs = JSON.stringify(objects)

		let pactCode = `(free.${CONTRACT_NAME_WIZA}.claim-all ${objs})`;

		let caps = [
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		onlyId.map(i => {
			caps.push(
				Pact.lang.mkCap(
					"Verify owner",
					"Verify your are the owner",
					`free.${CONTRACT_NAME_WIZA}.OWNER`,
					[account.account, i]
				)
			)
		})

		//console.log(caps);

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

		//console.log("subscribeToTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const claimAllAndUnstakeAll = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, objects, account) => {
	return (dispatch) => {

		let onlyId = []
		objects.map(i => {
			onlyId.push(i.idnft)
		})

		let objs = JSON.stringify(objects)

		let pactCode = `(free.${CONTRACT_NAME_WIZA}.claim-all-unstake-all ${objs})`;

		let caps = [
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		onlyId.map(i => {
			caps.push(
				Pact.lang.mkCap(
					"Verify owner",
					"Verify your are the owner",
					`free.${CONTRACT_NAME_WIZA}.OWNER`,
					[account.account, i]
				)
			)
		})

		//console.log(caps);

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

		//console.log("subscribeToTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

export const stakeAll = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, objects, account) => {
	return (dispatch) => {

		let onlyId = []
		objects.map(i => {
			onlyId.push(i.idnft)
		})

		let objs = JSON.stringify(objects)

		let pactCode = `(free.${CONTRACT_NAME_WIZA}.stake-all ${objs})`;

		let caps = [
			Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
		]

		onlyId.map(i => {
			caps.push(
				Pact.lang.mkCap(
					"Verify owner",
					"Verify your are the owner",
					`free.${CONTRACT_NAME_WIZA}.OWNER`,
					[account.account, i]
				)
			)
		})

		//console.log(caps);

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

		//console.log("subscribeToTournament", cmd)

		dispatch(updateTransactionState("cmdToConfirm", cmd))
	}
}

/************************************************************************

GENERAL FUNCTIONS

*************************************************************************/

export const signTransaction = (cmdToSign, isXWallet, isQRWalletConnect, qrWalletConnectClient, netId, networkUrl, account, chainId, nftId, callback) => {
	return async (dispatch) => {

		//console.log(cmdToSign, isQRWalletConnect, qrWalletConnectClient)

		dispatch(updateTransactionState("signingCmd", cmdToSign))

		let signedCmd = null

		if (isXWallet) {

			let xwalletSignRes = null;

			try {
				const accountConnectedRes = await window.kadena.request({
					method: "kda_requestAccount",
					networkId: netId,
					domain: window.location.hostname
				})
				//console.log(accountConnectedRes);

				if (accountConnectedRes && accountConnectedRes.status !== "success") {
					console.log("X Wallet connection was lost, please re-connect")
					dispatch(updateTransactionState("error", "X Wallet connection was lost, please re-connect"))
					dispatch(logout(isXWallet, netId))

					return
				}
				else if (accountConnectedRes && accountConnectedRes.wallet && accountConnectedRes.wallet.account !== account.account) {
					console.log(`Wrong X Wallet account selected in extension, please select ${account.account}`)
					dispatch(updateTransactionState("error", `Wrong X Wallet account selected in extension, please select ${account.account}`))
					return
				}
				/*
				else if (accountConnectedRes && accountConnectedRes.wallet && accountConnectedRes.wallet.chainId !== chainId) {
					console.log(`Wrong chain selected in X Wallet, please select ${chainId}`)
					dispatch(updateTransactionState("error", `Wrong chain selected in X Wallet, please select ${chainId}`))
					return
				}
				*/

				xwalletSignRes = await window.kadena.request({
					method: "kda_requestSign",
					networkId: netId,
					data: { networkId: netId, signingCmd: cmdToSign }
				})
			} catch (e) {
				console.log(e)
			}

			if (xwalletSignRes.status !== "success") {
				console.log("Failed to sign the command in X-Wallet")
				dispatch(updateTransactionState("error", `Failed to sign the command in X-Wallet`))
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

				console.log(signRes);

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

		if (parsedLocalRes && parsedLocalRes.result && parsedLocalRes.result.status === "success") {
			let data = null

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

			//await pollForTransaction(requestKey)
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


export const clearTransaction = () => {
	return {
		type: CLEAR_TRANSACTION_STATE
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
