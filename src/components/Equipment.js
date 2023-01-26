import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import { AiOutlinePlus } from 'react-icons/ai'
import { AiOutlineMinus } from 'react-icons/ai'
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import EquipmentCard from './common/EquipmentCard'
import ModalTransaction from './common/ModalTransaction'
import ModalOpenItemsMinted from './common/ModalOpenItemsMinted'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import { MAIN_NET_ID, ITEMS_PER_BLOCK, TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR } from '../actions/types'
import {
    setNetworkSettings,
	setNetworkUrl,
    clearTransaction,
    loadAllItemsIds,
    getPageBlockItems,
    getEquipmentVolume,
    mintEquipment
} from '../actions'
import '../css/Shop.css'

const chest_img = require('../assets/chest.png')


class Equipment extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            volume: 0,
            itemsToShow: [],
			floor: 0,
			uniqueOwners: 1,
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
        const { chainId, gasPrice, gasLimit, networkUrl, statSearched, allItems } = this.props

        //è inutile refetchare di nuovo tutto, se ci sono le stat cercate significa che
		//gli nft sono stati già caricati
		if (statSearched && statSearched.length > 0) {
			//this.searchByStat()
		}
		else {
			if (allItems) {
				//this.loadBlock(this.props.nftsBlockId || 0)
			}

			this.props.loadAllItemsIds(chainId, gasPrice, gasLimit, networkUrl, (res) => {

				this.getFloor(res)
				this.getUniqueOwners(res)

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

    buyChest() {
        const { account, chainId, gasPrice, netId } = this.props
        const { numberOfChest } = this.state

        this.setState({ typeModal: 'buychest' })

        this.props.mintEquipment(chainId, gasPrice, netId, numberOfChest, account)
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
                        {numberOfChest * 5}
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
		const { floor, uniqueOwners, volume } = this.state

		let items = totalCountItems || 0

		return (
			<div style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start', marginTop: 35, marginBottom: 40, flexWrap: 'wrap' }}>

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

					{/* this.renderBoxHeader(`${wizardsStaked || 0}`, 'wizards staked', isMobile) */}
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
        const { allItems, allItemsIds, showModalTx } = this.props
		const { loading, itemsToShow, searchedText, numberOfChest, showModalConnection } = this.state

        const { boxW, modalW } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', width: boxW }}>
                {this.renderHeader(isMobile)}

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
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
						<img
							src={getImageUrl(undefined)}
							style={{ width: 280, height: 280, borderRadius: 2 }}
							alt='Placeholder'
						/>
					</div>
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
}

const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, netId, networkUrl, showModalTx } = state.mainReducer;
    const { statSearched, allItems, allItemsIds, totalCountItems, itemsBlockId } = state.equipmentReducer

	return { account, chainId, gasPrice, gasLimit, netId, networkUrl, showModalTx, statSearched, allItems, allItemsIds, totalCountItems, itemsBlockId };
}

export default connect(mapStateToProps, {
    clearTransaction,
    setNetworkSettings,
	setNetworkUrl,
    loadAllItemsIds,
    getPageBlockItems,
    getEquipmentVolume,
    mintEquipment
})(Equipment)
