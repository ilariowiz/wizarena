import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import '../../css/NftCardChoice.css'
import { getColorTextBasedOnLevel } from './CalcLevelWizard'
import { CTA_COLOR } from '../../actions/types'


class NftCardChoiced extends Component {

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
		const { item, width, subscriptionsInfo, mainTextColor, isDarkmode } = this.props

        //console.log(item)

        let isSubscribed;
        //console.log(isSubscribed);
        if (subscriptionsInfo && subscriptionsInfo.length > 0) {
            isSubscribed = subscriptionsInfo.some(i => i.idnft === item.id)
        }

        const numberOfTotalMedals = item.medals ? this.calcMedals() : 0

		return (
			<div
				className='containerChoice'
			>
                <a
                    href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: 'pointer' }}
                >
    				<img
    					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
    					src={getImageUrl(item.id)}
    					alt={`#${item.id}`}
    				/>
                </a>

				<div style={{ flexDirection: 'column', width, alignItems: 'center' }}>

					<div style={{ width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
						<p style={{ color: mainTextColor, fontSize: 16 }} className="text-bold">
							{item.name}
						</p>

                        {
                            item.level ?
                            <div style={{ alignItems: 'center' }}>
                                <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                    Level
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(item.level, isDarkmode), fontSize: 17 }} className="text-bold">
                                    {item.level}
                                </p>
                            </div>
                            : null
                        }
					</div>

					<div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        {
                            isSubscribed ?
                            <button
                                className='btnSubscribe'
                                style={styles.btnSubscribe}
                                onClick={() => this.props.onChangeSpell()}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Change spell
                                </p>
                            </button>
                            : null
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

export default connect(mapStateToProps)(NftCardChoiced);
