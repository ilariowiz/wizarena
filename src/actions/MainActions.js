import Pact from "pact-lang-api";
import _ from 'lodash'
import {
	CONTRACT_NAME,
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
	LOAD_ALL_NFTS_IDS,
	SET_BLOCK_ID,
	COUNT_MINTED,
	ITEMS_PER_BLOCK,
	LOGOUT,
	SET_REVEAL,
	LOAD_BUYIN,
	LOAD_FEE_TOURNAMENT,
	LOAD_MONTEPREMI,
	WIZ_BANK,
	LOAD_SUBSCRIBED,
	STORE_FILTERS_STATS,
	CONTRACT_NAME_WIZA,
	WIZA_TOKEN_BANK,
	SAVE_WIZA_BALANCE,
	LOAD_WIZARDS_STAKED
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


export const setConnectedWallet = (account, isXWallet, netId, chainId, callback) => {
	return async (dispatch) => {

		let error;

		if (account != null) {
			if (isXWallet) {

				connectlabel: try {
					await window.kadena.request({ method: "kda_disconnect", networkId: netId })

					const res = await window.kadena.request({ method: "kda_connect", networkId: netId })

					//console.log(res)

					if (res.status !== "success") {
						//console.log(`Could not connect to X Wallet`)
						error = `Could not connect to X Wallet`
						dispatch(setIsConnectWallet(false))
						break connectlabel
					}

					if (res.account && res.account.account !== account.account) {
						//console.log("Tried to connect to X Wallet but not with the account entered. Make sure you have logged into the right account in X Wallet")
						error = "Tried to connect to X Wallet but not with the account entered. Make sure you have logged into the right account in X Wallet"
						dispatch(setIsConnectWallet(false))
						break connectlabel
					}

					if (res.account && res.account.chainId !== chainId) {
						//console.log(`You need to select chain ${chainId} from X Wallet`)
						error = `You need to select chain ${chainId} from X Wallet`
						dispatch(setIsConnectWallet(false))
						break connectlabel
					}
				}
				catch (e) {
					//console.log(e)
					dispatch(setIsConnectWallet(false))
				}
			}

			//console.log(isXWallet)

			dispatch(setIsXwallet(isXWallet))
		}

		//console.log(error)

		if (error) {
			dispatch(logout(isXWallet, netId))
		}

		if (callback) {
			callback(error)
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

				if (callback) {
					//gli diciamo di leggere tutti gli ids, quindi qui block è response, appunto tutti gli id
					dispatch(loadBlockNfts(chainId, gasPrice, 150000, networkUrl, response, callback, false))
				}
			}
		})
	}
}

export const loadBlockNfts = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, networkUrl, block, callback, isSubscribed, callbackSubscribed) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-wizard-fields-for-ids [${block}])`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)

			if (response) {

				if (!isSubscribed) {

					response.sort((a, b) => {
						if (parseInt(a.price) === 0) return 1;
						if (parseInt(b.price) === 0) return -1
						return a.price - b.price
					})

					dispatch({
						type: LOAD_ALL_NFTS,
						payload: { allNfts: response, nftsBlockId: 0 }
					})
				}
				else {
					//console.log(response);

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


				if (callback) {
					callback(response)
				}
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

export const readAccountMinted = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, address, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.read-account-minted "${address}")`,
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
				dispatch(loadBlockUserMintedNfts(chainId, gasPrice, 6000, networkUrl, block, callback))
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

export const loadMaxItemsPerWallet = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl, callback) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-max-items)`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (callback) {
				callback(response)
			}

			dispatch({ type: 'fake' })
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

export const getReveal = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit = 300, networkUrl) => {
	return (dispatch) => {

		let cmd = {
			pactCode: `(free.${CONTRACT_NAME}.get-value "wiz-reveal")`,
			meta: defaultMeta(chainId, gasPrice, gasLimit)
		}

		dispatch(readFromContract(cmd, true, networkUrl)).then(response => {
			//console.log(response)
			if (response) {
				dispatch({ type: SET_REVEAL, payload: response })
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

		/*
		let url = 'https://estats.chainweb.com/txs/events?search=wiz-arena.TOURNAMENT_SUBSCRIPTION&param=t2&offset=0&limit=250'

		//console.log(url);
		fetch(url)
  		.then(response => response.json())
  		.then(data => {
  			console.log(data)

			let onlyId = []
			data.map(i => {
				onlyId.push(i.params[0])
			})

			if (onlyId.length > 0) {
				//onlyId = onlyId.filter((v, i, a) => parseInt(a.indexOf(v)) === parseInt(i));
			}

			dispatch(loadBlockNfts(chainId, gasLimit, gasLimit, networkUrl, onlyId, undefined, true, callback))
  		})
		.catch(e => {
			console.log(e)
		})
		*/

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

				dispatch(loadBlockNfts(chainId, gasLimit, gasLimit, networkUrl, onlyId, undefined, true, callback))
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

export const mintNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, netId, amount, account) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.get-wizards "${account.account}" ${amount})`;

		let cmd = {
			pactCode,
			caps: [
				Pact.lang.mkCap(
          			"Verify your account",
          			"Verify your account",
          			`free.${CONTRACT_NAME}.ACCOUNT_GUARD`,
          			[account.account]
        		),
				Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
			],
			sender: account.account,
			gasLimit: 2500,
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

		let pactCode = `(free.${CONTRACT_NAME}.list-wizard "${account.account}" "${idNft}" ${price})`;

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

export const transferNft = (chainId, gasPrice = DEFAULT_GAS_PRICE, gasLimit, netId, idNft, account, receiver) => {
	return (dispatch) => {

		let pactCode = `(free.${CONTRACT_NAME}.transfer-wizard "${idNft}" "${account.account}" "${receiver}")`;

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

		let pactCode = `(free.${CONTRACT_NAME}.buy-upgrade "${account.account}" "${idnft}" "${stat}")`;

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

		//console.log("mintNft", cmd)

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

		console.log(caps);

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

export const signTransaction = (cmdToSign, isXWallet, netId, networkUrl, account, chainId, nftId, callback) => {
	return async (dispatch) => {

		//console.log(cmdToSign, isXWallet)

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
				else if (accountConnectedRes && accountConnectedRes.wallet && accountConnectedRes.wallet.chainId !== chainId) {
					console.log(`Wrong chain selected in X Wallet, please select ${chainId}`)
					dispatch(updateTransactionState("error", `Wrong chain selected in X Wallet, please select ${chainId}`))
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
				console.log("Failed to sign the command in X-Wallet")
				dispatch(updateTransactionState("error", `Failed to sign the command in X-Wallet`))
				return
			}

			signedCmd = xwalletSignRes.signedCmd;
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
