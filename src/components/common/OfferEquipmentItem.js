import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import itemToUrl from './ItemToUrl'
import { CTA_COLOR } from '../../actions/types'

class OfferEquipmentItem extends Component {
    getExpire(item) {
		return moment(item.expiresat.timep)
	}

    checkOfferState() {
		const { item } = this.props

		if (item.withdrawn) {
			return 'iswithdrew'
		}

		const now = moment()

		if (now < this.getExpire(item)) {
			return 'valid'
		}

		return 'expired'
	}

    render() {
        const { item, index, isMobile, mainTextColor } = this.props

        const diff = moment().to(this.getExpire(item))

        const offerState = this.checkOfferState()

        return (
            <div style={styles.boxOffer} key={index}>

                <div style={{ alignItems: 'center', marginRight: 5 }}>
                    <img
                        src={itemToUrl[item.itemtype]}
                        style={{ width: 56, height: 56, marginLeft: isMobile ? 5 : 20, marginRight: isMobile ? 5 : 15 }}
                        alt='ring'
                    />

                    <p style={{ fontSize: 15, color: mainTextColor, alignItems: 'center' }}>
                        {item.itemtype}
                    </p>
                </div>

                <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
                    {item.amount} $WIZA
                </p>

                <p style={{ fontSize: 14, color: mainTextColor }}>
                    Expiration {diff}
                </p>

                {
                    offerState === 'valid' &&
                    <p style={{ color: mainTextColor, fontSize: 15, marginRight: isMobile ? 5 : 15 }}>
                        Pending
                    </p>
                }

                {
                    offerState === 'iswithdrew' &&
                    <p style={{ color: mainTextColor, fontSize: 15, marginRight: isMobile ? 5 : 15 }}>
                        {item.status}
                    </p>
                }

                {
                    offerState === "expired" &&
                    <button
                        className="btnH"
                        style={styles.btnAccept}
                        onClick={() => this.props.withdrawOffer()}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Withdraw
                        </p>
                    </button>
                }

            </div>
        )
    }
}

const styles = {
    boxOffer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        borderRadius: 4,
        marginBottom: 20,
        width: '100%',
    },
    btnAccept: {
        width: 90,
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        backgroundColor: CTA_COLOR,
        marginRight: 15
    }
}

const mapStateToProps = (state) => {
	const { mainTextColor } = state.mainReducer

	return { mainTextColor }
}

export default connect(mapStateToProps)(OfferEquipmentItem)
