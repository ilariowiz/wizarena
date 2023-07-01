import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import '../../css/Nft.css'
import cardStatsShop from './CardStatsShop'
import { getColorTextBasedOnLevel } from './CalcLevelWizard'
import {

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
		const { item, width, mainTextColor, isDarkmode } = this.props
        //console.log(tournament)

        const numberOfTotalMedals = this.calcMedals()

		return (
			<div
				className='containerChoice'
                style={{ padding: 10 }}
			>
                <div style={{ width, alignItems: 'center' }}>
    				<img
    					style={{ width: width/2, height: width/2, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid' }}
    					src={getImageUrl(item.id)}
    					alt={`#${item.id}`}
    				/>

                    <div style={{ flexDirection: 'column', width: width/2 }}>

                        <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
                                {
                                    item.nickname ?
                                    <p style={{ color: mainTextColor, fontSize: 14 }} className="text-medium">
                                        {item.name} {item.nickname}
                                    </p>
                                    :
                                    <p style={{ color: mainTextColor, fontSize: 15 }} className="text-bold">
                                        {item.name}
                                    </p>
                                }
                            </div>
                        </div>

                        <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '90%', alignItems: 'center', marginBottom: 8 }}>
                                <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                    Level
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(item.level, isDarkmode), fontSize: 16 }} className="text-bold">
                                    {item.level}
                                </p>
                            </div>
                        </div>

                        {cardStatsShop(item, numberOfTotalMedals, undefined, mainTextColor)}

                    </div>
                </div>

                <button
                    className='btnH'
                    style={styles.btnChange}
                    onClick={() => this.props.onChange()}
                >
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Change
                    </p>
                </button>

			</div>
		)
	}
}

const styles = {
    btnChange: {
        height: 40,
        width: '100%',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR,
        marginTop: 15
    }
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode }
}

export default connect(mapStateToProps)(NftCardShopSelected);
