import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import toast, { Toaster } from 'react-hot-toast';
import Header from './Header'
import HistoryItemEquipment from './common/HistoryItemEquipment'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import ModalTransfer from './common/ModalTransfer'
import getRingBonuses from './common/GetRingBonuses'
import getImageUrl from './common/GetImageUrl'
import ringsRarity from './common/RankRings'
import getBoxWidth from './common/GetBoxW'
import { MAIN_NET_ID, TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR } from '../actions/types'
import {
    setNetworkSettings,
	setNetworkUrl,
    clearTransaction,
    getInfoNftEquipment,
    listEquipment,
    delistEquipment,
    buyEquipment,
    transferEquipment,
    updateInfoTransactionModal
} from '../actions'


class ItemEquipment extends Component {

    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            error: '',
            equipment: {},
            inputPrice: '',
            showModalConnection: false,
            wizaPrice: undefined,
            itemHistory: [],
            loadingHistory: true,
            showModalTransfer: false,
        }
    }

    componentDidMount() {
		//console.log(this.props.account)
		document.title = `Wizards Arena`

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        this.loadKadenaWizaPrice()

		setTimeout(() => {
			this.getPathNft()
		}, 500)
	}

    loadKadenaWizaPrice() {

        let body = { operationName: 'pairs', variables: {pair: "coin_free.wiza"}, query: "query pairs($pair: String) {\n  pairs(pair: $pair) {\n    id\n    token0 {\n      id\n      code\n      tokenName\n      tokenSymbol\n      icon\n      __typename\n    }\n    token1 {\n      id\n      code\n      tokenName\n      tokenSymbol\n      icon\n      __typename\n    }\n    token0Liquidity\n    token1Liquidity\n    lastPrice\n    __typename\n  }\n}\n"}

        fetch('https://kdswap-fd-prod-cpeabrdfgdg9hzen.z01.azurefd.net/graphql/graphql', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
		.then(response => response.json())
		.then(data => {
			//console.log(data)
            if (data.data && data.data.pairs && data.data.pairs.length > 0) {
                //console.log(data.data.pairs[0]);

                this.setState({ wizaPrice: data.data.pairs[0].lastPrice })
            }
		})
		.catch(error => console.log(error))
    }

    getPathNft() {
		const { pathname } = this.props.location;
		const iditem = pathname.replace('/item/', '')

		this.loadNft(iditem)
	}

    loadNft(iditem) {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

        this.props.getInfoNftEquipment(chainId, gasPrice, gasLimit, networkUrl, iditem, (response) => {
			//console.log(response);
            document.title = `${response.name} - Wizards Arena`

            this.loadHistory(iditem)
			this.setState({ equipment: response, loading: false })
		})
    }

    loadHistory(iditem) {
		let url = `https://estats.chainweb.com/txs/events?search=wiz-equipment.EQUIPMENT_BUY&param=${iditem}&offset=0&limit=50`
		//console.log(url);
		fetch(url)
  		.then(response => response.json())
  		.then(data => {
  			//console.log(data)

			let filterData = []
			if (data && data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					let d = data[i]

					const id = d.params[0]

					if (id && id === iditem) {
						filterData.push(d)
					}
				}
			}

			this.setState({ itemHistory: filterData, loadingHistory: false })
  		})
		.catch(e => {
			console.log(e)
			this.setState({ loadHistory: false })
		})
	}

    onlyNumbers(str) {
		return /^[0-9]+$/.test(str);
	}

    list() {
		const { equipment, inputPrice } = this.state;
		const { account, chainId, gasPrice, netId } = this.props

		if (!this.onlyNumbers(inputPrice) || !inputPrice || parseInt(inputPrice) < 0) {
			//console.log('price bad format')
			toast.error('Please enter a valid amount')
			return
		}

		if (equipment.owner !== account.account) {
			//console.log('you are not the owner')
			return
		}

        let saleValues = { id: equipment.id, amount: inputPrice, url: equipment.url, name: equipment.name }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will list ${equipment.name} for ${inputPrice} WIZA. Marketplace Fee: 2%`,
			typeModal: 'listequipment',
			transactionOkText: 'Listing successfully',
            saleValues
		})

		this.props.listEquipment(chainId, gasPrice, 700, netId, equipment.id, parseFloat(inputPrice).toFixed(2), account)

	}

    delist() {
		const { equipment } = this.state;
		const { account, chainId, gasPrice, netId } = this.props

        let saleValues = { id: equipment.id, url: equipment.url, name: equipment.name }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will delist #${equipment.id}`,
			typeModal: 'delistequipment',
			transactionOkText: 'Delisting successfully',
            saleValues
		})

		this.props.delistEquipment(chainId, gasPrice, 700, netId, account, equipment.id)
	}

    buy() {
		const { equipment } = this.state
		const { account, chainId, gasPrice, netId } = this.props

		let saleValues = { id: equipment.id, amount: equipment.price, url: equipment.url, name: equipment.name }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will buy ${equipment.name} (you will need WIZA on chain 1)`,
			typeModal: 'buyequipment',
			transactionOkText: `You bought ${equipment.name}`,
            saleValues
		})

		this.props.buyEquipment(chainId, gasPrice, 7000, netId, account, equipment.id)
	}

    transfer(receiver) {
		const { equipment } = this.state
		const { account, chainId, gasPrice, netId } = this.props

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will transfer #${equipment.id} to another wallet`,
			typeModal: 'transfer',
			transactionOkText: `Transfer completed successfully`,
		})

		this.props.transferEquipment(chainId, gasPrice, 1500, netId, equipment.id, account, receiver)
	}

    renderName(marginBottom) {
		const { equipment } = this.state

        const rarity = ringsRarity[equipment.name]
        //console.log(rarity);
		return (
			<div style={{ flexDirection: 'column', marginBottom }}>
                <p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 26, lineHeight: 1, marginBottom: 5 }}>
                    #{equipment.id} {equipment.name}
                </p>

                <p style={{ color: '#c2c0c0', fontSize: 18, lineHeight: 1 }}>
                    1 of {rarity} {rarity > 1 ? "rings" : "ring"}
                </p>
			</div>
		)
	}

    renderLeftBoxPriceListed(isOwner) {
		const { equipment, inputPrice, wizaPrice } = this.state

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 15 }}>

				{this.renderName(24)}

				<div style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', marginTop: 15 }}>
					<p style={{ color: '#c2c0c0', fontSize: 17, marginBottom: 4 }}>
						Current price
					</p>

					<div style={{ alignItems: 'center', marginBottom: 4 }}>
                        <p style={{ fontSize: 20, color: 'white', lineHeight: 1, marginRight: 15 }}>
							$WIZA
						</p>

						<p style={{ fontSize: 24, color: 'white', lineHeight: 1 }}>
							{equipment.price}
						</p>
					</div>

					<p style={{ color: '#c2c0c0', fontSize: 15 }}>
						(KDA {(wizaPrice * equipment.price).toFixed(2)})
					</p>
				</div>

				{
					isOwner &&
					<div style={{ flexDirection: 'column', marginTop: 15 }}>
						<p style={{ color: '#c2c0c0', fontSize: 17, marginBottom: 5 }}>
							Update price
						</p>

						<input
							style={styles.inputPrice}
							placeholder='WIZA'
							value={inputPrice}
							onChange={(e) => this.setState({ inputPrice: e.target.value })}
						/>
					</div>
				}
			</div>
		)
	}

    // SE NFT é LISTATO ******************************************
	// GESTIAMO I CASI: Connect Wallet, Cancel Listing, Buy Now, Make Offer
	renderBtnBuy(width, marginRight, isMobile) {
		const { equipment } = this.state;
		const { account } = this.props

		if (!account || (account && !account.account)) {

			let style = isMobile ? { height: '100%', flexDirection: 'column', marginLeft: 15, justifyContent: 'flex-end' }
									:
									{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }

			return (
				<div style={style}>
					<button
						className='btnH'
						style={Object.assign({}, styles.btnBuy, { width, marginRight })}
						onClick={() => this.setState({ showModalConnection: true })}
					>
						<p style={Object.assign({}, styles.btnBuyText, { fontSize: 19 })}>
							Connect wallet
						</p>
					</button>
				</div>
			)
		}

		if (equipment.owner === account.account) {

			let style = isMobile ? { height: '100%', flexDirection: 'column', marginLeft: 15, justifyContent: 'flex-end' }
									:
									{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }

			return (
				<div style={style}>
					<button
						className='btnH'
						style={Object.assign({}, styles.btnBuy, { width, marginRight, marginBottom: 20 })}
						onClick={() => this.list()}
					>
						<p style={styles.btnBuyText}>
							Update price
						</p>
					</button>

					<button
						className='btnH'
						style={Object.assign({}, styles.btnBuy, { width, marginRight })}
						onClick={() => this.delist()}
					>
						<p style={styles.btnBuyText}>
							Cancel listing
						</p>
					</button>
				</div>
			)
		}

		let style = isMobile ? { height: '100%', flexDirection: 'column', marginLeft: 15, marginTop: 10, justifyContent: 'space-around' }
								:
								{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }

		return (
			<div style={style}>

				{/*<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width, marginRight })}
					onClick={() => this.setState({ showModalOffer: true })}
				>
					<p style={styles.btnBuyText}>
						Make offer
					</p>
				</button>*/}

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width, marginRight })}
					onClick={() => this.buy()}
				>
					<p style={styles.btnBuyText}>
						Buy now
					</p>
				</button>
			</div>
		)
	}

    renderLeftBoxListing() {
		const { inputPrice, wizaPrice } = this.state

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 15 }}>

				{this.renderName(24)}

				<div style={{ flexDirection: 'column', marginTop: 15 }}>
					<p style={{ color: '#c2c0c0', fontSize: 17, marginBottom: 5 }}>
						Set price in WIZA
					</p>

					<p style={{ color: '#c2c0c0', fontSize: 16, marginBottom: 5 }}>
						KDA {(wizaPrice * inputPrice).toFixed(2)}
					</p>

					<input
						style={styles.inputPrice}
						placeholder='WIZA'
						value={inputPrice}
						onChange={(e) => this.setState({ inputPrice: e.target.value })}
					/>
				</div>

			</div>
		)
	}

    renderBtnSell(width, marginRight, isMobile) {
		const { equipment } = this.state
		const { account } = this.props

		let style = isMobile ? { flexDirection: 'column', height: '100%', marginLeft: 15, marginTop: 10, justifyContent: 'flex-end' }
								:
								{ flexDirection: 'column', height: '100%', alignItems: 'flex-end', justifyContent: 'flex-end' }

		return (
			<div style={style}>
				{
					!equipment.listed && account && account.account && equipment.owner === account.account ?
					<button
						className="btnH"
						style={Object.assign({}, styles.btnTransfer, { marginRight })}
						onClick={() => this.setState({ showModalTransfer: true })}
					>
						<p style={{ color: 'white', fontSize: 17 }}>
							Transfer
						</p>
					</button>
					: null
				}

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width, marginRight })}
					onClick={() => this.list()}
				>
					<p style={styles.btnBuyText}>
						Sell
					</p>
				</button>
			</div>
		)
	}

    renderLeftMakeOffer() {
		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 15 }}>
				{this.renderName(0)}
			</div>
		)
	}

    renderBtnConnect(width, marginRight, isMobile) {

		let style = isMobile ? { marginLeft: 15 }
								:
								{ alignItems: 'center', justifyContent: 'center', marginRight }

		return (
			<div style={style}>
				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width })}
					onClick={() => this.setState({ showModalConnection: true })}
				>
					<p style={Object.assign({}, styles.btnBuyText, { fontSize: 18 })}>
						Connect wallet
					</p>
				</button>
			</div>
		)
	}

    renderBoxStats(width) {
		const { equipment } = this.state

        let infoEquipment = equipment && equipment.bonus ? getRingBonuses(equipment) : undefined

        //console.log(infoEquipment);

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: '#ffffff15', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 22, color: 'white' }}>
						Stats
					</p>
				</div>

				<div style={Object.assign({}, styles.boxTraits, { width })}>

					{
						equipment && infoEquipment ?
						<div style={Object.assign({}, styles.boxTraits, { width })}>

							<div style={{ width: '100%', alignItems: 'center', marginBottom: 8 }}>
								<p style={{ fontSize: 22, color: "white" }}>
									{infoEquipment.bonusesText.join(", ")}
								</p>
							</div>

						</div>
						: null
					}

				</div>
			</div>
		)
	}

    renderBoxEquipped(width, isMobile) {
		const { equipment } = this.state

		return (
			<div style={Object.assign({}, styles.boxSection, { width, borderWidth: 0, alignItems: isMobile ? 'center' : 'flex-end' })}>

                <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ marginBottom: 20, fontSize: 26, color: 'white' }}>
                        Equipped to
                    </p>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${equipment.equippedToId}`}
                        style={{ width: width - 80, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        onClick={(e) => {
                            e.preventDefault()
                            this.props.history.push(`/nft/${equipment.equippedToId}`)
                        }}
                    >
                        <img
                            src={getImageUrl(equipment.equippedToId)}
                            style={{ width: width - 80, marginBottom: 10, borderColor: 'white', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}
                            alt="Ring"
                        />

                        <p style={{ fontSize: 22, color: 'white' }}>
                            #{equipment.equippedToId}
                        </p>
                    </a>
                </div>
			</div>
		)
	}

    renderHistoryItem(item, index, isMobile) {
		const { itemHistory } = this.state

		return (
			<HistoryItemEquipment
				item={item}
				index={index}
				nftH={itemHistory}
				key={index}
				isMobile={isMobile}
			/>
		)
	}

    renderBoxSales(width) {
		const { itemHistory, loadingHistory } = this.state

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: '#ffffff15', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 22, color: 'white' }}>
						Item sales
					</p>
				</div>

				<div style={Object.assign({}, styles.boxHistory, { width })}>

					{itemHistory.map((item, index) => {
						return this.renderHistoryItem(item, index, false)
					})}

					{
						itemHistory && itemHistory.length === 0 ?
						<p style={{ fontSize: 18, color: 'white', marginLeft: 15, marginBottom: 15, marginTop: 15 }}>
							{loadingHistory ? "Loading..." : "No sales"}
						</p>
						: null
					}

				</div>

			</div>
		)
	}

    renderBodySmall() {
		const { equipment, loading } = this.state
		const { account } = this.props

		const { boxW, modalW } = getBoxWidth(false)
        let imageWidth = boxW > 500 ? 500 : boxW - 30

		let boxTopStyle = { width: boxW, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 25 }

		let ctaWidth = boxW * 50 / 100
		if (ctaWidth > 170) ctaWidth = 170

        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: 15, overflow: 'auto' }}>

                {
                    loading &&
                    <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                        <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                    </div>
                }

                <div style={boxTopStyle}>

                    <img
                        style={{ width: imageWidth, height: imageWidth, borderRadius: 2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
                        src={equipment.url}
                        alt={equipment.id}
                    />

                    <div style={{ flexDirection: 'column', width: imageWidth, height: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 }}>

                        {
                                //nft listato, in renderbtn buy gestiamo tutti i casi, anche account non connesso
                            equipment.listed &&
                            <div style={styles.boxRightMobile}>

                                {this.renderLeftBoxPriceListed(equipment.owner === account.account)}

                                <div style={{ height: 15 }} />

                                {this.renderBtnBuy(ctaWidth, 15, true)}

                            </div>
                        }

                        {
							// nft non listato ma tu sei owner: SELL
							!equipment.listed && account && account.account && equipment.owner === account.account ?
							<div style={styles.boxRightMobile}>
								{this.renderLeftBoxListing()}

								<div style={{ height: 15 }} />

								{this.renderBtnSell(ctaWidth, 15, true)}

							</div>
							: null
						}

                        {
							//non sei il proprietario e l'nft non è listato
							!equipment.listed && !loading && account && account.account && equipment.owner !== account.account ?
							<div style={styles.boxRightMobile}>

								{this.renderLeftMakeOffer()}

							</div>
							: null
						}

                        {
							//nft non listato ma account non connesso CONNECT WALLET
							 !equipment.listed && !loading && (!account || (account && !account.account)) ?
							<div style={styles.boxRightMobile}>

								{this.renderLeftMakeOffer()}

								<div style={{ height: 15 }} />

								{this.renderBtnConnect(ctaWidth, 15, true)}
							</div>
							: null
						}

                    </div>

                    {this.renderBoxStats(imageWidth)}

    				{
                        equipment && equipment.equipped ?
                        this.renderBoxEquipped(imageWidth, true)
                        : null
                    }

                    {this.renderBoxSales(imageWidth)}

                </div>

            </div>
        )
    }

    renderBodyLarge() {
        const { equipment, loading } = this.state
		const { account } = this.props

		//console.log(nft);

		const { boxW, modalW } = getBoxWidth(false)

        let insideWidth = boxW > 900 ? 900 : boxW

		let ctaWidth = insideWidth * 30 / 100
		if (ctaWidth > 250) ctaWidth = 250

        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: 25, overflow: 'auto' }}>

                {
                    loading &&
                    <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
                        <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                    </div>
                }

                <div style={{ width: boxW, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 35 }}>

                    <div style={{ alignItems: 'center', width: insideWidth, justifyContent: equipment && equipment.equipped ? 'space-between' : 'center' }}>

                        <img
                            style={{ width: 300, height: 300, marginBottom: 30, borderRadius: 2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
                            src={equipment.url}
                            alt={equipment.id}
                        />

                        {
                            equipment && equipment.equipped ?
                            this.renderBoxEquipped(300, false)
                            : null
                        }
                    </div>

                    <div style={{ flexDirection: 'column', justifyContent: 'center', marginBottom: 30 }}>

                        {
                            //nft listato, in renderbtn buy gestiamo tutti i casi, anche account non connesso
                            equipment.listed &&
                            <div style={Object.assign({}, styles.boxRightLarge, { width: insideWidth })}>

                                {this.renderLeftBoxPriceListed(equipment.owner === account.account)}

                                {this.renderBtnBuy(ctaWidth, 15)}

                            </div>
                        }

                        {
							// nft non listato ma tu sei owner: SELL
							!equipment.listed && account && account.account && equipment.owner === account.account ?
							<div style={Object.assign({}, styles.boxRightLarge, { width: insideWidth })}>
								{this.renderLeftBoxListing()}

								{this.renderBtnSell(ctaWidth, 15)}

							</div>
							: null
						}

                        {
							//non sei il proprietario e l'nft non è listato
							!equipment.listed && !loading && account && account.account && equipment.owner !== account.account ?
							<div style={Object.assign({}, styles.boxRightLarge, { width: insideWidth })}>

								{this.renderLeftMakeOffer()}
							</div>
							: null
						}

                        {
							//nft non listato ma account non connesso CONNECT WALLET
							 !equipment.listed && !loading && (!account || (account && !account.account)) ?
							<div style={Object.assign({}, styles.boxRightLarge, { width: insideWidth })}>

								{this.renderLeftMakeOffer()}

								{this.renderBtnConnect(ctaWidth, 15)}
							</div>
							: null
						}


                    </div>

                    {this.renderBoxStats(insideWidth)}

                    {this.renderBoxSales(insideWidth)}

                </div>
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
                <Header
                    page='nft'
                    account={account}
                    isMobile={isMobile}
                    history={this.props.history}
                />
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

    render() {
		const { showModalConnection, loading, error, showModalTransfer } = this.state

		let modalW = window.innerWidth * 82 / 100
		if (modalW > 480) {
			modalW = 480
		}
		else if (modalW < 310) {
			modalW = 310
		}

		return (
			<div style={styles.container}>

                <Toaster
                    position="top-center"
                    reverseOrder={false}
                />

				<Media
					query="(max-width: 1199px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1200px)"
					render={() => this.renderTopHeader(false)}
				/>

                {
					!error &&
					<Media
						query="(max-width: 767px)"
						render={() => this.renderBodySmall()}
					/>
				}

				{
					!error &&
					<Media
						query="(min-width: 768px)"
						render={() => this.renderBodyLarge()}
					/>
				}

				{
					error &&
					this.renderError()
				}

				<ModalConnectionWidget
					width={modalW}
					showModal={showModalConnection}
					onCloseModal={() => this.setState({ showModalConnection: false })}
				/>

                <ModalTransfer
					width={modalW}
					showModal={showModalTransfer}
					onCloseModal={() => this.setState({ showModalTransfer: false })}
					callback={(receiver) => {
						this.setState({ showModalTransfer: false }, () => {
							this.transfer(receiver)
						})
					}}
				/>

			</div>
		)
	}
}

const styles = {
    container: {
		flexDirection: 'row',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
    boxRightLarge: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderRadius: 2,
		paddingTop: 16,
		paddingBottom: 16,
		backgroundColor: '#ffffff15'
	},
	boxRightMobile: {
		width: '100%',
		flexDirection: 'column',
		justifyContent: 'space-between',
		borderRadius: 2,
		paddingTop: 16,
		paddingBottom: 16,
		backgroundColor: '#ffffff15'
	},
	boxPrice: {
		borderRadius: 2,
		paddingTop: 16,
		paddingBottom: 16,
		backgroundColor: '#ffffff15'
	},
	btnBuy: {
		height: 50,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
	},
	btnBuyText: {
		fontSize: 21,
		color: 'white',
	},
    inputPrice: {
		width: 130,
		height: 40,
		color: 'black',
		borderRadius: 2,
		borderColor: '#b9b7b7',
		borderStyle: 'solid',
		borderWidth: 2,
		fontSize: 19,
		paddingLeft: 10,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		outline: 'none'
	},
    boxSection: {
		flexDirection: 'column',
		borderRadius: 2,
		borderWidth: 1,
		borderColor: '#ffffff15',
		borderStyle: 'solid',
		marginBottom: 30
	},
	boxTraits: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		padding: 10,
	},
    boxHistory: {
		flexDirection: 'column',
		width: '90%',
		paddingTop: 5,
		paddingBottom: 5,
	},
    btnTransfer: {
		height: 35,
		maxWidth: 154,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: CTA_COLOR,
		borderRadius: 2,
		borderStyle: 'solid',
		marginTop: 5,
		paddingLeft: 11,
		paddingRight: 11,
        marginBottom: 15
	}
}


const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, netId, networkUrl } = state.mainReducer;
    const { statSearched, allItems, allItemsIds, totalCountItems, itemsBlockId } = state.equipmentReducer

	return { account, chainId, gasPrice, gasLimit, netId, networkUrl, statSearched, allItems, allItemsIds, totalCountItems, itemsBlockId };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
	setNetworkUrl,
    clearTransaction,
    getInfoNftEquipment,
    listEquipment,
    delistEquipment,
    buyEquipment,
    transferEquipment,
    updateInfoTransactionModal
})(ItemEquipment)
