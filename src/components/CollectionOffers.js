import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import moment from 'moment'
import getBoxWidth from './common/GetBoxW'
import ModalMakeOffer from './common/ModalMakeOffer'
import ModalChooseWizard from './common/ModalChooseWizard'
import getImageUrl from './common/GetImageUrl'
import { MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    getCollectionOffers,
    clearTransaction,
    makeCollectionOffer,
    loadUserMintedNfts,
    acceptCollectionOffer,
    updateInfoTransactionModal
} from '../actions'


class CollectionOffers extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            error: "",
            allOffers: [],
            showModalOffer: false,
            typeModal: "",
            yourNfts: [],
            showChooseWizard: false,
            offerToAccept: {}
        }
    }

    componentDidMount() {
		document.title = "Collection Offers - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadMinted()
			this.loadAllOffers()
		}, 500)
	}

    loadMinted() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {

			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {
                const yourNfts = response.filter(i => !i.listed && !i.confirmBurn)
                this.setState({ yourNfts })
			})
		}
    }

    loadAllOffers() {
        const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

		this.setState({ loading: true })

        this.props.getCollectionOffers(chainId, gasPrice, gasLimit, networkUrl, (response) => {
            //console.log(response);

            let allOffers = response.filter(i => i.buyer !== account.account)

            allOffers = allOffers.sort((a, b) => {
                return b.amount - a.amount
            })

            this.setState({ loading: false, allOffers })
        })
	}

    submitOffer(amount, duration) {
		const { account, chainId, gasPrice, netId } = this.props

		//console.log(amount, duration);

		const makeOfferValues = {
			amount,
			duration
		}

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will offer ${makeOfferValues.amount} $KDA for a Wizard NFT, expiring in ${makeOfferValues.duration} ${makeOfferValues.duration > 1 ? "days" : "day"}`,
			typeModal: 'makecollectionoffer',
			transactionOkText: `Offer sent!`,
			makeOfferValues
		})

		this.setState({ showModalOffer: false }, () => {
			this.props.makeCollectionOffer(chainId, gasPrice, 4000, netId, account, duration, amount)
		})
	}

    acceptOffer(idnft) {
		const { account, chainId, gasPrice, netId } = this.props
        const { offerToAccept } = this.state

		//console.log(amount, duration);
		let offerInfoRecap = `You are accepting an offer of ${offerToAccept.amount} $KDA (minus 7% marketplace fee) for Wizard #${idnft}`

		let saleValues = { id: idnft, amount: offerToAccept.amount }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: offerInfoRecap,
			typeModal: 'acceptoffer',
			transactionOkText: `Offer accepted!`,
			saleValues
		})

		this.props.acceptCollectionOffer(chainId, gasPrice, 5000, netId, offerToAccept.id, idnft, account, offerToAccept.amount)
	}

    getExpire(item) {
		return moment(item.expiresat.timep)
	}

    renderItemOffer(item, index) {
        const { yourNfts } = this.state
        const { mainTextColor } = this.props

        const diff = moment().to(this.getExpire(item))

        let buyer = item.buyer ? `${item.buyer.substring(0, 6)}...${item.buyer.substring(item.buyer.length-4, item.buyer.length)}` : "..."

        return (
            <div style={styles.boxOffer} key={index}>
                <img
                    src={getImageUrl(undefined)}
                    style={{ width: 96, height: 96, marginBottom: 15 }}
                />

                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                    <p style={{ fontSize: 18, color: mainTextColor, alignItems: 'center', marginBottom: 4 }}>
                        {item.amount} KDA
                    </p>

                    <p style={{ fontSize: 16, color: mainTextColor, alignItems: 'center', marginBottom: 6 }}>
                        Expiration {diff}
                    </p>

                    <p style={{ fontSize: 14, color: mainTextColor, alignItems: 'center' }}>
                        From {buyer}
                    </p>
                </div>

                {
                    !yourNfts || yourNfts.length === 0 ?
                    <div style={{ height: 36, width: 150 }} />
                    :
                    <button
                        style={Object.assign({}, styles.btnAccept, { backgroundColor: CTA_COLOR })}
                        onClick={() => {
                            this.setState({ offerToAccept: item, showChooseWizard: true })
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Accept Offer
                        </p>
                    </button>
                }

            </div>
        )
    }


    renderBody(isMobile) {
        const { loading, error, showModalOffer, allOffers, showChooseWizard, yourNfts } = this.state
        const { mainTextColor } = this.props

        const { boxW, modalW, padding } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, overflowY: 'auto', overflowX: 'hidden', alignItems: 'center' }}>

                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 20 }} className="text-medium">
                    Collection Offers
                </p>

                <p style={{ fontSize: 17, color: mainTextColor, marginBottom: 30 }}>
                    You can make an offer for a Wizard nft.
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
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                {
                    error &&
                    <p style={{ fontSize: 15, color: 'red' }}>
                        {error}
                    </p>
                }

                <div style={{ width: boxW, flexDirection: 'row', flexWrap: 'wrap' }}>
                    {allOffers.map((item, index) => {
                        return this.renderItemOffer(item, index)
                    })}
                </div>

                <ModalMakeOffer
					width={modalW}
					showModal={showModalOffer}
					onCloseModal={() => this.setState({ showModalOffer: false })}
					submitOffer={(amount, duration) => this.submitOffer(amount, duration)}
				/>

                <ModalChooseWizard
                    showModal={showChooseWizard}
                    onCloseModal={() => this.setState({ showChooseWizard: false })}
                    yourWizards={yourNfts}
                    onSelect={(id) => {
                        this.setState({ showChooseWizard: false }, () => {
                            setTimeout(() => {
                                this.acceptOffer(id)
                            }, 300)
                        })

                    }}
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
    btnBuy: {
        width: 200,
		height: 40,
        minHeight: 40,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
        marginBottom: 30
	},
	btnBuyText: {
		fontSize: 15,
		color: 'white',
        fontFamily: 'FigtreeMedium'
	},
    boxOffer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        borderRadius: 4,
        marginBottom: 12,
        marginRight: 12,
        width: 220,
        padding: 10,
    },
    btnAccept: {
        width: 150,
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    }
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, netId, networkUrl, showModalTx, mainTextColor, mainBackgroundColor } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, netId, networkUrl, showModalTx, mainTextColor, mainBackgroundColor };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    getCollectionOffers,
    clearTransaction,
    makeCollectionOffer,
    loadUserMintedNfts,
    acceptCollectionOffer,
    updateInfoTransactionModal
})(CollectionOffers)
