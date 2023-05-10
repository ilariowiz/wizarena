import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import '../../css/NftCardChoice.css'
import cardStats from './CardStats'
import getRingBonuses from './GetRingBonuses'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
import { CTA_COLOR } from '../../actions/types'


class NftCardChoiceFlashT extends Component {
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

	render() {
		const { item, width, mainTextColor } = this.props

        const level = calcLevelWizard(item)

        const ring = this.getRingEquipped()
		let infoEquipment;
		if (ring) {
			infoEquipment = getRingBonuses(ring)
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
						<p style={{ color: mainTextColor, fontSize: 15 }} className="text-bold">
							{item.name}
						</p>
					</div>

					<div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        {
                            level ?
                            <div style={{ width: '90%', alignItems: 'center', marginBottom: 8 }}>
                                <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                    Level
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(level), fontSize: 17 }} className="text-bold">
                                    {level}
                                </p>
                            </div>
                            : null
                        }

                        {
                            item.hp ?
                            cardStats(item, undefined, undefined, infoEquipment ? infoEquipment.bonusesDict : undefined, mainTextColor)
                            :
                            null
                        }


                        <button
                            className='btnSubscribe'
                            style={styles.btnSubscribe}
                            onClick={() => {
                                this.props.onSelect(item.id)
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Select
                            </p>
                        </button>

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
    const { mainTextColor } = state.mainReducer

    return { mainTextColor }
}

export default connect(mapStateToProps)(NftCardChoiceFlashT)
