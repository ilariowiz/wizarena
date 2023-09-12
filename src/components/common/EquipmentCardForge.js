import React, { Component } from 'react'
import { connect } from 'react-redux'
import getRingBonuses from './GetRingBonuses'
import getPendantBonus from './GetPendantBonus'
import '../../css/ItemCard.css'

const placeholderPendant = require('../../assets/pendant_placeholder.png')

class EquipmentCardForge extends Component {
    render() {
        const { item, mainTextColor } = this.props

        //console.log(item);

        let infoEquipment;

        if (item.type === "ring") {
            infoEquipment = getRingBonuses(item)
        }
        else if (item.type === "pendant" && item.bonus) {
            infoEquipment = getPendantBonus(item)
        }

        return (
            <button
				className='containerItem'
				onClick={() => this.props.onSelectRing()}
			>
                <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={item.url || placeholderPendant}
                        style={{ width: 90, marginBottom: 10 }}
                        alt="Equipment"
                    />
                </div>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 10, maxWidth: 180 }}>
                    #{item.id} {item.name || ""}
                </p>

                {
                    infoEquipment &&
                    <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 15, maxWidth: 180 }}>
                        {infoEquipment.bonusesText.join(", ")}
                    </p>
                }

            </button>
        )
    }
}

const mapStateToProps = (state) => {
    const { mainTextColor } = state.mainReducer

    return { mainTextColor }
}

export default connect(mapStateToProps)(EquipmentCardForge)
