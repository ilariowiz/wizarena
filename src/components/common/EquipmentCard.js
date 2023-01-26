import React, { Component } from 'react'
import getRingBonuses from './GetRingBonuses'
import '../../css/ItemCard.css'
//const logoWiza = require('../../assets/wiz_logo_centrale.png')

class EquipmentCard extends Component {
    render() {
        const { item, history } = this.props

        const infoEquipment = getRingBonuses(item)

        return (
            <a
				href={`${window.location.protocol}//${window.location.host}/item/${item.id}`}
				className='containerItem'
				onClick={(e) => {
					e.preventDefault()
					history.push(`/item/${item.id}`)
				}}
			>
                <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={item.url}
                        //src="https://storage.googleapis.com/wizarena/equipment/ring_atk_1.png"
                        style={{ width: 110, marginBottom: 10 }}
                    />
                </div>

                <p style={{ fontSize: 19, color: 'white', marginBottom: 10, maxWidth: 180 }}>
                    #{item.id} {item.name}
                </p>

                <p style={{ fontSize: 18, color: 'white', marginBottom: 15, maxWidth: 180 }}>
                    {infoEquipment.bonusesText.join(", ")}
                </p>

                {
                    item.listed ?
                    <div style={{ alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                        <p style={{ fontSize: 14, color: "#c2c0c0", marginRight: 10 }}>
                            PRICE
                        </p>

                        <p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
                            {item.price}
                        </p>

                        <p style={{ fontSize: 16, color: 'white' }}>
                            $WIZA
                        </p>
                    </div>
                    :
                    <div style={{ height: 10 }} />
                }

            </a>
        )
    }
}

export default EquipmentCard
