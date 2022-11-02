import React, { Component } from "react";
import { connect } from 'react-redux'
import Media from 'react-media';
import Popup from 'reactjs-popup';
import { getDocs, collection, query, where } from "firebase/firestore";
import { firebasedb } from './Firebase';
import DotLoader from 'react-spinners/DotLoader';
import { IoClose } from 'react-icons/io5'
import Header from './Header'
import NftCard from './common/NftCard'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import {
	loadAllNftsIds,
	getVolume,
	getPageBlockNfts,
	setNetworkSettings,
	setNetworkUrl,
	getReveal,
	storeFiltersStats,
	getWizardsStakedCount
} from '../actions'
import { MAIN_NET_ID, ITEMS_PER_BLOCK, TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR } from '../actions/types'
import '../css/Nft.css'
import 'reactjs-popup/dist/index.css';


class Collection extends Component {
	constructor(props) {
		super(props)

		this.state = {
			loading: true,
			volume: 0,
			nftsToShow: [],
			floor: 0,
			uniqueOwners: 1,
			searchText: '',
			searchedText: '',
		}
	}

	componentDidMount() {
		const { reveal } = this.props

		document.title = "Collection - Wizards Arena"

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

		setTimeout(() => {
			this.loadAll()
			this.getMarketVolume()
			this.getWizardsStakedCount()
			//facciamo il call su reveal solo se è 0, se è 1 è inutile richiamarlo
			if (parseInt(reveal) < 1 || !reveal) {
				this.getRevealNfts()
			}

		}, 500)

		//window.addEventListener('resize', this.resize)
	}

	/*
	componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    resize = throttle(() => this.forceUpdate(), 50)
	*/

	loadAll() {
		const { chainId, gasPrice, gasLimit, networkUrl, nftsBlockId, statSearched } = this.props

		this.setState({ loading: true })

		//è inutile refetchare di nuovo tutto, se ci sono le stat cercate significa che
		//gli nft sono stati già caricati
		if (statSearched && statSearched.length > 0) {
			this.searchByStat()
		}
		else {
			this.props.loadAllNftsIds(chainId, gasPrice, gasLimit, networkUrl, (res) => {

				this.getFloor(res)
				this.getUniqueOwners(res)

				this.props.getPageBlockNfts(res, nftsBlockId || 0, (nftsToShow) => {
					this.setState({ loading: false, nftsToShow })
				})
			})
		}

	}

	loadBlock(id) {
		const { allNfts } = this.props

		//console.log(allNfts)

		this.props.getPageBlockNfts(allNfts, id, (nftsToShow) => {
			this.setState({ nftsToShow })
		})
	}

