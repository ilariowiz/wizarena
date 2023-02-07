import React, { Component } from 'react'
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
        const { item, index, isMobile } = this.props

        const diff = moment().to(this.getExpire(item))

        const offerState = this.checkOfferState()

        return (
            <div style={styles.boxOffer} key={index}>

                <div style={{ alignItems: 'center', marginRight: 5 }}>
                    <img
                        src={itemToUrl[item.itemtype]}
                        style={{ width: 56, height: 56, marginLeft: isMobile ? 5 : 20, marginRight: isMobile ? 5 : 15 }}
                    />

                    <p style={{ fontSize: isMobile ? 17 : 20, color: 'white', alignItems: 'center' }}>
                        {item.itemtype}
                    </p>
                </div>

                <p style={{ fontSize: 17, color: 'white' }}>
                    <span style={{ color: 'gold' }}>{item.amount}</span> WIZA
                </p>

                <p style={{ fontSize: isMobile ? 14 : 17, color: 'white' }}>
                    Expiration {diff}
                </p>

                {
                    offerState === 'valid' &&
                    <p style={{ color: 'white', fontSize: 17, marginRight: isMobile ? 5 : 15 }}>
                        Pending
                    </p>
                }

                {
                    offerState === "expired" &&
                    <button
                        style={styles.btnAccept}
                        onClick={() => this.props.withdrawOffer()}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            WITHDRAW
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
        borderColor: 'white',
        borderStyle: 'solid',
        borderRadius: 2,
        marginBottom: 20,
        width: '100%',
    },
    btnAccept: {
        width: 160,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        backgroundColor: CTA_COLOR,
        marginRight: 15
    }
}

export default OfferEquipmentItem
