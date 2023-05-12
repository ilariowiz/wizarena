import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import '../../css/NftCardChoice.css'
import cardStats from './CardStats'
import getRingBonuses from './GetRingBonuses'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
import ModalSpellbook from './ModalSpellbook'
import { CTA_COLOR } from '../../actions/types'


class NftCardChoiceDuel extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showModalSpellbook: false
        }
    }

    calcMedals() {
        const { item } = this.props

        const medals = item.medals

        let tot = 0

        Object.keys(medals).forEach(i => {
            tot += parseInt(medals[i])
        })

        return tot
    }

    getRingEquipped() {
		const { equipment, item } = this.props

		if (!equipment || equipment.length === 0) {
			return ""
		}

		const ring = equipment.find(i => i.equippedToId === item.id)

		//console.log(ring);

		if (ring && ring.equipped) {
			return ring
		}
		//console.log(ring);

		return ""
	}

    onSubscribe(spellSelected) {
        this.props.onSubscribe(spellSelected)
    }

	render() {
		const { item, width, subscriptionsInfo, mainTextColor, isDarkmode } = this.props

        //console.log(item);

        let isSubscribed;
        if (subscriptionsInfo && subscriptionsInfo.id) {
            isSubscribed = subscriptionsInfo.id === item.id
        }

        const numberOfTotalMedals = item.medals ? this.calcMedals() : 0

        const level = calcLevelWizard(item)

        const ring = this.getRingEquipped()
		let infoEquipment;
		if (ring) {
			infoEquipment = getRingBonuses(ring)
            //console.log(infoEquipment);
		}

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
						<p style={{ color: mainTextColor, fontSize: 16 }} className="text-bold">
							{item.name}
						</p>
					</div>

					<div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        {
                            level ?
                            <div style={{ width: '90%', alignItems: 'center', marginBottom: 8 }}>
                                <p style={{ color: mainTextColor, fontSize: 15, marginRight: 10 }}>
                                    Level
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(level, isDarkmode), fontSize: 17 }} className="text-bold">
                                    {level}
                                </p>
                            </div>
                            : null
                        }

                        {
                            item.hp ?
                            cardStats(item, numberOfTotalMedals, undefined, infoEquipment ? infoEquipment.bonusesDict : undefined, mainTextColor)
                            :
                            null
                        }

                        {
                            isSubscribed ?
                            <div
                                className='btnSubscribe'
                                style={Object.assign({}, styles.btnSubscribe, { backgroundColor: '#014766'})}
                            >
                                <p style={{ fontSize: 15, color: 'white' }}>
                                    Selected
                                </p>
                            </div>
                            :
                            <button
                                className='btnSubscribe'
                                style={styles.btnSubscribe}
                                onClick={() => this.onSubscribe(item.spellSelected)}
                            >
                                <p style={{ fontSize: 15, color: 'white' }}>
                                    Select
                                </p>
                            </button>
                        }


                    </div>

				</div>

                {
                    this.state.showModalSpellbook &&
                    <ModalSpellbook
                        showModal={this.state.showModalSpellbook}
                        onCloseModal={() => this.setState({ showModalSpellbook: false })}
                        width={this.props.modalWidth}
                        stats={item}
                        onSub={(spellSelected) => {
                            this.onSubscribe(spellSelected)
                            this.setState({ showModalSpellbook: false })
                        }}
                    />
                }

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

export default connect(mapStateToProps)(NftCardChoiceDuel);
