import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import '../../css/NftCardChoice.css'
import cardStats from './CardStats'
import getRingBonuses from './GetRingBonuses'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
import ModalSpellbook from './ModalSpellbook'
import { CTA_COLOR } from '../../actions/types'


class NftCardChoice extends Component {
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
		const { item, width, canSubscribe, toSubscribe, subscriptionsInfo, mainTextColor } = this.props

        //console.log(subscriptionsInfo)

        let isSubscribed;
        //console.log(isSubscribed);
        if (subscriptionsInfo && subscriptionsInfo.length > 0) {
            isSubscribed = subscriptionsInfo.some(i => i.idnft === item.id)
        }

        const numberOfTotalMedals = item.medals ? this.calcMedals() : 0

        const level = calcLevelWizard(item)

        const inToSubscribe = toSubscribe.some(i => i.idnft === item.id)

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
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
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
                                <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                    Level
                                </p>
                                <p style={{ color: mainTextColor, fontSize: 17 }} className="text-bold">
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
                            !isSubscribed && canSubscribe && level && !inToSubscribe ?
                            <button
                                className='btnSubscribe'
                                style={styles.btnSubscribe}
                                onClick={() => this.setState({ showModalSpellbook: true })}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Select to subscribe
                                </p>
                            </button>
                            :
                            null
                        }

                        {
                            !isSubscribed && !canSubscribe ?
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

                        {
                            inToSubscribe && !isSubscribed && canSubscribe ?
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
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor }
}

export default connect(mapStateToProps)(NftCardChoice);
