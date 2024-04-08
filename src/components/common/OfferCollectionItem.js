import React, { Component } from 'react'
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import moment from 'moment'
import {
    withdrawCollectionOffer,
    updateInfoTransactionModal
} from '../../actions'
import { CTA_COLOR } from '../../actions/types'
import '../../css/Nft.css'

class OfferCollectionItem extends Component {

	renderBuyer() {
		const { item, account, chainId, gasPrice, netId, mainTextColor } = this.props

		const offerState = this.checkOfferState()

		if (offerState === 'iswithdrew') {
			return (
				<p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
					{item.status === 'accepted' ? 'Offer accepted' : 'Already withdrawn'}
				</p>
			)
		}

		if (offerState === 'expired') {
			return (
				<button
					className='btnH'
					style={Object.assign({}, styles.btnAccept, { backgroundColor: CTA_COLOR })}
					onClick={() => {
                        this.props.updateInfoTransactionModal({
                			transactionToConfirmText: 'You will withdraw funds from this offer',
                			typeModal: 'withdrawoffer',
                			transactionOkText: 'Funds successfully withdrawn'
                		})

                        this.props.withdrawCollectionOffer(chainId, gasPrice, 5000, netId, item.id, account)
                    }}
				>
					<p style={{ fontSize: 15, color: "white" }} className="text-medium">
						Withdraw
					</p>
				</button>
			)
		}

        //pending
		return (
			<p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
				{item.status.slice(0,1).toUpperCase() + item.status.slice(1, item.status.length)}
			</p>
		)
	}

	getExpire() {
		const { item } = this.props
		return moment(item.expiresat.timep)
	}

	checkOfferState() {
		const { item } = this.props

		if (item.withdrawn) {
			return 'iswithdrew'
		}

		const now = moment()

		if (now < this.getExpire()) {
			return 'valid'
		}

		return 'expired'
	}

	renderExpiration() {
		const { item, mainTextColor } = this.props

		const diff = moment().to(this.getExpire())

		if (this.checkOfferState() === 'iswithdrew' && item.status === 'accepted') {
			return (
				<p style={{ fontSize: 16, color: 'white' }}>

				</p>
			)
		}

		return (
			<p style={{ fontSize: 14, marginRight: 5, color: mainTextColor }} className="text-medium">
				Expiration {diff}
			</p>
		)
	}

	render() {
		const { item, isMobile, mainTextColor } = this.props

		return (
			<div
                style={Object.assign({}, styles.boxSingleHistory, { borderWidth: 1, justifyContent: isMobile ? 'center' : 'space-between' })}
                key={item.id}
            >
                <div style={{ alignItems: 'center' }}>
                    <img
                        style={{ width: 56, height: 56, marginTop: 3, borderRadius: 4, marginLeft: isMobile ? 5 : 20, marginRight: 10, cursor: 'pointer' }}
                        src={getImageUrl(undefined)}
                        alt="Placeholder"
                    />
                    <p style={{ fontSize: 16, color: mainTextColor, marginLeft: 9 }}>
                        Collection Offer
                    </p>
                </div>


                <p style={{ fontSize: 16, color: mainTextColor, marginLeft: isMobile ? 10 : 20 }}>
                    $KDA {item.amount}
                </p>

				{this.renderExpiration()}

				{this.renderBuyer()}

				<div style={{ width: isMobile ? 5 : 20 }} />

			</div>
		)
	}
}

const styles = {
	boxSingleHistory: {
		alignItems: 'center',
		borderWidth: 1,
        borderRadius: 4,
        padding: 2,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
        marginBottom: 10,
        flexWrap: 'wrap',
        width: '100%'
	},
	btnAccept: {
		width: 90,
		height: 35,
		borderWidth: 1,
		borderColor: CTA_COLOR,
		borderStyle: 'solid',
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
	}
}

const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, netId, networkUrl, mainTextColor } = state.mainReducer

	return { account, chainId, gasPrice, gasLimit, netId, networkUrl, mainTextColor }
}

export default connect(mapStateToProps, {
    withdrawCollectionOffer,
    updateInfoTransactionModal
})(OfferCollectionItem)
