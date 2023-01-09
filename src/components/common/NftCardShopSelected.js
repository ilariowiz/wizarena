import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import '../../css/Nft.css'
import cardStatsShop from './CardStatsShop'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
import {
    getSubscription
} from '../../actions'
import { CTA_COLOR } from '../../actions/types'


class NftCardShopSelected extends Component {
    calcMedals() {
        const { item } = this.props

        const medals = item.medals

        let tot = 0

        Object.keys(medals).forEach(i => {
            tot += parseInt(medals[i])
        })

        return tot
    }

	render() {
		const { item, width } = this.props
        //console.log(tournament)

        const numberOfTotalMedals = this.calcMedals()

        const level = calcLevelWizard(item)

		return (
			<div
				className='containerChoice'
                style={{ borderWidth: 0, padding: 10 }}
			>
                <div style={{ width, alignItems: 'center' }}>
    				<img
    					style={{ width: width/2, height: width/2, borderRadius: 2, borderColor: 'white', borderWidth: 1, borderStyle: 'solid' }}
    					src={getImageUrl(item.id)}
    					alt={`#${item.id}`}
    				/>

                    <div style={{ flexDirection: 'column', width: width/2 }}>

                        <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
                                <p style={{ color: 'white', fontSize: 19 }}>
                                    {item.name}
                                </p>
                            </div>
                        </div>

                        <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '90%', alignItems: 'center', marginBottom: 8 }}>
                                <p style={{ color: '#c2c0c0', fontSize: 17, marginRight: 10 }}>
                                    LEVEL
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(level), fontSize: 19 }}>
                                    {level}
                                </p>
                            </div>
                        </div>

                        {cardStatsShop(item, numberOfTotalMedals)}


                    </div>
                </div>

                <button
                    className='btnH'
                    style={styles.btnChange}
                    onClick={() => this.props.onChange()}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        CHANGE
                    </p>
                </button>

			</div>
		)
	}
}

const styles = {
    statsTitleStyle: {
        fontSize: 15,
        color: '#c2c0c0',
        marginRight: 8
    },
    statsStyle: {
        fontSize: 15,
        color: 'white'
    },
    btnChange: {
        height: 40,
        width: '100%',
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR,
        marginTop: 15
    }
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl }
}

export default connect(mapStateToProps, {
    getSubscription
})(NftCardShopSelected);
