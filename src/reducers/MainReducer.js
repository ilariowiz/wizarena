import {
	LOAD_USER,
	CLEAR_USER,
	DEFAULT_GAS_PRICE,
	SET_NETWORK_SETTINGS,
	SET_NETWORK_URL,
	SET_CONNECT_WALLET,
	LOAD_ALL_NFTS,
	LOAD_ALL_NFTS_IDS,
	LOAD_USER_MINTED_NFTS,
	UPDATE_TRANSACTION_STATE,
	CLEAR_TRANSACTION_STATE,
	SET_IS_X_WALLET,
	SET_IS_WALLET_CONNECT_QR,
	SET_QR_WALLET_CONNECT_CLIENT,
	SET_BLOCK_ID,
	COUNT_MINTED,
	LOGOUT,
	LOAD_BUYIN,
	LOAD_FEE_TOURNAMENT,
	LOAD_MONTEPREMI,
	LOAD_SUBSCRIBED,
	LOAD_SUBSCRIBED_WIZA,
	LOAD_SUBSCRIBED_ELITE,
	STORE_FILTERS_STATS,
	SAVE_WIZA_BALANCE,
	LOAD_WIZARDS_STAKED,
	STORE_CIRCULATING_SUPPLY,
	STORE_TOTAL_MINED,
	SET_SFIDA,
	SET_AVG_LEVEL_PVP,
	SET_WIZARD_SELECTED_SHOP,
	STORE_WIZA_NOT_CLAIMED,
	LOAD_BUYIN_WIZA,
	LOAD_BUYIN_ELITE,
	LOAD_FEE_TOURNAMENT_WIZA,
	SET_KADENA_NAME,
	SELECT_WIZARD,
	STORE_WALLET_XP,
	HIDE_NAV_BAR,
	SET_CHALLENGES_SENT,
	SET_CHALLENGES_RECEIVED,
	HIDE_MODAL_TX,
	CLEAR_TRANSACTION_STATE_PACT_CODE,
	SET_TIME_TO_HALVENING,
	SET_VISUAL_COLORS,
	TEXT_DAY_COLOR,
	TEXT_NIGHT_COLOR
} from '../actions/types'


