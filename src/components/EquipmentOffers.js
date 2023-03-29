import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import moment from 'moment'
import getBoxWidth from './common/GetBoxW'
import ModalMakeOfferItem from './common/ModalMakeOfferItem'
import itemToUrl from './common/ItemToUrl'
import { MAIN_NET_ID, TEXT_SECONDARY_COLOR, CTA_COLOR, BACKGROUND_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    getEquipmentActiveOffers,
    clearTransaction,
    makeOfferEquipment,
    loadEquipMinted,
    acceptOfferEquipment,
    updateInfoTransactionModal
} from '../actions'


class Sales extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            error: "",
            allOffers: [],
            showModalOffer: false,
            typeModal: "",
            yourEquip: [],
        }
    }

    componentDidMount() {
		document.title = "Equipment Offers - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadEquip()
			this.loadAllOffers()
		}, 500)
	}

    loadEquip() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {

			this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                const yourEquip = response.filter(i => !i.equipped)
                //console.log(yourEquip);
                this.setState({ yourEquip })
			})
		}
    }

    loadAllOffers() {
        const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

		this.setState({ loading: true })

        this.props.getEquipmentActiveOffers(chainId, gasPrice, gasLimit, networkUrl, (response) => {
            //console.log(response);

            let allOffers = response.filter(i => i.buyer !== account.account)

            allOffers = allOffers.sort((a, b) => {
                return b.amount - a.amount
            })

            this.setState({ loading: false, allOffers })
        })
	}

    submitOffer(amount, duration, ringType) {
		const { account, chainId, gasPrice, netId } = this.props

		//console.log(amount, duration);

		const makeOfferValues = {
			ringType,
			amount,
			duration
		}

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will offer ${makeOfferValues.amount} WIZA for ${makeOfferValues.ringType}, expiring in ${makeOfferValues.duration} ${makeOfferValues.duration > 1 ? "days" : "day"}`,
			typeModal: 'makeofferitem',
			transactionOkText: `Offer sent!`,
			makeOfferValues
		})

		this.setState({ showModalOffer: false }, () => {
			this.props.makeOfferEquipment(chainId, gasPrice, 4000, netId, account, ringType, duration, amount)
		})
	}

    acceptOffer(offer) {
		const { account, chainId, gasPrice, netId } = this.props
        const { yourEquip } = this.state

        const yourRings = yourEquip.filter(i => i.name === offer.itemtype)
        let idToSell;
        if (yourRings && yourRings.length > 0) {
            idToSell = yourRings[0].id
        }

        //console.log(idToSell);

		//console.log(amount, duration);
		let offerInfoRecap = `You are accepting an offer of ${offer.amount} WIZA (minus 2% marketplace fee) for ${offer.itemtype}`

		let saleValues = { id: idToSell, amount: offer.amount, name: offer.itemtype, url: itemToUrl[offer.itemtype] }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: offerInfoRecap,
			typeModal: 'acceptofferequipment',
			transactionOkText: `Offer accepted!`,
			saleValues
		})

		this.props.acceptOfferEquipment(chainId, gasPrice, 5000, netId, offer.id, idToSell, account)
	}

    getExpire(item) {
		return moment(item.expiresat.timep)
	}

    renderItemOffer(item, index) {
        const { yourEquip } = this.state

        const diff = moment().to(this.getExpire(item))

        const ringTypeOwn = yourEquip.filter(i => i.name === item.itemtype)
        let youOwn = ringTypeOwn && ringTypeOwn.length

        return (
            <div style={styles.boxOffer} key={index}>
                <img
                    src={itemToUrl[item.itemtype]}
                    style={{ width: 76, height: 76, marginBottom: 15 }}
                    alt={item.itemtype}
                />

                <p style={{ fontSize: 22, color: 'white', marginBottom: 15, alignItems: 'center' }}>
                    {item.itemtype}
                </p>

                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                    <p style={{ fontSize: 17, color: 'white', alignItems: 'center' }}>
                        <span style={{ color: 'gold' }}>{item.amount}</span> WIZA
                    </p>

                    <p style={{ fontSize: 17, color: 'white', alignItems: 'center' }}>
                        Expiration {diff}
                    </p>
                </div>

                <p style={{ fontSize: 15, color: 'white', marginBottom: 5, alignItems: 'center' }}>
                    You own {youOwn}
                </p>

                {
                    !youOwn || youOwn === 0 ?
                    <div style={{ height: 40, width: 160 }} />
                    :
                    <button
                        style={Object.assign({}, styles.btnAccept, { backgroundColor: CTA_COLOR })}
                        onClick={() => {
                            if (!youOwn || youOwn === 0) {
                                return
                            }
                            this.acceptOffer(item)
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            ACCEPT OFFER
                        </p>
                    </button>
                }

            </div>
        )
    }


    renderBody(isMobile) {
        const { loading, error, showModalOffer, allOffers } = this.state

        const { boxW, modalW } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflow: 'scroll' }}>

                <p style={{ color: '#8d8d8d', fontSize: 30, marginBottom: 20 }}>
                    Equipment Offers
                </p>

                <p style={{ fontSize: 20, color: 'white', marginBottom: 30 }}>
                    You can make an offer for a type of ring, whoever owns that ring will be able to accept your offer.
                </p>

                <button
                    className='btnH'
                    style={styles.btnBuy}
                    onClick={() => this.setState({ showModalOffer: true })}
                >
                    <p style={styles.btnBuyText}>
                        Make offer
                    </p>
                </button>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                {
                    error &&
                    <p style={{ fontSize: 17, color: 'white' }}>
                        {error}
                    </p>
                }

                <div style={{ width: boxW, flexDirection: 'row', flexWrap: 'wrap' }}>
                    {allOffers.map((item, index) => {
                        return this.renderItemOffer(item, index)
                    })}
                </div>

                <ModalMakeOfferItem
					width={modalW}
					showModal={showModalOffer}
					onCloseModal={() => this.setState({ showModalOffer: false })}
					submitOffer={(amount, duration, ringType) => this.submitOffer(amount, duration, ringType)}
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
					section={6}
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
					query="(max-width: 1199px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1200px)"
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
		flexDirection: 'row',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
    btnBuy: {
        width: 200,
		height: 50,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
        marginBottom: 30
	},
	btnBuyText: {
		fontSize: 21,
		color: 'white',
	},
    boxOffer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
        borderStyle: 'solid',
        borderRadius: 2,
        marginBottom: 20,
        marginRight: 20,
        width: 230,
        padding: 10,
    },
    btnAccept: {
        width: 160,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
    }
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, netId, networkUrl, showModalTx } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, netId, networkUrl, showModalTx };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    getEquipmentActiveOffers,
    clearTransaction,
    makeOfferEquipment,
    loadEquipMinted,
    acceptOfferEquipment,
    updateInfoTransactionModal
})(Sales)
