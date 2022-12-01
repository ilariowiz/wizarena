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
		const { item, width, reveal, isSelect } = this.props
        //console.log(tournament)

        const numberOfTotalMedals = this.calcMedals()

        const level = calcLevelWizard(item)

		return (
			<div
				className='containerChoice'
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id, reveal)}
					alt={`#${item.id}`}
				/>

				<div style={{ flexDirection: 'column', width, alignItems: 'center' }}>

					<div style={{ width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
						<p style={{ color: 'white', fontSize: 17 }}>
							{item.name}
						</p>
					</div>

					<div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        <div style={{ width: '90%', alignItems: 'center', marginBottom: 8 }}>
                            <p style={{ color: '#c2c0c0', fontSize: 16, marginRight: 10 }}>
                                LEVEL
                            </p>
                            <p style={{ color: getColorTextBasedOnLevel(level), fontSize: 18 }}>
                                {level}
                            </p>
                        </div>

                        {cardStatsShop(item, numberOfTotalMedals)}

                        {
                            isSelect ?
                            <button
                                className='btnH'
                                style={styles.btnSubscribe}
                                onClick={() => this.props.onSelect()}
                            >
                                <p style={{ fontSize: 17, color: 'white' }}>
                                    SELECT
                                </p>
                            </button>
                            :
                            <button
                                className='btnH'
                                style={styles.btnSubscribe}
                                onClick={() => this.props.onChange()}
                            >
                                <p style={{ fontSize: 17, color: 'white' }}>
                                    CHANGE
                                </p>
                            </button>
                        }

                    </div>

				</div>

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
    btnSubscribe: {
        height: 45,
        width: '100%',
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    }
}

const mapStateToProps = (state) => {
	const { reveal, account, chainId, netId, gasPrice, gasLimit, networkUrl } = state.mainReducer

	return { reveal, account, chainId, netId, gasPrice, gasLimit, networkUrl }
}

export default connect(mapStateToProps, {
    getSubscription
})(NftCardShop);