	getMarketVolume() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getVolume(chainId, gasPrice, gasLimit, networkUrl, (res) => {
			this.setState({ volume: res })
		})
	}

	getWizardsStakedCount() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getWizardsStakedCount(chainId, gasPrice, gasLimit, networkUrl)
	}

	getRevealNfts() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getReveal(chainId, gasPrice, gasLimit, networkUrl)
	}

	getFloor(allNfts) {
		if (!allNfts) {
			return
		}

		//console.log(allNfts)

		let lowPrice;

		for (let i = 0; i < allNfts.length; i++) {
			const n = allNfts[i]

			if (n.listed) {
				if (!lowPrice || n.price < lowPrice) {
					lowPrice = n.price
				}
			}
		}

		if (lowPrice === 0) {
			this.setState({ floor: '...' })
			return
		}

		this.setState({ floor: lowPrice })
	}

	//da rivedere perché allNfts torna solo il blocco che stai visualizzando e non tutti gli nfts
	getUniqueOwners(allNfts) {
		if (!allNfts) {
			return
		}

		let owners = []

		for (let i = 0; i < allNfts.length; i++) {
			let o = allNfts[i].owner

		 	if (!owners.includes(o)) {
		 		owners.push(o)
		 	}
		}

		this.setState({ uniqueOwners: owners.length })
	}

	searchByName() {
		const { allNfts } = this.props
		const { searchText } = this.state

		let searchTextFinal = searchText.includes("#") ? searchText : `#${searchText}`
		const result = allNfts.filter(i => i.name === searchTextFinal)

		this.props.storeFiltersStats([])
		this.setState({ loading: false, nftsToShow: result, searchedText: searchText })
	}

	cancelSearch() {
		const { nftsBlockId } = this.props

		this.setState({ searchedText: '', searchText: '' })
		this.loadBlock(nftsBlockId)
	}

	async searchByStat(stat) {
		const { nftsBlockId, allNfts, statSearched } = this.props

		this.setState({ loading: true, searchedText: '', searchText: '' })

		let oldStat = Object.assign([], statSearched);

		if (stat) {
			const oldItem = oldStat.find(i => i.stat === stat.stat)
			if (oldItem) {
				if (oldItem.value === stat.value) {
					const idx = oldStat.findIndex(i => i.stat === stat.stat)
					oldStat.splice(idx, 1)
				}
				else {
					oldItem.value = stat.value
				}
			}
			else {
				oldStat.push(stat)
			}
		}

		if (oldStat.length > 0) {

			let arrayQuery = []
			oldStat.map(i => {
				const key = `stats.${i.stat}`
				const query = where(key, "==", i.value)
				arrayQuery.push(query)
			})

			let q = query(collection(firebasedb, "stats"), ...arrayQuery)

			const querySnapshot = await getDocs(q)

			let newData = []
			querySnapshot.forEach(doc => {
				//console.log(doc.data());

				const d = doc.data()

				const item = allNfts.find(i => i.name === d.name)
				if (item) {
					newData.push(item)
				}
			})

			newData.sort((a, b) => {
				if (parseInt(a.price) === 0) return 1;
				if (parseInt(b.price) === 0) return -1
				return a.price - b.price
			})

			this.props.storeFiltersStats(oldStat)
			this.setState({ nftsToShow: newData, loading: false })
		}
		else {
			this.setState({ loading: false })
			this.props.storeFiltersStats([])
			this.loadBlock(nftsBlockId)
		}
	}

	buildsRow(items, itemsPerRow = 4) {
		if (!items) {
			return []
		}

		return items.reduce((rows, item, index) => {
			//console.log(index);
			//se array row è piena, aggiungiamo una nuova row = [] alla lista
			if (index % itemsPerRow === 0 && index > 0) {
				rows.push([]);
			}

			//prendiamo l'ultima array della lista e aggiungiamo item
			rows[rows.length - 1].push(item);
			return rows;
		}, [[]]);
	}

	renderRow(itemsPerRow, index, nInRow, width) {
		//per ogni row creiamo un array di GameCard
		let array = [];

		let singleWidth = Math.floor((width - (nInRow * 12)) / nInRow)
		if (singleWidth > 320) singleWidth = 320;
		//console.log(singleWidth)

		itemsPerRow.map(item => {
			//console.log(item);

			array.push(
				<NftCard
					item={item}
					key={item.id}
					history={this.props.history}
					width={singleWidth}
				/>
			)
		})

		//passiamo l'array all'interno della row
		return (
			<div style={styles.rowStyle} key={index}>
				{array}
			</div>
		);
	}

	renderBoxHeader(title, subtitle, isMobile) {
		return (
			<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: 30 }}>
				<p style={{ fontSize: isMobile ? 18 : 22, color: 'white', textAlign: 'center' }}>
					{title}
				</p>

				<p style={{ fontSize: isMobile ? 17 : 19, color: '#c2c0c0', textAlign: 'center' }}>
					{subtitle}
				</p>
			</div>
		)
	}

	renderHeader(isMobile) {
		const { totalCountNfts, wizardsStaked } = this.props
		const { floor, uniqueOwners, volume } = this.state

		let items = totalCountNfts || 0

		return (
			<div style={{ width: '100%', height: 60, alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
				{this.renderBoxHeader(items.toLocaleString(), 'items', isMobile)}

				{this.renderBoxHeader(uniqueOwners.toLocaleString(), 'owners', isMobile)}

				{this.renderBoxHeader(`${floor || '...'} kda`, 'floor price', isMobile)}

				{this.renderBoxHeader(`${volume.toLocaleString()} kda`, 'total volume', isMobile)}

				{this.renderBoxHeader(`${wizardsStaked || 0}`, 'wizards staked', isMobile)}

			</div>
		)
	}

	renderSearchBar() {
		const { searchText } = this.state

		return (
			<div style={{ width: '100%', height: 60, alignItems: 'center', marginBottom: 20 }}>
				<input
					style={styles.inputSearch}
					placeholder='Search by #'
					value={searchText}
					onChange={(e) => this.setState({ searchText: e.target.value })}
				/>

				<button
					className='btnH'
					style={{ width: 130, height: 46, backgroundColor: CTA_COLOR, borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}
					onClick={() => this.searchByName()}
				>
					<p style={{ fontSize: 19, color: 'white' }}>
						Search
					</p>
				</button>
			</div>
		)
	}

	renderSearched() {
		const { searchedText } = this.state

		if (!searchedText) {
			return null
		}

		return (
			<div style={{ width: '100%', marginBottom: 20 }}>
				<div style={{ backgroundColor: '#e5e8eb80', justifyContent: 'center', alignItems: 'center', height: 45, paddingLeft: 20, paddingRight: 20, borderRadius: 2 }}>
					<p style={{ fontSize: 22, color: 'black', marginRight: 10 }}>
						{searchedText}
					</p>

					<button
						style={{ paddingTop: 5 }}
						onClick={() => this.cancelSearch()}
					>
						<IoClose
							color='black'
							size={22}
						/>
					</button>
				</div>
			</div>
		)
	}

	renderListStat(item, index, statName) {
		return (
			<button
				key={index}
				style={{ marginBottom: 15, marginLeft: 10 }}
				onClick={() => {
					this.listPopup.close()
					this.searchByStat({ stat: statName, value: item })
				}}
			>
				<p style={{ fontSize: 19 }}>
					{item}
				</p>
			</button>
		)
	}

	renderBoxSearchStat(statName, statDisplay, list) {
		const { statSearched } = this.props

		//console.log(statSearched);

		const findItem = statSearched && statSearched.length > 0 ? statSearched.find(i => i.stat === statName) : undefined

		let text = statDisplay.toUpperCase()
		if (findItem) {
			text = `${statDisplay} = ${findItem.value}`
		}

		return (
			<Popup
				ref={ref => this.listPopup = ref}
				trigger={
					<button style={styles.btnStat}>
						<p style={{ fontSize: 18, color: 'white' }}>{text}</p>
						{
							findItem &&
							<IoClose
								color='red'
								size={22}
								style={{ marginLeft: 5 }}
								onClick={(e) => {
									e.stopPropagation()
									this.searchByStat({ stat: findItem.stat, value: findItem.value })
								}}
							/>
						}
					</button>
				}
				position="bottom left"
				on="click"
				closeOnDocumentClick
				arrow={true}
			>
				<div style={{ flexDirection: 'column', paddingTop: 10 }}>
					{list.map((item, index) => {
						return this.renderListStat(item, index, statName)
					})}
				</div>
			</Popup>
		)
	}

	renderPageCounter() {
		const { allNftsIds, nftsBlockId } = this.props

		//console.log("allNftsIds", allNftsIds, nftsBlockId)

		let subarray = []

		//creiamo una lista di idx partendo dal corrente e togliendo e aggiungendo 5
		//se l'id che esce è minore di 0, lo ignoriamo
		let indexes = []
		for (let i = -5; i < 5; i++) {
			let idx = nftsBlockId + i
			if (idx >= 0) {
				indexes.push(idx)
			}
		}

		//console.log("indexes", indexes)

		let blocks = allNftsIds.reduce((rows, item, index) => {
			//console.log(index);
			//se array row è piena, aggiungiamo una nuova row = [] alla lista
			if (index % ITEMS_PER_BLOCK === 0 && index > 0) {
				rows.push([]);
			}

			//prendiamo l'ultima array della lista e aggiungiamo item
			rows[rows.length - 1].push(item);
			return rows;
		}, [[]]);

		//per ogni index che abbiamo calcolato, controlliamo che ci sia il corrispettivo, nell'array dei blocchi
		// se c'è aggiungiamo l'index alla subarray
		for (let i = 0; i < indexes.length; i++) {
			const idx = indexes[i]

			let block = blocks[idx]
			if (block) {
				subarray.push(idx)
			}
		}

		//console.log("subarray", subarray)

		let rows = []

		subarray.map(item => {

			let btnStyle = item === nftsBlockId ? styles.btnPageSelectedStyle : styles.btnPageStyle

			rows.push(
				<button
					style={btnStyle}
					key={item}
					onClick={() => {
						if (item !== nftsBlockId && !this.state.loading) {
							this.loadBlock(item)
						}
					}}
				>
					<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 22, lineHeight: 1 }}>
						{item+1}
					</p>
				</button>
			)
		})

		return (
			<div style={{ justifyContent: 'center', alignItems: 'center', height: 40, marginTop: 20, marginBottom: 20 }}>
				{rows}
			</div>
		)
	}

	renderError() {
		return (
			<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
				<img
					src={getImageUrl(undefined)}
					style={{ width: 340, height: 340, borderRadius: 2, marginBottom: 30 }}
					alt='Placeholder'
				/>

				<p style={{ fontSize: 23, color: 'white', textAlign: 'center' }}>
					The Arena is empty...
				</p>
			</div>
		)
	}

	renderBody(isMobile) {
		const { allNfts, allNftsIds, statSearched } = this.props
		const { loading, nftsToShow, searchedText } = this.state

		//console.log(allNftsIds)
		const { boxW } = getBoxWidth(isMobile)


		let nftMinW = 260;
		let nInRow = Math.floor(boxW / nftMinW)
		//console.log(boxW, nInRow)

		let rows = this.buildsRow(nftsToShow, nInRow)

		let numberOfWiz = allNfts ? allNfts.length : 0;
		if (searchedText.length > 0) {
			numberOfWiz = 1
		}
		else if (statSearched && statSearched.length > 0) {
			numberOfWiz = nftsToShow.length
		}

		return (
			<div style={{ flexDirection: 'column', width: boxW }}>

				{this.renderHeader(isMobile)}

				{this.renderSearchBar()}

				{this.renderSearched()}

				<div style={{ flexWrap: 'wrap', marginBottom: 10 }}>
					{this.renderBoxSearchStat("hp", "HP", [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61].reverse())}
					{this.renderBoxSearchStat("difesa", "DEFENSE", [14, 15, 16, 17, 18, 19].reverse())}
					{this.renderBoxSearchStat("elemento", "ELEMENT", ["Acid", "Dark", "Fire", "Ice", "Thunder", "Wind"])}
					{this.renderBoxSearchStat("resistenza", "RESISTANCE", ["acid", "dark", "fire", "ice", "thunder", "wind"])}
					{this.renderBoxSearchStat("debolezza", "WEAKNESS", ["acid", "dark", "fire", "ice", "thunder", "wind"])}
				</div>

				<p style={{ marginBottom: 15, fontSize: 16, color: 'white' }}>
					{numberOfWiz} Wizards
				</p>

				{
					allNfts && allNfts.length === 0 ?
					this.renderError()
					: null
				}

				{
					loading ?
					<div style={{ width: '100%', height: 45, marginTop: 20, marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

				{
					nftsToShow.length > 0 ?
					rows.map((itemsPerRow, index) => {
						return this.renderRow(itemsPerRow, index, nInRow, boxW);
					})
					:
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
						<img
							src={getImageUrl(undefined)}
							style={{ width: 280, height: 280, borderRadius: 2 }}
							alt='Placeholder'
						/>
					</div>
				}

				{
					allNftsIds && allNfts && allNfts.length > 0 && nftsToShow.length > 0 ?
					this.renderPageCounter()
					: null
				}
			</div>
		)
	}

	renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='home'
					section={1}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

	render() {
		return (
			<div style={styles.container}>
				<Media
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderTopHeader(false)}
				/>

				<Media
					query="(max-width: 767px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderBody(false)}
				/>
			</div>
		)
	}
}

const styles = {
	container: {
		flexDirection: 'column',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
	rowStyle: {
		width: '100%',
		marginBottom: 15
	},
	btnPageStyle: {
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 10,
		marginRight: 10,
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 6,
		paddingBottom: 6
	},
	btnPageSelectedStyle: {
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 10,
		marginRight: 10,
		borderRadius: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderWidth: 1,
		borderStyle: 'solid',
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 6,
		paddingBottom: 6
	},
	inputSearch: {
		width: 390,
		height: 43,
		marginRight: 15,
		color: 'black',
		borderRadius: 2,
		borderColor: '#e5e8eb',
		borderStyle: 'solid',
		borderWidth: 2,
		fontSize: 19,
		paddingLeft: 10,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		outline: 'none'
	},
	btnStat: {
		padding: 10,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10,
		marginBottom: 10,
		borderRadius: 2,
		minWidth: 60,
		display: 'flex',
		flexDirection: 'row'
	}
}

const mapStateToProps = (state) => {
	const { allNfts, account, chainId, gasPrice, gasLimit, networkUrl, allNftsIds, nftsBlockId, totalCountNfts, reveal, statSearched, wizardsStaked } = state.mainReducer;

	return { allNfts, account, chainId, gasPrice, gasLimit, networkUrl, allNftsIds, nftsBlockId, totalCountNfts, reveal, statSearched, wizardsStaked };
}

export default connect(mapStateToProps, {
	loadAllNftsIds,
	getVolume,
	getPageBlockNfts,
	setNetworkSettings,
	setNetworkUrl,
	getReveal,
	storeFiltersStats,
	getWizardsStakedCount
})(Collection)
