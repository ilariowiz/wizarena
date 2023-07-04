import React, { Component } from "react";
import { connect } from 'react-redux'
import Media from 'react-media';
import Popup from 'reactjs-popup';
import DotLoader from 'react-spinners/DotLoader';
import { IoClose } from 'react-icons/io5'
import { BiFilter } from 'react-icons/bi'
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
	storeFiltersStats,
	getWizardsStakedCount
} from '../actions'
import { MAIN_NET_ID, ITEMS_PER_BLOCK, CTA_COLOR } from '../actions/types'
import '../css/Nft.css'
import 'reactjs-popup/dist/index.css';
import '../css/Header.css'


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
			listed: 0,
			showFilters: false
		}
	}

	componentDidMount() {
		document.title = "Marketplace - Wizards Arena"

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

		setTimeout(() => {
			this.loadAll()
			this.getMarketVolume()
			this.getWizardsStakedCount()
		}, 500)
	}

	loadAll() {
		const { chainId, gasPrice, gasLimit, networkUrl, statSearched, allNfts } = this.props

		this.setState({ loading: true })

		//è inutile refetchare di nuovo tutto, se ci sono le stat cercate significa che
		//gli nft sono stati già caricati
		if (statSearched && statSearched.length > 0) {
			this.searchByStat()
		}
		else {
			if (allNfts) {
				this.loadBlock(this.props.nftsBlockId || 0)
			}

			this.props.loadAllNftsIds(chainId, gasPrice, gasLimit, networkUrl, (res) => {

				this.getFloor(res)
				this.getUniqueOwners(res)
				this.getListed(res)

				this.props.getPageBlockNfts(res, this.props.nftsBlockId || 0, (nftsToShow) => {
					//console.log("loadAllNftsIds completed");
					this.setState({ loading: false, nftsToShow })

				})
			})
		}

	}

	loadBlock(id) {
		const { allNfts } = this.props

		//console.log(allNfts)

		this.props.getPageBlockNfts(allNfts, id, (nftsToShow) => {
			this.setState({ nftsToShow, loading: false })
			window.scrollTo({ top: 0, behavior: 'smooth' });
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

	getListed(allNfts) {
		if (!allNfts) {
			return
		}

		let tot = 0

		allNfts.map(i => {
			if (i.listed) {
				tot += 1
			}
		})
		//console.log(tot);

		this.setState({ listed: tot })
	}

	searchByName() {
		const { allNfts } = this.props
		const { searchText } = this.state

		if (!allNfts || (allNfts && allNfts.length === 0)) {
			return undefined
		}

		//let searchTextFinal = searchText.includes("#") ? searchText : `#${searchText}`
		const result = allNfts.filter(i => {
			//console.log(i);
			if (i.name.includes(searchText) ||
				(i.nickname && i.nickname.toLowerCase().includes(searchText.toLowerCase())) ||
				(i.owner.includes(searchText.toLowerCase()))) {
				return i
			}
		})

		//console.log(result);

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

		//console.log(allNfts);
		if (!allNfts || allNfts.length === 0) {
			return
		}


		//console.log(stat);

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

			let newData = Object.assign([], allNfts)

			oldStat.map(i => {

				if (i.stat === "collection") {
					if (i.value === "Wizards") {
						newData = newData.filter(n => {
							return n.id && parseInt(n.id) <= 1023
						})
					}
					else if (i.value === "Clerics") {
						newData = newData.filter(n => {
							return n.id && parseInt(n.id) > 1023 && parseInt(n.id) <= 2047
						})
					}
					else if (i.value === "Druids") {
						newData = newData.filter(n => {
							return n.id && parseInt(n.id) > 2047 && parseInt(n.id) <= 3071
						})
					}
				}

				if (i.stat === "hp" || i.stat === "defense" || i.stat === "attack" || i.stat === "damage" || i.stat === "speed") {
					const values = i.value.split(" - ")
					const minV = parseInt(values[0])
					const maxV = parseInt(values[1])

					newData = newData.filter(n => {
						return n[i.stat] && n[i.stat].int >= minV && n[i.stat].int <= maxV
					})
				}

				if (i.stat === "element" || i.stat === "resistance" || i.stat === "weakness") {
					//console.log(newData);
					newData = newData.filter(n => {
						return n[i.stat] && n[i.stat].toUpperCase() === i.value.toUpperCase()
					})
				}

				if (i.stat === "spellbook") {
					//console.log(newData);
					newData = newData.filter(n => {
						return n.spellbook && n.spellbook.length === i.value
					})
				}

				if (i.stat === "level") {
					//console.log(newData);
					const rangeLevels = i.value.split(" - ")
					const minLevel = rangeLevels[0]
					const maxLevel = rangeLevels[1]

					newData = newData.filter(n => {
						return n.level >= parseInt(minLevel) && n.level <= parseInt(maxLevel)
					})
				}
			})

			/*
			let arrayQuery = []
			oldStat.map(i => {
				if (i.stat !== "spellbook" && i.stat !== "level") {
					const query = where(i.stat, "==", i.value)
					arrayQuery.push(query)
				}
			})

			//console.log(arrayQuery);



			if (arrayQuery.length > 0) {
				let q = query(collection(firebasedb, "stats"), ...arrayQuery)

				const querySnapshot = await getDocs(q)


				querySnapshot.forEach(doc => {
					//console.log(doc.data());

					const d = doc.data()

					const item = allNfts.find(i => i.name === d.name)
					if (item) {
						newData.push(item)
					}
				})
			}
			else {
				newData = Object.assign([], allNfts)
			}

			oldStat.map(i => {
				if (i.stat === "spellbook") {
					//console.log(newData);
					newData = newData.filter(n => {
						return n.spellbook && n.spellbook.length === i.value
					})
				}

				if (i.stat === "level") {
					//console.log(newData);
					const rangeLevels = i.value.split(" - ")
					const minLevel = rangeLevels[0]
					const maxLevel = rangeLevels[1]

					newData = newData.filter(n => {
						return n.level >= parseInt(minLevel) && n.level <= parseInt(maxLevel)
					})
				}
			})
			*/

			newData.sort((a, b) => {
				if (parseInt(a.price) === 0) return 1;
				if (parseInt(b.price) === 0) return -1
				return a.price - b.price
			})

			//console.log(newData);

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
			<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>

				<p style={{ fontSize: 14, color: '#707070', textAlign: 'center' }}>
					{subtitle}
				</p>

				<p style={{ fontSize: 14, color: this.props.mainTextColor, textAlign: 'center' }} className="text-bold">
					{title}
				</p>
			</div>
		)
	}

	renderHeader(isMobile, boxW) {
		const { totalCountNfts, wizardsStaked, mainTextColor, isDarkmode } = this.props
		const { floor, uniqueOwners, volume, listed } = this.state

		let items = totalCountNfts || 0

		let boxStatsW = isMobile ? boxW - 40 : boxW * 50 / 100

		return (
			<div style={{ width: '100%', alignItems: 'center', marginBottom: 30, justifyContent: 'center', flexDirection: 'column', flexWrap: 'wrap' }}>

				<div style={{ alignItems: 'center', justifyContent: 'center', borderColor: '#d7d7d7', borderStyle: 'solid', borderRadius: 4, borderWidth: 1, padding: 6, marginBottom: 40 }}>

					<div style={{ justifyContent: 'center', alignItems: 'center', width: 100, height: 32, borderRadius: 4, backgroundColor: mainTextColor }}>
						<p style={{ fontSize: 15, color: isDarkmode ? 'black' : 'white' }} className="text-medium">
							Wizards
						</p>
					</div>

					<a
						href={`${window.location.protocol}//${window.location.host}/equipment`}
						style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', width: 100, height: 32, marginLeft: 15, cursor: 'pointer' }}
						onClick={(e) => {
							e.preventDefault()
							this.props.history.push(`/equipment`)
						}}
					>
						<p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
							Equipment
						</p>
					</a>

				</div>


				<div style={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'space-around', marginBottom: 10, width: boxStatsW }}>
					{this.renderBoxHeader(`${listed || 0} / ${items.toLocaleString()}`, 'Listed', isMobile)}

					{this.renderBoxHeader(`${floor || '...'} kda`, 'Floor', isMobile)}

					{this.renderBoxHeader(`${volume.toLocaleString()} kda`, 'Volume', isMobile)}

					{this.renderBoxHeader(uniqueOwners.toLocaleString(), 'Owners', isMobile)}

					{this.renderBoxHeader(`${wizardsStaked || 0}`, 'Staked', isMobile)}
				</div>

				<div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 20, justifyContent: 'center' }}>
					<a
						href={`${window.location.protocol}//${window.location.host}/sales`}
	                    style={Object.assign({}, styles.btnSales, { borderColor: isDarkmode ? 'white' : 'black' })}
	                    onClick={(e) => {
							e.preventDefault()
							this.props.history.push('/sales')
						}}
	                >
	                    <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
	                        Sales
	                    </p>
	                </a>

					<a
						href={`${window.location.protocol}//${window.location.host}/burningqueue`}
	                    style={Object.assign({}, styles.btnSales, { borderColor: isDarkmode ? 'white' : 'black' })}
						onClick={(e) => {
							e.preventDefault()
							this.props.history.push('/burningqueue')
						}}
	                >
	                    <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
	                        Burning Queue
	                    </p>
	                </a>
				</div>

				<div
					style={{ height: 1, backgroundColor: '#d7d7d7', width: '100%' }}
				/>
			</div>
		)
	}

	renderSearchBar(isMobile, boxW) {
		const { searchText } = this.state
		const { mainBackgroundColor, isDarkmode } = this.props

		let widthSearch = isMobile ? boxW - 175 : 300

		return (
			<div style={{ width: '100%', height: 60, alignItems: 'center', marginBottom: 20 }}>
				<input
					style={Object.assign({}, styles.inputSearch, { width: widthSearch, color: this.props.mainTextColor, backgroundColor: mainBackgroundColor })}
					className="text-medium"
					placeholder='Search by # or nickname'
					value={searchText}
					onChange={(e) => this.setState({ searchText: e.target.value })}
				/>

				<button
					className='btnH'
					style={{ width: 100, height: 40, backgroundColor: CTA_COLOR, borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}
					onClick={() => this.searchByName()}
				>
					<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
						Search
					</p>
				</button>

				{
					isMobile ?
					<button
						className='btnH'
						style={{ width: 40, height: 40, marginLeft: 15, backgroundColor: isDarkmode ? "white" : '#1d1d1f', borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}
						onClick={() => this.setState({ showFilters: true })}
					>
						<BiFilter
							color={isDarkmode ? "black" : 'white'}
							size={24}
						/>
					</button>
					: null
				}
			</div>
		)
	}

	renderSearched() {
		const { searchedText } = this.state
		const { mainTextColor } = this.props

		if (!searchedText) {
			return null
		}

		return (
			<div style={{ width: '100%', marginBottom: 20 }}>
				<div style={{ backgroundColor: '#e5e8eb80', justifyContent: 'center', alignItems: 'center', height: 40, paddingLeft: 15, paddingRight: 15, borderRadius: 4 }}>
					<p style={{ fontSize: 16, color: mainTextColor, marginRight: 10 }}>
						{searchedText}
					</p>

					<button
						style={{ paddingTop: 5 }}
						onClick={() => this.cancelSearch()}
					>
						<IoClose
							color={mainTextColor}
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
					this.setState({ showFilters: false })
					this.searchByStat({ stat: statName, value: item })
				}}
			>
				<p style={{ fontSize: 16, color: this.props.mainTextColor }}>
					{item}
				</p>
			</button>
		)
	}

	renderBoxSearchStat(statName, statDisplay, list) {
		const { statSearched, mainTextColor, mainBackgroundColor } = this.props

		//console.log(statSearched);

		const findItem = statSearched && statSearched.length > 0 ? statSearched.find(i => i.stat === statName) : undefined

		let text = statDisplay
		if (findItem) {
			//console.log(findItem);

			let v = findItem.value
			text = `${statDisplay} = ${v}`
		}

		return (
			<Popup
				ref={ref => this.listPopup = ref}
				trigger={
					<button style={styles.btnStat}>
						<p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">{text}</p>
						{
							findItem &&
							<IoClose
								color={mainTextColor}
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
				contentStyle={{ backgroundColor: mainBackgroundColor }}
				position="right center"
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
		const { allNftsIds, nftsBlockId, mainTextColor } = this.props
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
					<p style={{ color: mainTextColor, fontSize: 18 }} className="text-medium">
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

				<p style={{ fontSize: 23, color: this.props.mainTextColor, textAlign: 'center' }}>
					The Arena is empty...
				</p>
			</div>
		)
	}

	renderSlidePanel(boxW, widthSide) {
		const { showFilters } = this.state
		const { filtriRanges, mainTextColor, mainBackgroundColor } = this.props

		const panelWidth = "90%"

		return (
			<div style={styles.panelShadow}>

				<div
					className={showFilters ? "slide-panel-container-on" : "slide-panel-container-off"}
					style={Object.assign({}, styles.panel, { width: showFilters ? panelWidth : 0, zIndex: 997, backgroundColor: mainBackgroundColor })}
				>

					<div style={styles.headerPanel}>

						<p style={{ fontSize: 24, color: mainTextColor, marginLeft: 30 }} className="text-bold">
							Wizards Arena
						</p>

						<div style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
							<button
								onClick={() => {
									document.body.style.overflow = "auto"
									document.body.style.height = "auto"
									this.setState({ showFilters: false })
								}}
								style={{ marginRight: 30 }}
							>
								<IoClose
									color={mainTextColor}
									size={34}
								/>
							</button>
						</div>

					</div>

					{
						filtriRanges && Object.keys(filtriRanges).length > 0 &&
						<div style={{ width: widthSide, flexDirection: 'column', marginLeft: 30 }}>
							{this.renderBoxSearchStat("collection", "Collection", ["Wizards", "Clerics", "Druids"])}
							{this.renderBoxSearchStat("hp", "HP", filtriRanges["hp"])}
							{this.renderBoxSearchStat("defense", "Defense", filtriRanges["defense"])}
							{this.renderBoxSearchStat("attack", "Attack", filtriRanges["attack"])}
							{this.renderBoxSearchStat("damage", "Damage", filtriRanges["damage"])}
							{this.renderBoxSearchStat("speed", "Speed", filtriRanges["speed"])}
							{this.renderBoxSearchStat("element", "Element", ["Acid", "Dark", "Earth", "Fire", "Ice", "Psycho", "Spirit", "Sun", "Thunder", "Undead", "Water", "Wind"])}
							{this.renderBoxSearchStat("resistance", "Resistance", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
							{this.renderBoxSearchStat("weakness", "Weakness", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
							{this.renderBoxSearchStat("spellbook", "Spellbook", [1, 2, 3, 4])}
							{this.renderBoxSearchStat("level", "Level", ["122 - 150", "151 - 175", "176 - 200", "201 - 225", "226 - 250", "251 - 275", "276 - 300", "301 - 325", "326 - 350", "351 - 375"].reverse())}
						</div>
					}

				</div>
			</div>
		)
	}

	calcWidthOfNft(widthNfts) {
		let widthN = Math.floor(widthNfts / 4)

		if (widthN < 200) {
			widthN = Math.floor(widthNfts / 3)

			if (widthN < 150) {
				widthN = Math.floor(widthNfts / 2)
				return widthN
			}

			return widthN
		}
		else if (widthN > 300) {
			widthN = Math.floor(widthNfts / 5)
			return widthN
		}

		return widthN
	}

	renderBody(isMobile) {
		const { allNfts, allNftsIds, statSearched, filtriRanges, mainTextColor } = this.props
		const { loading, nftsToShow, searchedText } = this.state

		//console.log(allNftsIds)
		const { boxW, padding } = getBoxWidth(isMobile)

		const widthSide = 180
		const widthNfts = isMobile ? boxW : boxW - widthSide

		let nftWidth = this.calcWidthOfNft(widthNfts) - 30;
		let nInRow = Math.floor(widthNfts / nftWidth)

		let rows = this.buildsRow(nftsToShow, nInRow)

		//console.log(rows);

		let numberOfWiz = allNfts ? allNfts.length : 0;
		if (searchedText.length > 0) {
			numberOfWiz = nftsToShow.length
		}
		else if (statSearched && statSearched.length > 0) {
			numberOfWiz = nftsToShow.length
		}

		let showPageCounter = false
		if (allNftsIds && allNfts && allNfts.length > 0 && nftsToShow.length > 0 && !searchedText) {
			showPageCounter = true
		}

		if (statSearched && statSearched.length > 0) {
			showPageCounter = false
		}

		return (
			<div style={{ flexDirection: 'column', width: boxW, paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

				{this.renderHeader(isMobile, boxW)}

				{this.renderSearchBar(isMobile, boxW)}

				{this.renderSearched()}

				<p style={{ marginBottom: 15, fontSize: 14, color: mainTextColor }}>
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
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

				<div style={{ width: boxW }}>
					{
						filtriRanges && Object.keys(filtriRanges).length > 0 && !isMobile &&
						<div style={{ width: widthSide, flexDirection: 'column' }}>
							{this.renderBoxSearchStat("collection", "Collection", ["Wizards", "Clerics", "Druids"])}
							{this.renderBoxSearchStat("hp", "HP", filtriRanges["hp"])}
							{this.renderBoxSearchStat("defense", "Defense", filtriRanges["defense"])}
							{this.renderBoxSearchStat("attack", "Attack", filtriRanges["attack"])}
							{this.renderBoxSearchStat("damage", "Damage", filtriRanges["damage"])}
							{this.renderBoxSearchStat("speed", "Speed", filtriRanges["speed"])}
							{this.renderBoxSearchStat("element", "Element", ["Acid", "Dark", "Earth", "Fire", "Ice", "Psycho", "Spirit", "Sun", "Thunder", "Undead", "Water", "Wind"])}
							{this.renderBoxSearchStat("resistance", "Resistance", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
							{this.renderBoxSearchStat("weakness", "Weakness", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
							{this.renderBoxSearchStat("spellbook", "Spellbook", [1, 2, 3, 4])}
							{this.renderBoxSearchStat("level", "Level", ["122 - 150", "151 - 175", "176 - 200", "201 - 225", "226 - 250", "251 - 275", "276 - 300", "301 - 325", "326 - 350", "351 - 375"].reverse())}
						</div>
					}

					{
						nftsToShow.length > 0 ?
						<div style={{ flexWrap: 'wrap', width: widthNfts }}>
							{rows.map((itemsPerRow, index) => {
								return this.renderRow(itemsPerRow, index, nInRow, widthNfts);
							})}
						</div>
						:
						<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
							<img
								src={getImageUrl(undefined)}
								style={{ width: 280, height: 280, borderRadius: 2 }}
								alt='Placeholder'
							/>
						</div>
					}
				</div>


				{
					showPageCounter ?
					this.renderPageCounter()
					: null
				}

				{
					isMobile &&
					<div
						className={this.state.showFilters ? "bg-slide-on" : "bg-slide-off"}
						onClick={() => {
							document.body.style.overflow = "auto"
							document.body.style.height = "auto"
							this.setState({ showFilters: false })
						}}
						style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', width: this.state.showFilters ? window.innerWidth : 0 }}
					/>
				}

				{
					isMobile &&
					this.renderSlidePanel(boxW, widthSide)
				}
			</div>
		)
	}

	renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
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
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
				<Media
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
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
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
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
		borderRadius: 4,
		borderColor: '#d7d7d7',
		borderWidth: 1,
		borderStyle: 'solid',
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 6,
		paddingBottom: 6
	},
	inputSearch: {
		height: 36,
		marginRight: 15,
		borderRadius: 4,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderWidth: 1,
		fontSize: 15,
		paddingLeft: 10,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		outline: 'none'
	},
	btnStat: {
		padding: 9,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		marginRight: 15,
		borderRadius: 4,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderWidth: 1,
		minWidth: 60,
		display: 'flex',
		flexDirection: 'row'
	},
	btnSales: {
		width: 130,
		height: 32,
		marginRight: 10,
		marginBottom: 5,
		borderWidth: 1,
		borderStyle: 'solid',
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
		display: 'flex'
	},
	panelShadow: {
		justifyContent: 'flex-end',
		position: 'absolute',
	},
	panel: {
		flexDirection: 'column',
		overflow: 'auto',
	},
	headerPanel: {
		height: 90,
		width: '100%',
		paddingTop: 10,
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 30
	},
}

const mapStateToProps = (state) => {
	const { allNfts, account, chainId, gasPrice, gasLimit, networkUrl, allNftsIds, nftsBlockId, totalCountNfts, statSearched, wizardsStaked, filtriRanges, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { allNfts, account, chainId, gasPrice, gasLimit, networkUrl, allNftsIds, nftsBlockId, totalCountNfts, statSearched, wizardsStaked, filtriRanges, mainTextColor, mainBackgroundColor, isDarkmode };
}

export default connect(mapStateToProps, {
	loadAllNftsIds,
	getVolume,
	getPageBlockNfts,
	setNetworkSettings,
	setNetworkUrl,
	storeFiltersStats,
	getWizardsStakedCount
})(Collection)
