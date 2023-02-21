import React, { Component } from 'react'
import getRingBonuses from './GetRingBonuses'
import getImageUrl from './GetImageUrl'
import '../../css/ItemCard.css'

const logoWiza = require('../../assets/wzlogo_bg_transparent.png')

class EquipmentCard extends Component {
    render() {
        const { item, history } = this.props

        //console.log(item);

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
                        style={{ width: 110, marginBottom: 10 }}
                        alt='equipment'
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
                        <img
                            src={logoWiza}
                            style={{ width: 34, marginRight: 10 }}
                            alt='logo'
                        />

                        <p style={{ fontSize: 18, color: 'white', marginRight: 7 }}>
                            {item.price}
                        </p>

                        <p style={{ fontSize: 16, color: 'white' }}>
                            $WIZA
                        </p>
                    </div>
                    :
                    null
                }

                {
                    item.equipped ?
                    <div style={{ alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                        <p style={{ fontSize: 13, color: '#c2c0c0', marginRight: 7 }}>
                            equipped to
                        </p>

                        <p style={{ fontSize: 15, color: 'white', marginRight: 7 }}>
                            #{item.equippedToId}
                        </p>

                        <img
        					style={{ width: 40, height: 40, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', borderRadius: 2 }}
        					src={getImageUrl(item.equippedToId)}
        					alt={`#${item.equippedToId}`}
        				/>
                    </div>
                    :
                    null
                }

            </a>
        )
    }
}

export default EquipmentCard