const INITIAL_STATE = {
	account: {},
	chainId: '',
	gasPrice: DEFAULT_GAS_PRICE,
	netId: '',
	networkUrl: '',
	transactionsState: [],
	showModalTx: false,
	isConnectWallet: false,
	isXWallet: '',
	isQRWalletConnect: '',
	qrWalletConnectClient: undefined,
	totalCountNfts: 0,
	allNfts: [],
	allNftsIds: [],
	nftsBlockId: 0,
	userMintedNfts: [],
	countMinted: 0,
	buyin: 0,
	feeTournament: 0,
	montepremi: 0,
	subscribed: [],
	buyinWiza: 0,
	buyinElite: 0,
	feeTournamentWiza: 0,
	subscribedWiza: [],
	subscribedElite: [],
	statSearched: [],
	subscribedKdaSpellGraph: {},
	subscribedWizaSpellGraph: {},
	subscribedEliteSpellGraph: {},
	wizaBalance: 0,
	wizardsStaked: 0,
	circulatingSupply: 0,
	wizaNotClaimed: 0,
	sfida: {},
	avgLevelPvP: 0,
	wizardSelectedIdShop: undefined,
	kadenaname: "",
	nftSelected: undefined,
	walletXp: 0,
	hideNavBar: false,
	challengesReceived: [],
	challengesSent: [],
	timeToHalvening: "Loading how long for halvening...",
	filtriRanges: {},
	filtriProfileRanges: {},
	isDarkmode: false,
	mainTextColor: "#1d1d1f"
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case LOAD_USER:
			return { ...state, account: action.payload }
		case CLEAR_USER:
			return { ...state, account: {}, isConnectWallet: false }
		case SET_NETWORK_SETTINGS: {
			const { netId, chainId, gasPrice } = action.payload
			//console.log(action.payload)
			return { ...state, netId, chainId, gasPrice }
		}
		case SET_NETWORK_URL:
			return { ...state, networkUrl: action.payload }
		case SET_CONNECT_WALLET:
			return { ...state, isConnectWallet: action.payload }
		case SET_IS_X_WALLET:
			return { ...state, isXWallet: action.payload }
		case SET_IS_WALLET_CONNECT_QR:
			return { ...state, isQRWalletConnect: action.payload }
		case SET_QR_WALLET_CONNECT_CLIENT:
			return { ...state, qrWalletConnectClient: action.payload }
		case LOAD_ALL_NFTS_IDS: {
			const { allNftsIds } = action.payload
			return { ...state, allNftsIds }
		}
		case LOAD_ALL_NFTS: {
			const { allNfts, nftsBlockId, totalCountNfts, ranges } = action.payload

			let oldNftsBlockId = state.nftsBlockId
			if (!oldNftsBlockId) {
				oldNftsBlockId = nftsBlockId
			}

			return { ...state, allNfts, nftsBlockId: oldNftsBlockId, totalCountNfts, filtriRanges: ranges }
		}
		case SET_BLOCK_ID:
			return { ...state, nftsBlockId: action.payload }
		case LOAD_USER_MINTED_NFTS:
			return { ...state, userMintedNfts: action.payload.userMintedNfts, filtriProfileRanges: action.payload.ranges }
		case UPDATE_TRANSACTION_STATE: {
			const { key, value } = action.payload

			//console.log(key, value);

			let oldTState = Object.assign([], state.transactionsState)

			if (key === "cmdToConfirm") {
				const lastTransaction = {}
				lastTransaction[key] = value
				oldTState.push(lastTransaction)
			}
			else {
				let lastTransaction = oldTState && oldTState.length > 0 ? oldTState[oldTState.length-1] : undefined
				if (lastTransaction) {
					lastTransaction[key] = value
					oldTState[oldTState.length-1] = lastTransaction
				}
				else {
					lastTransaction = {}
					lastTransaction[key] = value
					oldTState.push(lastTransaction)
				}
			}

			//oldTState[key] = value

			return { ...state, transactionsState: oldTState, showModalTx: true }
		}
		case CLEAR_TRANSACTION_STATE: {
			let oldTState = Object.assign([], state.transactionsState)

			const txIdx = oldTState.findIndex(i => i.requestKey === action.payload)
			if (txIdx > -1) {
				oldTState.splice(txIdx, 1)
			}

			return { ...state, transactionsState: oldTState, showModalTx: false }
		}
		case CLEAR_TRANSACTION_STATE_PACT_CODE: {
			let oldTState = Object.assign([], state.transactionsState)

			const txIdx = oldTState.findIndex(i => i.cmdToConfirm.pactCode === action.payload)
			if (txIdx > -1) {
				oldTState.splice(txIdx, 1)
			}

			return { ...state, transactionsState: oldTState, showModalTx: false }
		}
		case HIDE_MODAL_TX:
			return { ...state, showModalTx: false }
		case COUNT_MINTED:
			return { ...state, countMinted: action.payload }
		case LOAD_BUYIN:
			return { ...state, buyin: action.payload }
		case LOAD_BUYIN_WIZA:
			return { ...state, buyinWiza: action.payload }
		case LOAD_BUYIN_ELITE:
			return { ...state, buyinElite: action.payload }
		case LOAD_FEE_TOURNAMENT:
			return { ...state, feeTournament: action.payload }
		case LOAD_FEE_TOURNAMENT_WIZA:
			return { ...state, feeTournamentWiza: action.payload }
		case LOAD_MONTEPREMI:
			return { ...state, montepremi: action.payload }
		case LOAD_SUBSCRIBED: {
			const { nfts, subscribedKdaSpellGraph } = action.payload
			return { ...state, subscribed: nfts, subscribedKdaSpellGraph }
		}
		case LOAD_SUBSCRIBED_WIZA: {
			const { nfts, subscribedWizaSpellGraph } = action.payload

			//console.log(nfts, subscribedWizaSpellGraph);
			return { ...state, subscribedWiza: nfts, subscribedWizaSpellGraph }
		}
		case LOAD_SUBSCRIBED_ELITE: {
			const { nfts, subscribedEliteSpellGraph } = action.payload

			//console.log(nfts, subscribedWizaSpellGraph);
			return { ...state, subscribedElite: nfts, subscribedEliteSpellGraph }
		}
		case STORE_FILTERS_STATS:
			return { ...state, statSearched: action.payload }
		case SAVE_WIZA_BALANCE:
			return { ...state, wizaBalance: action.payload }
		case LOAD_WIZARDS_STAKED:
			return { ...state, wizardsStaked: action.payload }
		case STORE_TOTAL_MINED:
			return { ...state, totalMined: action.payload }
		case STORE_WIZA_NOT_CLAIMED:
			return { ...state, wizaNotClaimed: action.payload }
		case STORE_CIRCULATING_SUPPLY:
			return { ...state, circulatingSupply: action.payload }
		case SET_SFIDA:
			return { ...state, sfida: action.payload }
		case SET_AVG_LEVEL_PVP:
			return { ...state, avgLevelPvP: action.payload }
		case SET_WIZARD_SELECTED_SHOP:
			return { ...state, wizardSelectedIdShop: action.payload }
		case SET_KADENA_NAME:
			return { ...state, kadenaname: action.payload }
		case SELECT_WIZARD:
			return { ...state, nftSelected: action.payload }
		case STORE_WALLET_XP:
			return { ...state, walletXp: action.payload }
		case HIDE_NAV_BAR:
			return { ...state, hideNavBar: action.payload }
		case SET_CHALLENGES_RECEIVED:
			return { ...state, challengesReceived: action.payload }
		case SET_CHALLENGES_SENT:
			return { ...state, challengesSent: action.payload }
		case SET_TIME_TO_HALVENING:
			return { ...state, timeToHalvening: action.payload }
		case SET_VISUAL_COLORS: {
			if (action.payload) {
				return { ...state, mainTextColor: TEXT_NIGHT_COLOR, isDarkmode: true }
			}

			return { ...state, mainTextColor: TEXT_DAY_COLOR, isDarkmode: false }
		}
		case LOGOUT:
			return { ...state, account: {}, transactionsState: [], showModalTx: false, isConnectWallet: false, isXWallet: false, isQRWalletConnect: false, userMintedNfts: [], wizaBalance: 0, wizardsStaked: 0, qrWalletConnectClient: undefined, kadenaname:""}
		default:
			return state
	}
}
