import React, { Component } from 'react';
import ConnectionWidget from './ConnectionWidget'
import { IoClose } from 'react-icons/io5'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalSpellbook extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selected: this.props.stats.stats.spellSelected
        }
    }

    renderSpell(item, index, width) {
        const { stats } = this.props.stats

        let isSelected = this.state.selected.name === item.name

        const btnBg = isSelected ? { backgroundColor: CTA_COLOR } : {}

        const atkBase = stats.attacco
        const dmgBase = stats.danno

        let atkFinal = atkBase + item.atkBase
        let dmgFinal = dmgBase + item.dmgBase

        let textPerk = ""
        if (item.condition.name) {
            if (item.condition.effect.includes("malus")) {
                const info = item.condition.effect.split("_")

                textPerk = `${item.condition.pct}% to inflict -${info[1]} ${info[2].toUpperCase()}`
            }
            else {
                textPerk = `${item.condition.pct}% that the opponent skip the turn`
            }
        }

        return (
            <div style={{ width, justifyContent: 'flex-start', alignItems: 'center', marginBottom: 20 }} key={index}>
                <button
                    style={Object.assign({}, styles.btnSelect, btnBg)}
                    onClick={() => this.setState({ selected: item })}
                />

                <div style={{ flexDirection: 'column', justifyContent: 'center', width: '100%' }}>

                    <div style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                            <p style={{ color: '#c2c0c0', fontSize: 17, marginRight: 10 }}>
                                NAME
                            </p>
                            <p style={{  color: 'white', fontSize: 17 }}>
                                {item.name}
                            </p>
                        </div>

                        <div style={{ justifyContent: 'flex-end' }}>
                            <p style={{ color: '#c2c0c0', fontSize: 17, marginRight: 10 }}>
                                ATTACK
                            </p>
                            <p style={{  color: 'white', fontSize: 17, marginRight: 15 }}>
                                {atkFinal}
                            </p>

                            <p style={{ color: '#c2c0c0', fontSize: 17, marginRight: 10 }}>
                                DAMAGE
                            </p>
                            <p style={{  color: 'white', fontSize: 17 }}>
                                {dmgFinal}
                            </p>
                        </div>

                    </div>

                    <div style={{ justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#c2c0c0', fontSize: 17, marginRight: 10 }}>
                                PERK
                            </p>
                            <p style={{  color: 'white', fontSize: 17 }}>
                                {item.condition.name || "-"}
                            </p>
                        </div>

                        {
                            item.condition.name ?
                            <div style={{ justifyContent: 'flex-end' }}>
                                <p style={{ color: 'white', fontSize: 15 }}>
                                    {textPerk}
                                </p>
                            </div>
                            : null
                        }

                    </div>

                </div>
            </div>
        )
    }

	render() {
		const { showModal, onCloseModal, width, stats } = this.props;

        //console.log(stats);

        let spellbook = stats.stats.spellbook

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        const innerW = width * 90 / 100

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

                    <p style={{ fontSize: 20, color: 'white', marginTop: 30, marginBottom: 15 }}>
                        SPELLBOOK
                    </p>

                    <p style={{ fontSize: 18, color: 'white', marginBottom: 30 }}>
                        Your wizard {stats.name} has {spellbook.length} {spellbook.length === 1 ? 'spell' : 'spells'}
                    </p>

					{spellbook.map((item, index) => {
                        return this.renderSpell(item, index, innerW)
                    })}

                    <button
                        style={styles.btnSub}
                        onClick={() => this.props.onSub(this.state.selected)}
                    >
                        <p style={{ color: 'white', fontSize: 17 }}>
                            SUBSCRIBE
                        </p>
                    </button>

					<button
						style={{ position: 'absolute', right: 15, top: 15 }}
						onClick={onCloseModal}
					>
						<IoClose
							color='white'
							size={25}
						/>
					</button>

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		minHeight: 300,
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderStyle: 'solid',
		borderWidth: 2,
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative'
	},
    btnSelect: {
        width: 35,
        height: 32,
        borderRadius: 16,
        borderColor: CTA_COLOR,
        borderStyle: 'solid',
        borderWidth: 2,
        marginRight: 15,
    },
    btnSub: {
		height: 50,
        width: 220,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
        marginTop: 40,
        marginBottom: 30
    },
}

export default ModalSpellbook;
