import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import { AiOutlinePlus } from 'react-icons/ai'
import { AiOutlineMinus } from 'react-icons/ai'
import { IoClose } from 'react-icons/io5'
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import EquipmentCard from './common/EquipmentCard'
import ModalTransaction from './common/ModalTransaction'
import ModalOpenItemsMinted from './common/ModalOpenItemsMinted'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import getBoxWidth from './common/GetBoxW'
import { MAIN_NET_ID, ITEMS_PER_BLOCK, TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR, RING_MINT_PRICE } from '../actions/types'
import {
    setNetworkSettings,
	setNetworkUrl,
    clearTransaction,
    loadAllItemsIds,
    getPageBlockItems,
    getEquipmentVolume,
    mintEquipment,
    storeFiltersStatsEquip
} from '../actions'
import '../css/Shop.css'

const chest_img = require('../assets/chest.png')
const ring_placeholder = require('../assets/ring_placeholder.png')


class Equipment extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            volume: 0,
            itemsToShow: [],
			floor: 0,
			uniqueOwners: 1,
            equipped: 0,
			searchText: '',
			searchedText: '',
            numberOfChest: 1,
            showModalOpenChests: false,
            typeModal: "",
            showModalConnection: false
        }
    }

    componentDidMount() {
		document.title = "Equipment - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
			this.loadAll()
			this.getMarketVolume()
		}, 500)

	}

    loadAll() {
        const { chainId, gasPrice, gasLimit, networkUrl, statSearchedEquipment, allItems } = this.props

        //è inutile refetchare di nuovo tutto, se ci sono le stat cercate significa che
		//gli nft sono stati già caricati
		if (statSearchedEquipment && statSearchedEquipment.length > 0) {
			//this.searchByStat()
		}
		else {
			if (allItems) {
				this.loadBlock(this.props.itemsBlockId || 0)
			}

			this.props.loadAllItemsIds(chainId, gasPrice, gasLimit, networkUrl, (res) => {

				this.getFloor(res)
				this.getUniqueOwners(res)
                this.getEquipped(res)

				this.props.getPageBlockItems(res, this.props.itemsBlockId || 0, (itemsToShow) => {
					//console.log("loadAllNftsIds completed");
                    //console.log(itemsToShow);
					this.setState({ loading: false, itemsToShow })

				})

			})
		}
    }

    getMarketVolume() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getEquipmentVolume(chainId, gasPrice, gasLimit, networkUrl, (res) => {
			this.setState({ volume: res })
		})
	}

    getFloor(allItems) {
		if (!allItems) {
			return
		}

		//console.log(allNfts)

		let lowPrice;

		for (let i = 0; i < allItems.length; i++) {
			const n = allItems[i]

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

    getUniqueOwners(allItems) {
		if (!allItems) {
			return
		}

		let owners = []

		for (let i = 0; i < allItems.length; i++) {
			let o = allItems[i].owner

		 	if (!owners.includes(o)) {
		 		owners.push(o)
		 	}
		}

		this.setState({ uniqueOwners: owners.length })
	}

    getEquipped(allItems) {
        if (!allItems) {
            return
        }

        let equipped = 0

		for (let i = 0; i < allItems.length; i++) {
			let ring = allItems[i]

		 	if (ring.equipped) {
                 equipped += 1
             }
		}

        //console.log(equipped);
        this.setState({ equipped })
    }

    buyChest() {
        const { account, chainId, gasPrice, netId } = this.props
        const { numberOfChest } = this.state

        this.setState({ typeModal: 'buychest' })

        this.props.mintEquipment(chainId, gasPrice, netId, numberOfChest, account)
    }

    renderPageCounter() {
		const { allItemsIds, itemsBlockId } = this.props
		//console.log("allNftsIds", allNftsIds, nftsBlockId)

		let subarray = []

		//creiamo una lista di idx partendo dal corrente e togliendo e aggiungendo 5
		//se l'id che esce è minore di 0, lo ignoriamo
		let indexes = []
		for (let i = -5; i < 5; i++) {
			let idx = itemsBlockId + i
			if (idx >= 0) {
				indexes.push(idx)
			}
		}

		//console.log("indexes", indexes)

		let blocks = allItemsIds.reduce((rows, item, index) => {
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

			let btnStyle = item === itemsBlockId ? styles.btnPageSelectedStyle : styles.btnPageStyle

			rows.push(
				<button
					style={btnStyle}
					key={item}
					onClick={() => {
						if (item !== itemsBlockId && !this.state.loading) {
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

    searchByName() {
		const { allItems } = this.props
		const { searchText } = this.state

        if (!searchText) {
            return
        }

		const result = allItems.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase()))

		this.props.storeFiltersStatsEquip([])
		this.setState({ loading: false, itemsToShow: result, searchedText: searchText })
	}

	cancelSearch() {
		const { itemsBlockId } = this.props

		this.setState({ searchedText: '', searchText: '' })
		this.loadBlock(itemsBlockId)
	}

    loadBlock(id) {
		const { allItems } = this.props
		//console.log(allNfts)
		this.props.getPageBlockItems(allItems, id, (itemsToShow) => {
			this.setState({ itemsToShow, loading: false })
			window.scrollTo({ top: 0, behavior: 'smooth' });
		})
	}

    renderBoxHeader(title, subtitle, isMobile) {
		return (
			<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: 30, marginBottom: 4 }}>
				<p style={{ fontSize: isMobile ? 17 : 20, color: 'white', textAlign: 'center' }}>
					{title}
				</p>

				<p style={{ fontSize: isMobile ? 16 : 18, color: '#c2c0c0', textAlign: 'center' }}>
					{subtitle}
				</p>
			</div>
		)
	}

    renderChestCard(isMobile) {
        const { numberOfChest } = this.state
        const { account } = this.props

        return (
            <div
                className="cardShopShadow"
                style={isMobile ? styles.cardShopStyleMobile : styles.cardShopStyle}
            >
                <div style={{ width: 90, height: 90, alignItems: 'center', justifyContent: 'center', marginLeft: isMobile ? 0 : 15 }}>
                    <img
                        src={chest_img}
                        style={{ width: 90 }}
                        alt="chest"
                    />
                </div>

                <div style={{ justifyContent: 'space-between', marginBottom: isMobile ? 15 : 0 }}>

                    <button
                        style={{ cursor: 'pointer', justifyContent: 'center', alignItems: 'center', width: 45 }}
                        onClick={() => {
                            if (this.state.numberOfChest === 1) {
                                return
                            }

                            this.setState({ numberOfChest: this.state.numberOfChest - 1 })
                        }}
                    >
                        <AiOutlineMinus
                            color="white"
                            size={22}
                        />
                    </button>


                    <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 75 }}>
                        <p style={{ fontSize: 22, color: 'white' }}>
                            {numberOfChest}
                        </p>

                        <p style={{ fontSize: 20, color: 'white' }}>
                            {numberOfChest > 1 ? 'CHESTS' : 'CHEST'}
                        </p>
                    </div>

                    <button
                        style={{ marginRight: isMobile ? 0 : 15, cursor: 'pointer', justifyContent: 'center', alignItems: 'center', width: 45 }}
                        onClick={() => {
                            if (this.state.numberOfChest === 10) {
                                return
                            }

                            this.setState({ numberOfChest: this.state.numberOfChest + 1 })
                        }}
                    >
                        <AiOutlinePlus
                            color="white"
                            size={22}
                        />
                    </button>
                </div>

                <div style={{ alignItems: 'center', marginBottom: isMobile ? 15 : 0 }}>
                    <p style={{ fontSize: 17, color: 'white', marginRight: 10 }}>
                        KDA
                    </p>
                    <p style={{ fontSize: 21, color: 'white', width: 25, marginRight: isMobile ? 0 : 20 }}>
                        {numberOfChest * RING_MINT_PRICE}
                    </p>
                </div>

                {
                    account && account.account ?
                    <button
                        className='btnH'
                        style={Object.assign({}, styles.btnChoose, { marginRight: isMobile ? 0 : 15 })}
                        onClick={() => {
                            this.buyChest()
                            //this.setState({ showModalOpenChests: true })
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            BUY
                        </p>
                    </button>
                    :
                    <button
                        className='btnH'
                        style={Object.assign({}, styles.btnChoose, { marginRight: isMobile ? 0 : 15, width: 130 })}
                        onClick={() => {
                            this.setState({ showModalConnection: true })
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            CONNECT WALLET
                        </p>
                    </button>
                }

            </div>
        )
    }

    renderHeader(isMobile) {
		const { totalCountItems } = this.props
		const { floor, uniqueOwners, volume, equipped } = this.state

		let items = totalCountItems || 0

		return (
			<div style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start', marginTop: 35, marginBottom: 20, flexWrap: 'wrap' }}>

                <div style={{ flexWrap: 'wrap', flexDirection: 'column' }}>

                    <p style={{ fontSize: 24, color: 'white', marginBottom: 25 }}>
                        Buy a mystery chest
                    </p>

                    {this.renderChestCard(isMobile)}

                    <p style={{ fontSize: 22, color: 'white', marginBottom: 40, marginTop: 20 }}>
                        ...or buy a ring directly from the marketplace
                    </p>

                </div>

				<div style={{ flexWrap: 'wrap', alignItems: 'center' }}>
					{this.renderBoxHeader(items.toLocaleString(), 'items', isMobile)}

					{this.renderBoxHeader(uniqueOwners.toLocaleString(), 'owners', isMobile)}

					{this.renderBoxHeader(`${floor || '...'} WIZA`, 'floor price', isMobile)}

					{this.renderBoxHeader(`${volume.toLocaleString()} WIZA`, 'total volume', isMobile)}

					{this.renderBoxHeader(`${equipped || 0}`, 'equipped', isMobile)}
				</div>
			</div>
		)
	}

    renderSearchBar() {
		const { searchText } = this.state

		return (
			<div style={{ width: '100%', height: 60, alignItems: 'center', marginBottom: 20 }}>
				<input
					style={styles.inputSearch}
					placeholder='Search by name'
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

    renderItem(item, index) {
        return (
            <EquipmentCard
                key={index}
                item={item}
                index={index}
                history={this.props.history}
            />
        )
    }

    renderError() {
		return (
			<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
				<img
					src={ring_placeholder}
					style={{ width: 200, height: 200, marginBottom: 30 }}
					alt='Placeholder'
				/>

				<p style={{ fontSize: 23, color: 'white', textAlign: 'center' }}>
					The marketplace is empty...
				</p>
			</div>
		)
	}

    renderBody(isMobile) {
        const { allItems, allItemsIds, showModalTx } = this.props
		const { loading, itemsToShow, searchedText, numberOfChest, showModalConnection } = this.state

        const { boxW, modalW } = getBoxWidth(isMobile)

        let showPageCounter = false
		if (allItemsIds && allItems && allItems.length > 0 && itemsToShow.length > 0) {
			showPageCounter = true
		}

        /*
		if (statSearchedEquipment && statSearchedEquipment.length > 0) {
			showPageCounter = false
		}
        */

        return (
            <div style={{ flexDirection: 'column', width: boxW }}>
                {this.renderHeader(isMobile)}

                {this.renderSearchBar()}

				{this.renderSearched()}

                {
					allItems && allItems.length === 0 ?
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
					itemsToShow.length > 0 ?
                    <div style={{ flexWrap: 'wrap' }}>
    					{itemsToShow.map((item, index) => {
    						return this.renderItem(item, index);
    					})}
                    </div>
					:
                    null
				}

                {
					showPageCounter ?
					this.renderPageCounter()
					: null
				}

                <ModalTransaction
					showModal={showModalTx}
					width={modalW}
					type={this.state.typeModal}
					mintSuccess={() => {
						this.props.clearTransaction()
						//window.location.reload()
                        if (this.state.typeModal === "buychest") {
                            setTimeout(() => {
                                this.setState({ showModalOpenChests: true })
                            }, 300)
                        }
					}}
					mintFail={() => {
						this.props.clearTransaction()
						window.location.reload()
					}}
                    numberOfChest={this.state.numberOfChest}
				/>

                {
                    this.state.showModalOpenChests &&
                    <ModalOpenItemsMinted
                        showModal={this.state.showModalOpenChests}
                        onCloseModal={() => {
                             this.setState({ showModalOpenChests: false })
                             window.location.reload()
                        }}
                        history={this.props.history}
                        amountMinted={numberOfChest}
                    />
                }

                <ModalConnectionWidget
					width={modalW}
					showModal={showModalConnection}
					onCloseModal={() => this.setState({ showModalConnection: false })}
				/>

            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='home'
					section={8}
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
    cardShopStyle: {
        borderRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 35,
        backgroundColor: "#3729af"
    },
    cardShopStyleMobile: {
        borderRadius: 2,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 35,
        backgroundColor: "#3729af",
        width: 'fit-content',
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 15,
    },
    btnChoose: {
        height: 45,
        width: 100,
        minWidth: 100,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
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
}

const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, netId, networkUrl, showModalTx } = state.mainReducer;
    const { statSearchedEquipment, allItems, allItemsIds, totalCountItems, itemsBlockId } = state.equipmentReducer

	return { account, chainId, gasPrice, gasLimit, netId, networkUrl, showModalTx, statSearchedEquipment, allItems, allItemsIds, totalCountItems, itemsBlockId };
}

export default connect(mapStateToProps, {
    clearTransaction,
    setNetworkSettings,
	setNetworkUrl,
    loadAllItemsIds,
    getPageBlockItems,
    getEquipmentVolume,
    mintEquipment,
    storeFiltersStatsEquip
})(Equipment)
