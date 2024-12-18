import React, { Component } from 'react';
import { connect } from 'react-redux'
import Popup from 'reactjs-popup';
import getImageUrl from './GetImageUrl'
import '../../css/NftCardChoice.css'
import ModalStats from './ModalStats'
import { getColorTextBasedOnLevel } from './CalcLevelWizard'
import { CTA_COLOR } from '../../actions/types'
import 'reactjs-popup/dist/index.css';

const vial_hp = require('../../assets/vial_hp.png')
const vial_def = require('../../assets/vial_def.png')
const vial_atk = require('../../assets/vial_atk.png')
const vial_dmg = require('../../assets/vial_dmg.png')
const vial_speed = require('../../assets/vial_speed.png')

class NftCardChoice extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showModalStats: false
        }
    }

    showPotion(potion) {

        let imagePotion;
        let descPotion = ""

        if (potion && potion === "hp") {
			imagePotion = vial_hp
			descPotion = "Vial of HP +8"
		}
		else if (potion && potion === "defense") {
			imagePotion = vial_def
			descPotion = "Vial of Defense +2"
		}
		else if (potion && potion === "attack") {
			imagePotion = vial_atk
			descPotion = "Vial of Attack +2"
		}
		else if (potion && potion === "damage") {
			imagePotion = vial_dmg
			descPotion = "Vial of Damage +4"
		}
		else if (potion && potion === "speed") {
			imagePotion = vial_speed
			descPotion = "Vial of Speed +4"
		}

        return (
            <div style={{ position: 'absolute', right: 5, bottom: 8 }}>
                {
                    potion ?
                    <Popup
                        trigger={open => (
                            <div style={{ alignItems: 'center' }}>
                                <img
                                    src={imagePotion}
                                    style={{ width: 24, height: 28 }}
                                    alt={`Potion Equipped: ${potion ? potion.toUpperCase() : "None"}`}
                                />

                            </div>
                        )}
                        position="top center"
                        on="hover"
                    >
                        <div style={{ padding: 5, fontSize: 16, color: "#1d1d1f" }}>
                            {descPotion}
                        </div>
                    </Popup>
                    : null
                }
            </div>
        )
    }

    renderActionsSection(section, item, canSubscribe, inToSubscribe) {

        if (section === 'tournament') {
            return (
                <div style={{ width: '100%' }}>
                    {
                        canSubscribe && item.level && !inToSubscribe ?
                        <button
                            className='btnSubscribe'
                            style={styles.btnSubscribe}
                            onClick={() => {
                                this.onSubscribe({ name: item.spellSelected.name })
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Select to subscribe
                            </p>
                        </button>
                        :
                        null
                    }

                    {
                        !canSubscribe ?
                        <div
                            style={styles.btnSubscribe}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Registrations closed
                            </p>
                        </div>
                        :
                        null

                    }

                    {
                        inToSubscribe && canSubscribe ?
                        <button
                            className='btnSubscribe'
                            style={styles.btnSubscribe}
                            onClick={() => this.props.removeFromSubscribers(item.id)}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Remove from subscribers
                            </p>
                        </button>
                        : null
                    }
                </div>
            )
        }
        else if (section === 'challenge') {
            return (
                <div style={{ width: '100%' }}>
                    <button
                        className='btnSubscribe'
                        style={styles.btnSubscribe}
                        onClick={() => {
                            this.onSubscribe(item.spellSelected)
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Select
                        </p>
                    </button>
                </div>
            )
        }
        else if (section === "flash" || section === "lords") {
            return (
                <div style={{ width: '100%' }}>
                    <button
                        className='btnSubscribe'
                        style={styles.btnSubscribe}
                        onClick={() => {
                            this.props.onSubscribe(item.id)
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Select
                        </p>
                    </button>
                </div>
            )
        }
    }

    onSubscribe(spellSelected) {
        //console.log(spellSelected);
        this.props.onSubscribe(spellSelected)
    }

	render() {
		const { item, width, canSubscribe, toSubscribe, mainTextColor, isDarkmode, section, potionsEquipped } = this.props

        //console.log(item)

        const inToSubscribe = toSubscribe ? toSubscribe.some(i => i.idnft === item.id) : false

        let potion;
        if (potionsEquipped && potionsEquipped.length > 0) {
            potion = potionsEquipped.find(i => i.idnft === item.id)
            //console.log(potion);
        }

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

				<div style={{ flexDirection: 'column', width, alignItems: 'center', position: 'relative' }}>

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

                    <button
                        style={{ marginBottom: 10, width: 100, height: 23, alignItems: 'center', borderRadius: 4, borderColor: CTA_COLOR, borderWidth: 1, borderStyle: 'solid' }}
                        onClick={() => this.setState({ showModalStats: true })}
                    >
                        <p style={{ fontSize: 14, color: mainTextColor }} className="text-regular">
                            see stats
                        </p>
                    </button>

                    {
                        potion &&
                        this.showPotion(potion.potionEquipped)
                    }

                    {this.renderActionsSection(section, item, canSubscribe, inToSubscribe)}

				</div>

                {
                    this.state.showModalStats ?
                    <ModalStats
                        item={item}
                        showModal={this.state.showModalStats}
                        onCloseModal={() => this.setState({ showModalStats: false })}
                    />
                    : undefined
                }

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

export default connect(mapStateToProps)(NftCardChoice);
