import React, { Component } from 'react'
import getRingBonuses from './GetRingBonuses'
import '../../css/ItemCard.css'


class EquipmentCardForge extends Component {
    render() {
        const { item } = this.props

        //console.log(item);

        const infoEquipment = getRingBonuses(item)

        return (
            <button
				className='containerItem'
				onClick={() => this.props.onSelectRing()}
			>
                <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={item.url}
                        style={{ width: 110, marginBottom: 10 }}
                        alt="Equipment"
                    />
                </div>

                <p style={{ fontSize: 19, color: 'white', marginBottom: 10, maxWidth: 180 }}>
                    #{item.id} {item.name}
                </p>

                <p style={{ fontSize: 18, color: 'white', marginBottom: 15, maxWidth: 180 }}>
                    {infoEquipment.bonusesText.join(", ")}
                </p>

            </button>
        )
    }
}

export default EquipmentCardForge
