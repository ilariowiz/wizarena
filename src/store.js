import { createStore, applyMiddleware, compose } from 'redux';
import ReduxThunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import { createFilter } from 'redux-persist-transform-filter';
import storage from 'redux-persist/lib/storage'
import reducers from './reducers';


const saveSubsetMain = createFilter(
	'mainReducer',
	['account', 'chainId', 'isXWallet', 'reveal']
)

const persistConfig = {
	key: 'root',
	storage,
	transforms: [saveSubsetMain]
}


const persistedReducer = persistReducer(persistConfig, reducers);

let store = createStore(
	persistedReducer,
	{},
	compose(applyMiddleware(ReduxThunk))
);

export const persistor = persistStore(store)

export { store };
