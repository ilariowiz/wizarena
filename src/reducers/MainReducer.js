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
	LOAD_FEE_TOURNAMENT_WIZA
} from '../actions/types'


const INITIAL_STATE = {
	account: {},
	chainId: '',
	gasPrice: DEFAULT_GAS_PRICE,
	netId: '',
	networkUrl: '',
	transactionState: {},
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
	feeTournamentWiza: 0,
	subscribedWiza: [],
	statSearched: [],
	subscribedKdaSpellGraph: {},
	subscribedWizaSpellGraph: {},
	wizaBalance: 0,
	wizardsStaked: 0,
	circulatingSupply: 0,
	wizaNotClaimed: 0,
	sfida: {},
	avgLevelPvP: 0,
	wizardSelectedIdShop: undefined
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
			const { allNftsIds, totalCountNfts } = action.payload
			return { ...state, allNftsIds, totalCountNfts }
		}
		case LOAD_ALL_NFTS: {
			const { allNfts, nftsBlockId } = action.payload

			let oldNftsBlockId = state.nftsBlockId
			if (!oldNftsBlockId) {
				oldNftsBlockId = nftsBlockId
			}

			return { ...state, allNfts, nftsBlockId: oldNftsBlockId }
		}
		case SET_BLOCK_ID:
			return { ...state, nftsBlockId: action.payload }
		case LOAD_USER_MINTED_NFTS:
			return { ...state, userMintedNfts: action.payload }
		case UPDATE_TRANSACTION_STATE: {
			const { key, value } = action.payload

			let oldTState = Object.assign({}, state.transactionState)

			oldTState[key] = value

			return { ...state, transactionState: oldTState, showModalTx: true }
		}
		case CLEAR_TRANSACTION_STATE:
			return { ...state, transactionState: {}, showModalTx: false }
		case COUNT_MINTED:
			return { ...state, countMinted: action.payload }
		case LOAD_BUYIN:
			return { ...state, buyin: action.payload }
		case LOAD_BUYIN_WIZA:
			return { ...state, buyinWiza: action.payload }
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
		case LOGOUT:
			return { ...state, account: {}, transactionState: {}, showModalTx: false, isConnectWallet: false, isXWallet: false, isQRWalletConnect: false, userMintedNfts: [], wizaBalance: 0, wizardsStaked: 0, qrWalletConnectClient: undefined}
		default:
			return state
	}
}
