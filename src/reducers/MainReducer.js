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
	SET_BLOCK_ID,
	COUNT_MINTED,
	LOGOUT,
	SET_REVEAL,
	LOAD_BUYIN,
	LOAD_FEE_TOURNAMENT,
	LOAD_MONTEPREMI,
	LOAD_SUBSCRIBED
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
	totalCountNfts: 0,
	allNfts: [],
	allNftsIds: [],
	nftsBlockId: 0,
	userMintedNfts: [],
	countMinted: 0,
	reveal: false,
	buyin: 0,
	feeTournament: 0,
	montepremi: 0,
	subscribed: []
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
		case LOAD_ALL_NFTS_IDS: {
			const { allNftsIds, totalCountNfts } = action.payload
			return { ...state, allNftsIds, totalCountNfts }
		}
		case LOAD_ALL_NFTS: {
			const { allNfts, nftsBlockId } = action.payload
			return { ...state, allNfts, nftsBlockId }
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
		case SET_REVEAL:
			return { ...state, reveal: action.payload }
		case LOAD_BUYIN:
			return { ...state, buyin: action.payload }
		case LOAD_FEE_TOURNAMENT:
			return { ...state, feeTournament: action.payload }
		case LOAD_MONTEPREMI:
			return { ...state, montepremi: action.payload }
		case LOAD_SUBSCRIBED:
			return { ...state, subscribed: action.payload }
		case LOGOUT:
			return { ...state, account: {}, transactionState: {}, showModalTx: false, isConnectWallet: false, isXWallet: false, userMintedNfts: []}
		default:
			return state
	}
}
