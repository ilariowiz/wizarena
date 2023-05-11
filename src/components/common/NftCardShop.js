import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import '../../css/Nft.css'
import cardStatsShop from './CardStatsShop'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
import {

} from '../../actions'
import { CTA_COLOR } from '../../actions/types'


class NftCardShop extends Component {
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
		const { item, width, isSelect, mainTextColor, isDarkmode } = this.props
        //console.log(item)

        //const numberOfTotalMedals = this.calcMedals()

        const level = calcLevelWizard(item)

		return (
			<div
				className='containerChoice'
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

				<div style={{ flexDirection: 'column', width, alignItems: 'center' }}>

					<div style={{ width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
						<p style={{ color: mainTextColor, fontSize: 15 }} className="text-medium">
							{item.name}
						</p>
					</div>

					<div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        <div style={{ width: '90%', alignItems: 'center', marginBottom: 8 }}>
                            <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                Level
                            </p>
                            <p style={{ color: getColorTextBasedOnLevel(level, isDarkmode), fontSize: 16 }} className="text-bold">
                                {level}
                            </p>
                        </div>

                        <div style={{ width: '90%', alignItems: 'center', marginBottom: 8 }}>
                            <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                AP
                            </p>
                            <p style={{ color: mainTextColor, fontSize: 16 }}>
                                {item.ap.int}
                            </p>
                        </div>

                        {cardStatsShop(item, undefined, undefined, mainTextColor)}

                        {
                            isSelect ?
                            <button
                                className='btnH'
                                style={styles.btnSubscribe}
                                onClick={() => this.props.onSelect()}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Select
                                </p>
                            </button>
                            :
                            null
                        }

                    </div>

				</div>

			</div>
		)
	}
}

const styles = {
    btnSubscribe: {
        height: 40,
        width: '100%',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    }
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode }
}

export default connect(mapStateToProps)(NftCardShop);
