import React, { Component } from 'react'
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import moment from 'moment'
import {
    withdrawOffer,
    updateInfoTransactionModal
} from '../../actions'
import { CTA_COLOR } from '../../actions/types'
import '../../css/Nft.css'

class OfferItem extends Component {

	getImage(isMobile) {
        const { item } = this.props

		return (
            <a
                href={`${window.location.protocol}//${window.location.host}/nft/${item.refnft}`}
                onClick={(e) => {
                    e.preventDefault()
                    this.props.history.push(`/nft/${item.refnft}`)
                }}
            >
    			<img
    				style={{ width: 56, height: 56, marginTop: 3, borderRadius: 2, marginLeft: isMobile ? 5 : 20, cursor: 'pointer' }}
    				src={getImageUrl(item.refnft)}
    				alt={`#${item.refnft}`}
    			/>
            </a>
		)
	}

	renderBuyer() {
		const { item, account, chainId, gasPrice, netId } = this.props

		const offerState = this.checkOfferState()

		if (offerState === 'iswithdrew') {
			return (
				<p style={{ fontSize: 18, color: 'white' }}>
					{item.status === 'accepted' ? 'Offer accepted' : 'Already withdrawn'}
				</p>
			)
		}

		if (offerState === 'expired') {
			return (
				<button
					className='btnH'
					style={styles.btnAccept}
					onClick={() => {
                        this.props.updateInfoTransactionModal({
                			transactionToConfirmText: 'You will withdraw funds from this offer',
                			typeModal: 'withdrawoffer',
                			transactionOkText: 'Funds successfully withdrawn'
                		})

                        this.props.withdrawOffer(chainId, gasPrice, 5000, netId, item.id, account)
                    }}
				>
					<p style={{ fontSize: 17, color: CTA_COLOR }}>
						Withdraw
					</p>
				</button>
			)
		}

        //pending
		return (
			<p style={{ fontSize: 18, color: 'white' }}>
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
		const { item, isMobile } = this.props

		const diff = moment().to(this.getExpire())

		if (this.checkOfferState() === 'iswithdrew' && item.status === 'accepted') {
			return (
				<p style={{ fontSize: 16, color: 'white', flex: 1 }}>

				</p>
			)
		}

		return (
			<p style={{ fontSize: isMobile ? 14 : 17, marginRight: 5, color: 'white', flex: 1 }}>
				Expiration {diff}
			</p>
		)
	}

	render() {
		const { item, kadenaPrice, isOwner, isBuyer, showImage, isMobile } = this.props

		return (
			<div
                style={Object.assign({}, styles.boxSingleHistory, { borderWidth: !showImage ? 0 : 1, height: showImage ? 60 : 45 })}
                key={item.id}
            >
				{
					showImage ?
					this.getImage(isMobile)
					: null
				}

				{
					showImage ?
					<p style={{ fontSize: 19, color: 'white', marginLeft: 9 }}>
						#{item.refnft}
					</p>
					: null
				}

                <div style={{ alignItems: 'center', flex: 1 }}>
    				<p style={{ fontSize: isMobile ? 18 : 22, color: 'white', marginLeft: isMobile ? 10 : 20 }}>
    					KDA {item.amount}
    				</p>

    				{
    					!isMobile && kadenaPrice && kadenaPrice > 0 ?
    					<p style={{ fontSize: 15, color: 'white', marginLeft: 10 }}>
    						(USD ${(kadenaPrice * item.amount).toFixed(2)})
    					</p>
                        : null
    				}
                </div>

                {
                    !isMobile &&
                    <p style={{ fontSize: 15, color: 'white', flex: 1 }}>
                        From {item.buyer.slice(0, 10)}...
                    </p>
                }


				{this.renderExpiration()}

				{
					isOwner ?
					<button
						className='btnH'
						style={Object.assign({}, styles.btnAccept, { backgroundColor: CTA_COLOR })}
						onClick={() => this.props.onAcceptOffer(item.refnft, getImageUrl(item.refnft))}
					>
						<p style={{ fontSize: 17, color: 'white', fontWeight: '500' }}>
							Accept
						</p>
					</button>
					: null
				}

                {
					isOwner ?
					<button
						className='btnH'
						style={Object.assign({}, styles.btnAccept, { backgroundColor: 'transparent', marginLeft: 10 })}
						onClick={() => this.props.onDeclineOffer()}
					>
						<p style={{ fontSize: 17, color: CTA_COLOR, fontWeight: '500' }}>
							Decline
						</p>
					</button>
					: null
				}

				{
					isBuyer ?
					this.renderBuyer()
					: null
				}

				<div style={{ width: isMobile ? 5 : 20 }} />

			</div>
		)
	}
}

const styles = {
	boxSingleHistory: {
		justifyContent: 'space-between',
		alignItems: 'center',
		borderWidth: 1,
        borderRadius: 2,
		borderColor: 'white',
		borderStyle: 'solid',
        marginBottom: 10,
	},
	btnAccept: {
		width: 100,
		height: 40,
		borderWidth: 2,
		borderColor: CTA_COLOR,
		borderStyle: 'solid',
		borderRadius: 2,
		justifyContent: 'center',
		alignItems: 'center',
	}
}

const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, netId, networkUrl } = state.mainReducer

	return { account, chainId, gasPrice, gasLimit, netId, networkUrl }
}

export default connect(mapStateToProps, {
    withdrawOffer,
    updateInfoTransactionModal
})(OfferItem)
