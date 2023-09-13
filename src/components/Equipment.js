import React, { Component } from 'react'
import { connect } from 'react-redux'
import { round } from 'lodash'
import Media from 'react-media';
import { getDoc, doc } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDoubleLeft, AiOutlineDoubleRight } from 'react-icons/ai'
import { IoClose } from 'react-icons/io5'
import { BiFilter } from 'react-icons/bi'
import Popup from 'reactjs-popup';
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import EquipmentCard from './common/EquipmentCard'
import ModalOpenItemsMinted from './common/ModalOpenItemsMinted'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import getBoxWidth from './common/GetBoxW'
import { MAIN_NET_ID, ITEMS_PER_BLOCK, TEXT_SECONDARY_COLOR, CTA_COLOR } from '../actions/types'
import {
    setNetworkSettings,
	setNetworkUrl,
    clearTransaction,
    loadAllItemsIds,
    getPageBlockItems,
    getEquipmentVolume,
    mintEquipment,
    storeFiltersStatsEquip,
    updateInfoTransactionModal,
    getWizaValue,
    getEquipmentMintPhase,
    getEquipmentMintPrice,
    getMaxMintable,
    getAmountMinted
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
            showModalConnection: false,
            mintStart: false,
            mintPrice: 0,
            maxMintable: 0,
            minted: 0,
            listed: 0
        }
    }

    componentDidMount() {
		document.title = "Equipment - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
			this.loadAll()
			this.getMarketVolume()
            this.getInfoMint()
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

                //console.log(this.props.allItems)

				this.getFloor(res)
				this.getUniqueOwners(res)
                this.getEquipped(res)

				this.props.getPageBlockItems(res, this.props.itemsBlockId || 0, (itemsToShow) => {
					//console.log("loadAllNftsIds completed");
                    //console.log(itemsToShow);

                    const listed = this.props.allItems.filter(i => i.listed)
                    //console.log(listed);

					this.setState({ loading: false, itemsToShow, listed: listed.length })

				})

			})
		}
    }

    getInfoMint() {
		const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

        this.props.getEquipmentMintPhase(chainId, gasPrice, gasLimit, networkUrl, (res) => {
			//console.log(res);
            if (res === "1") {
                this.setState({ mintStart: true })
            }
		})

        this.props.getEquipmentMintPrice(chainId, gasPrice, gasLimit, networkUrl, (res) => {
		    //console.log(res);
            this.setState({ mintPrice: res })
		})

        if (account && account.account) {
            this.props.getMaxMintable(chainId, gasPrice, gasLimit, networkUrl, account.account, (res) => {
    			//console.log(res);
                if (!res.status) {
                    this.setState({ maxMintable: res })
                }
    		})

            this.props.getAmountMinted(chainId, gasPrice, gasLimit, networkUrl, account.account, (res) => {
    			//console.log(res);
                this.setState({ minted: res })
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
			let item = allItems[i]

		 	if (item.equipped) {
                 equipped += 1
             }
		}

        //console.log(equipped);
        this.setState({ equipped })
    }

    buyChest() {
        const { account, chainId, gasPrice, netId } = this.props
        const { numberOfChest, mintPrice } = this.state

        const wizaPrice = numberOfChest * mintPrice * 20

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will buy ${numberOfChest} ${numberOfChest > 1 ? "chests" : "chest"} for ${numberOfChest*mintPrice} $KDA and ${wizaPrice} $WIZA`,
			typeModal: 'buychest',
			transactionOkText: `${numberOfChest} ${numberOfChest > 1 ? 'chests' : 'chest'} successfully bought!`,
		})

        this.props.mintEquipment(chainId, gasPrice, netId, numberOfChest, account, mintPrice)
    }

    renderPageCounter() {
		const { allItems, itemsBlockId } = this.props
		//console.log(itemsBlockId)

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

		let blocks = allItems.reduce((rows, item, index) => {
			//console.log(index);
			//se array row è piena, aggiungiamo una nuova row = [] alla lista
			if (index % ITEMS_PER_BLOCK === 0 && index > 0) {
				rows.push([]);
			}

			//prendiamo l'ultima array della lista e aggiungiamo item
			rows[rows.length - 1].push(item);
			return rows;
		}, [[]]);

        //console.log(blocks, itemsBlockId);

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

        if (!subarray.includes(0)) {
            rows.splice(
                0,
                0,
                <button
                    style={styles.btnPageStyle}
                    key={0}
                    onClick={() => {
                        if (!this.state.loading) {
                            this.loadBlock(0)
                        }
                    }}
                >
                    <AiOutlineDoubleLeft
                        size={22}
                        color={TEXT_SECONDARY_COLOR}
                    />
                </button>
            )
        }

        let lastBlock = blocks.length - 1

        if (!subarray.includes(lastBlock)) {
            rows.push(
                <button
                    style={styles.btnPageStyle}
                    key={lastBlock}
                    onClick={() => {
                        if (!this.state.loading) {
                            this.loadBlock(lastBlock)
                        }
                    }}
                >
                    <AiOutlineDoubleRight
                        size={22}
                        color={TEXT_SECONDARY_COLOR}
                    />
                </button>
            )
        }


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

		let result = allItems.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase()))

        //se nel nome non c'è sto cercando per id
        if (result.length === 0) {
            result = allItems.filter(i => i.id === searchText)
        }

        //se anche nell'id non c'è allora cerchiamo per wallet
        if (result.length === 0) {
            result = allItems.filter(i => i.owner === searchText)
        }

		//this.props.storeFiltersStatsEquip(undefined)
        this.loadBlock(0)
		this.setState({ loading: false, itemsToShow: result, searchedText: searchText })
	}

    searchByList(statDisplay) {
		const { allItems } = this.props
		const { searchText } = this.state

        if (!searchText) {
            return
        }

        let result = []
        if (statDisplay === "Type") {
            result = allItems.filter(i => i.type.toLowerCase() === searchText.toLowerCase())
        }
        else {
            result = allItems.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase()))
        }

        if (result.length === 0) {
            result = allItems.filter(i => i.id === searchText)
        }

		//this.props.storeFiltersStatsEquip(undefined)
        this.loadBlock(0)
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

    renderChestCard(isMobile) {
        const { numberOfChest, mintStart, mintPrice, maxMintable, minted } = this.state
        const { account, mainTextColor } = this.props

        const leftToMint = maxMintable - minted

        return (
            <div
                className="cardShopShadow"
                style={isMobile ? styles.cardShopStyleMobile : styles.cardShopStyle}
            >
                <div style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginLeft: isMobile ? 0 : 15 }}>
                    <img
                        src={chest_img}
                        style={{ width: 80 }}
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
                            color={mainTextColor}
                            size={22}
                        />
                    </button>


                    <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 75 }}>
                        <p style={{ fontSize: 19, color: mainTextColor }}>
                            {numberOfChest}
                        </p>

                        <p style={{ fontSize: 17, color: mainTextColor }}>
                            {numberOfChest > 1 ? 'Chests' : 'Chest'}
                        </p>
                    </div>

                    <button
                        style={{ marginRight: isMobile ? 0 : 15, cursor: 'pointer', justifyContent: 'center', alignItems: 'center', width: 45 }}
                        onClick={() => {
                            if (this.state.numberOfChest >= leftToMint) {
                                return
                            }

                            this.setState({ numberOfChest: this.state.numberOfChest + 1 })
                        }}
                    >
                        <AiOutlinePlus
                            color={mainTextColor}
                            size={22}
                        />
                    </button>
                </div>

                <div style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>

                    <div style={{ alignItems: 'center', marginBottom: isMobile ? 15 : 0 }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginRight: 10, width: 47 }}>
                            $KDA
                        </p>
                        <p style={{ fontSize: 15, color: mainTextColor, width: 25, marginRight: isMobile ? 0 : 20 }}>
                            {numberOfChest * mintPrice}
                        </p>
                    </div>

                    <div style={{ alignItems: 'center', marginBottom: isMobile ? 15 : 0 }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginRight: 10, width: 47 }}>
                            $WIZA
                        </p>
                        <p style={{ fontSize: 15, color: mainTextColor, width: 25, marginRight: isMobile ? 0 : 20 }}>
                            {(numberOfChest * mintPrice * 20)}
                        </p>
                    </div>
                </div>

                {
                    !account &&
                    <button
                        className='btnH'
                        style={Object.assign({}, styles.btnChoose, { marginRight: isMobile ? 0 : 15, width: 130 })}
                        onClick={() => {
                            this.setState({ showModalConnection: true })
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }}>
                            Connect wallet
                        </p>
                    </button>
                }

                {
                    account && account.account && mintStart && leftToMint > 0 &&
                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: isMobile ? 0 : 15 }}>
                        <button
                            className='btnH'
                            style={styles.btnChoose}
                            onClick={() => {
                                this.buyChest()
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }}>
                                Buy
                            </p>
                        </button>

                        <p style={{ color: mainTextColor, marginTop: 4, fontSize: 14, textAlign: 'center' }}>
                            You can mint up to {leftToMint}
                        </p>
                    </div>
                }

                {
                    account && account.account && mintStart && leftToMint === 0 &&
                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: isMobile ? 0 : 15 }}>
                        <div
                            style={Object.assign({}, styles.btnChoose, { backgroundColor: "transparent" })}
                        >
                            <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }}>
                                You have no chests left to mint
                            </p>
                        </div>
                    </div>
                }

                {
                    account && account.account && !mintStart &&
                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: isMobile ? 0 : 15 }}>
                        <div
                            className='btnH'
                            style={styles.btnChoose}
                        >
                            <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }}>
                                Mint not started
                            </p>
                        </div>

                        <p style={{ color: mainTextColor, marginTop: 4, fontSize: 14, textAlign: 'center' }}>
                            You can mint up to {leftToMint}
                        </p>
                    </div>
                }

            </div>
        )
    }

    renderProgress() {
        const { totalMintedItems } = this.props

		let items = totalMintedItems || 0

        let maxItems = 5254

        let pctMinted = items * 100 / maxItems

        return (
            <div style={{ position: 'relative', width: '100%', height: 16, borderRadius: 4, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', overflow: 'hidden', alignItems: 'center', marginBottom: 30 }}>
                <div
                    style={{ backgroundColor: CTA_COLOR, height: 16, width: `${pctMinted}%` }}
                />

                <p style={{ position: 'absolute', right: 6, color: 'white', fontSize: 13 }}>
                    {items}/{maxItems}
                </p>
            </div>
        )
    }

    renderHeader(isMobile, boxW) {
		const { totalCountItems, mainTextColor, isDarkmode, allItems } = this.props
		const { floor, uniqueOwners, volume, equipped, listed } = this.state

		let items = totalCountItems || 0

        let boxStatsW = isMobile ? boxW - 40 : boxW * 50 / 100

		return (
			<div style={{ width: '100%', alignItems: 'center', marginBottom: 30, justifyContent: 'center', flexDirection: 'column', flexWrap: 'wrap' }}>

                <div style={{ alignItems: 'center', justifyContent: 'center', borderColor: '#d7d7d7', borderStyle: 'solid', borderRadius: 4, borderWidth: 1, padding: 6, marginBottom: 40 }}>

					<a
						href={`${window.location.protocol}//${window.location.host}/collection`}
						style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', width: 100, height: 32, marginRight: 15, cursor: 'pointer' }}
						onClick={(e) => {
							e.preventDefault()
							this.props.history.push(`/collection`)
						}}
					>
						<p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
							Wizards
						</p>
					</a>

                    <div style={{ justifyContent: 'center', alignItems: 'center', width: 100, height: 32, borderRadius: 4, backgroundColor: mainTextColor }}>
						<p style={{ fontSize: 15, color: isDarkmode ? 'black' : 'white' }} className="text-medium">
							Equipment
						</p>
					</div>

				</div>

                <div style={{ flexWrap: 'wrap', flexDirection: 'column', alignItems: 'center' }}>

                    <p style={{ fontSize: 20, color: mainTextColor, marginBottom: 12 }}>
                        Buy a mystery chest
                    </p>

                    <div style={{ flexDirection: 'column' }}>
                        {this.renderChestCard(isMobile)}

                        {this.renderProgress()}
                    </div>

                </div>

                <div style={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'space-around', marginBottom: 10, width: boxStatsW }}>
                    {this.renderBoxHeader(`${listed}/${items.toLocaleString()}`, 'Listed', isMobile)}

                    {this.renderBoxHeader(`${floor || '...'} WIZA`, 'Floor', isMobile)}

                    {this.renderBoxHeader(`${volume.toLocaleString()} WIZA`, 'Volume', isMobile)}

                    {this.renderBoxHeader(uniqueOwners.toLocaleString(), 'Owners', isMobile)}

                    {this.renderBoxHeader(`${equipped || 0}`, 'Equipped', isMobile)}
                </div>

                <div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 20, justifyContent: 'center' }}>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/forge`}
                        style={Object.assign({}, styles.btnSales, { borderColor: isDarkmode ? 'white' : 'black', marginRight: 10 })}
                        onClick={(e) => {
                            e.preventDefault()
                            this.props.history.push('/forge')
                        }}
                    >
                        <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
                            Forge
                        </p>
                    </a>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/equipmentoffers`}
                        style={Object.assign({}, styles.btnSales, { borderColor: isDarkmode ? 'white' : 'black', marginRight: 10 })}
                        onClick={(e) => {
                            e.preventDefault()
                            this.props.history.push('/equipmentoffers')
                        }}
                    >
                        <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
                            Offers
                        </p>
                    </a>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/salesequipment`}
                        style={Object.assign({}, styles.btnSales, { borderColor: isDarkmode ? 'white' : 'black' })}
                        onClick={(e) => {
                            e.preventDefault()
                            this.props.history.push('/salesequipment')
                        }}
                    >
                        <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
                            Sales
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
					placeholder='Search by name, id or wallet'
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

		if (!searchedText) {
			return null
		}

		return (
			<div style={{ width: '100%', marginBottom: 20 }}>
				<div style={{ backgroundColor: '#e5e8eb80', justifyContent: 'center', alignItems: 'center', height: 40, paddingLeft: 15, paddingRight: 15, borderRadius: 4 }}>
					<p style={{ fontSize: 16, color: this.props.mainTextColor, marginRight: 10 }}>
						{searchedText}
					</p>

					<button
						style={{ paddingTop: 5 }}
						onClick={() => this.cancelSearch()}
					>
						<IoClose
							color={this.props.mainTextColor}
							size={22}
						/>
					</button>
				</div>
			</div>
		)
	}

    renderItem(item, index, nftWidth) {
        return (
            <EquipmentCard
                key={index}
                item={item}
                index={index}
                history={this.props.history}
                nftWidth={nftWidth}
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

				<p style={{ fontSize: 23, color: this.props.mainTextColor, textAlign: 'center' }}>
					The marketplace is empty...
				</p>
			</div>
		)
	}

    renderListStat(item, index, statDisplay) {
		return (
			<button
				key={index}
				style={{ marginBottom: 15, marginLeft: 10 }}
				onClick={() => {
					this.listPopup.close()
                    this.setState({ searchText: item, showFilters: false }, () => {
                        this.searchByList(statDisplay)
                    })
				}}
			>
				<p style={{ fontSize: 16, color: this.props.mainTextColor }}>
					{item}
				</p>
			</button>
		)
	}

    renderBoxFilters(width, isMobile) {
        return (
            <div style={{ width, flexDirection: 'column', marginLeft: isMobile ? 30 : 0 }}>
                {this.renderBoxSearchStat("Type", ["Ring", "Pendant"])}
                {this.renderBoxSearchStat("HP", ["Ring of HP +4", "Ring of HP +8", "Ring of HP +12", "Ring of HP +16", "Ring of HP +20", "Ring of Life", "Ring of Last Defense", "Ring of Power"].reverse())}
                {this.renderBoxSearchStat("Defense", ["Ring of Defense +1", "Ring of Defense +2", "Ring of Defense +3", "Ring of Defense +4", "Ring of Defense +5", "Ring of Magic Shield", "Ring of Last Defense", "Ring of Power"].reverse())}
                {this.renderBoxSearchStat("Attack", ["Ring of Attack +1", "Ring of Attack +2", "Ring of Attack +3", "Ring of Attack +4", "Ring of Attack +5", "Ring of Accuracy", "Ring of Destruction", "Ring of Swift Death", "Ring of Power"].reverse())}
                {this.renderBoxSearchStat("Damage", ["Ring of Damage +2", "Ring of Damage +4", "Ring of Damage +6", "Ring of Damage +8", "Ring of Damage +10", "Ring of Force", "Ring of Destruction", "Ring of Power"].reverse())}
                {this.renderBoxSearchStat("Speed", ["Ring of Speed +2", "Ring of Speed +4", "Ring of Speed +6", "Ring of Speed +8", "Ring of Speed +10", "Ring of Lightning", "Ring of Swift Death", "Ring of Power"].reverse())}
                {this.renderBoxSearchStat("Element resistance", ["Acid Resistance", "Dark Resistance", "Earth Resistance","Fire Resistance", "Ice Resistance", "Psycho Resistance", "Spirit Resistance", "Sun Resistance", "Thunder Resistance", "Undead Resistance", "Water Resistance", "Wind Resistance"])}
                {this.renderBoxSearchStat("Perk resistance", ["Blind Resistance", "Confuse Resistance", "Fear 2 Resistance", "Freeze Resistance", "Paralyze 2 Resistance", "Poison 3 Resistance", "Shock Resistance"])}
            </div>
        )
    }

    renderBoxSearchStat(statDisplay, list) {

		return (
			<Popup
				ref={ref => this.listPopup = ref}
				trigger={
					<button style={styles.btnStat}>
						<p style={{ fontSize: 15, color: this.props.mainTextColor }} className="text-medium">{statDisplay}</p>
					</button>
				}
                contentStyle={{ backgroundColor: this.props.mainBackgroundColor }}
				position="right center"
				on="click"
				closeOnDocumentClick
				arrow={true}
			>
				<div style={{ flexDirection: 'column', paddingTop: 10 }}>
					{list.map((item, index) => {
						return this.renderListStat(item, index, statDisplay)
					})}
				</div>
			</Popup>
		)
	}

    renderSlidePanel(boxW, widthSide) {
		const { showFilters } = this.state
		const { mainTextColor, mainBackgroundColor } = this.props

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

                    {this.renderBoxFilters(widthSide, true)}

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
        const { allItems, allItemsIds, mainTextColor } = this.props
		const { loading, itemsToShow, searchedText, showModalConnection } = this.state

        const { boxW, modalW, padding } = getBoxWidth(isMobile)

        const widthSide = 180
		const widthNfts = isMobile ? boxW : boxW - widthSide
        let nftWidth = this.calcWidthOfNft(widthNfts) - 36;

        let showPageCounter = false
		if (allItemsIds && allItems && allItems.length > 0 && itemsToShow && itemsToShow.length > 0 && !searchedText) {
			showPageCounter = true
		}

        let numberOfItems = allItems && allItems.length
        if (searchedText && searchedText.length > 0) {
            numberOfItems = itemsToShow.length
        }

        return (
            <div style={{ flexDirection: 'column', width: boxW, paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                {this.renderHeader(isMobile, boxW)}

                {this.renderSearchBar(isMobile, boxW)}

				{this.renderSearched()}

                <p style={{ marginBottom: 15, fontSize: 14, color: mainTextColor }}>
					{numberOfItems} items
				</p>

                {
					allItems && allItems.length === 0 ?
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
                        !isMobile &&
                        this.renderBoxFilters(widthSide, isMobile)
                    }

                    {
    					itemsToShow && itemsToShow.length > 0 ?
                        <div style={{ flexWrap: 'wrap', width: widthNfts }}>
        					{itemsToShow.map((item, index) => {
        						return this.renderItem(item, index, nftWidth);
        					})}
                        </div>
    					:
                        null
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
    cardShopStyle: {
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#d7d7d7",
        borderStyle: 'solid'
    },
    cardShopStyleMobile: {
        borderRadius: 4,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        backgroundColor: "transparent",
        width: 'fit-content',
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 15,
        borderWidth: 1,
        borderColor: "#d7d7d7",
        borderStyle: 'solid'
    },
    btnChoose: {
        height: 38,
        width: 100,
        minWidth: 100,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR,
        display: 'flex',
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
	const { account, chainId, gasPrice, gasLimit, netId, networkUrl, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;
    const { statSearchedEquipment, allItems, allItemsIds, totalCountItems, totalMintedItems, itemsBlockId } = state.equipmentReducer

	return { account, chainId, gasPrice, gasLimit, netId, networkUrl, statSearchedEquipment, allItems, allItemsIds, totalCountItems, totalMintedItems, itemsBlockId, mainTextColor, mainBackgroundColor, isDarkmode };
}

export default connect(mapStateToProps, {
    clearTransaction,
    setNetworkSettings,
	setNetworkUrl,
    loadAllItemsIds,
    getPageBlockItems,
    getEquipmentVolume,
    mintEquipment,
    storeFiltersStatsEquip,
    updateInfoTransactionModal,
    getWizaValue,
    getEquipmentMintPhase,
    getEquipmentMintPrice,
    getMaxMintable,
    getAmountMinted
})(Equipment)
