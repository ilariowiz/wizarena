import React, { Component } from 'react'
import { connect } from 'react-redux'
import getRingBonuses from './GetRingBonuses'
import getPendantBonus from './GetPendantBonus'
import getImageUrl from './GetImageUrl'
import '../../css/ItemCard.css'

const logoWiza = require('../../assets/wzlogo_bg_transparent.png')
const placeholder = require('../../assets/ring_placeholder.png')

class EquipmentCard extends Component {
    render() {
        const { item, history, nftWidth, mainTextColor, isDarkmode } = this.props

        //console.log(item);

        let infoEquipment;
        if (item.bonus) {
            if (item.type === "ring") {
                infoEquipment = getRingBonuses(item)
            }
            else if (item.type === "pendant") {
                infoEquipment = getPendantBonus(item)
            }
        }

        return (
            <a
				href={`${window.location.protocol}//${window.location.host}/item/${item.id}`}
				className='containerItem'
                style={{ width: nftWidth, backgroundColor: isDarkmode ? "rgb(242 242 242 / 10%)" : "#f2f2f2" }}
				onClick={(e) => {
					e.preventDefault()
					history.push(`/item/${item.id}`)
				}}
			>
                <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    {
                        item.url ?
                        <img
                            src={item.url}
                            style={{ width: 110, marginBottom: 10 }}
                            alt='equipment'
                        />
                        :
                        <img
                            src={placeholder}
                            style={{ width: 110, marginBottom: 10 }}
                            alt='placeholder'
                        />
                    }
                </div>

                <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10, width: nftWidth }}>
                    #{item.id} {item.name || ""}
                </p>

                <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 15, width: nftWidth }}>
                    {infoEquipment ? infoEquipment.bonusesText.join(", ") : ""}
                </p>

                {
                    item.listed ?
                    <div style={{ alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                        <img
                            src={logoWiza}
                            style={{ width: 32, marginRight: 10 }}
                            alt='logo'
                        />

                        <p style={{ fontSize: 15, color: mainTextColor, marginRight: 5 }} className="text-bold">
                            {item.price}
                        </p>

                        <p style={{ fontSize: 13, color: mainTextColor }}>
                            $WIZA
                        </p>
                    </div>
                    :
                    null
                }

                {
                    item.equipped ?
                    <div style={{ alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                        <p style={{ fontSize: 12, color: '#707070', marginRight: 7 }}>
                            equipped to
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 7 }}>
                            #{item.equippedToId}
                        </p>

                        <img
        					style={{ width: 40, height: 40, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', borderRadius: 4 }}
        					src={getImageUrl(item.equippedToId)}
        					alt={`#${item.equippedToId}`}
        				/>
                    </div>
                    :
                    null
                }

                {
                    !item.listed && !item.equipped &&
                    <div style={{ height: 42 }} />
                }

            </a>
        )
    }
}

const mapStateToProps = (state) => {
	const { mainTextColor, isDarkmode } = state.mainReducer

	return { mainTextColor, isDarkmode }
}

export default connect(mapStateToProps)(EquipmentCard)
