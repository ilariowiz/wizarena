import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import allSpells from './Spells'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalSwapSpell extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selected: this.props.stats.spellSelected
        }
    }

    renderSpell(item, index, width) {
        const { stats, mainTextColor } = this.props

        const spell = allSpells.find(i => i.name === item.name)

        let isSelected = this.state.selected.name === spell.name

        const btnBg = isSelected ? { backgroundColor: CTA_COLOR } : {}

        const atkBase = stats.attack.int
        const dmgBase = stats.damage.int

        let atkFinal = atkBase + spell.atkBase
        let dmgFinal = dmgBase + spell.dmgBase

        let textPerk = ""
        if (spell.condition.name) {
            if (spell.condition.effect.includes("malus")) {
                const info = spell.condition.effect.split("_")

                textPerk = `${spell.condition.pct}% to inflict -${info[1]} ${info[2].toUpperCase()}`
            }
            else {
                textPerk = `${spell.condition.pct}% that the opponent skip the turn`
            }
        }

        return (
            <div style={{ width, justifyContent: 'flex-start', alignItems: 'center', marginBottom: 20 }} key={index}>
                <button
                    style={Object.assign({}, styles.btnSelect, btnBg)}
                    onClick={() => this.setState({ selected: spell })}
                />

                <div style={{ flexDirection: 'column', justifyContent: 'center', width: width - 50 }}>

                    <div style={{ justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap' }}>
                        <div style={{ marginBottom: 5 }}>
                            <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                Name
                            </p>
                            <p style={{  color: mainTextColor, fontSize: 17 }} className="text-medium">
                                {spell.name}
                            </p>
                        </div>

                        <div style={{ justifyContent: 'flex-end' }}>
                            <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                Attack
                            </p>
                            <p style={{  color: mainTextColor, fontSize: 17, marginRight: 15 }} className="text-medium">
                                {atkFinal}
                            </p>

                            <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                Damage
                            </p>
                            <p style={{ color: mainTextColor, fontSize: 17 }} className="text-medium">
                                {dmgFinal}
                            </p>
                        </div>

                    </div>

                    <div style={{ justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                Perk
                            </p>
                            <p style={{ color: mainTextColor, fontSize: 17, marginRight: 10, whiteSpace: 'nowrap' }} className="text-medium">
                                {spell.condition.name || "-"}
                            </p>
                        </div>

                        {
                            spell.condition.name ?
                            <div style={{ justifyContent: 'flex-end' }}>
                                <p style={{ color: mainTextColor, fontSize: 14 }}>
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
		const { showModal, onCloseModal, width, stats, mainTextColor } = this.props;

        let spellbook = stats.spellbook

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        const innerW = width * 90 / 100

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

                    <p style={{ fontSize: 18, color: mainTextColor, marginTop: 30, marginBottom: 15 }} className="text-medium">
                        SPELLBOOK
                    </p>

                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 30 }}>
                        Choose the spell you want to swap
                    </p>

					{spellbook.map((item, index) => {
                        return this.renderSpell(item, index, innerW)
                    })}

                    <button
                        style={styles.btnSub}
                        onClick={() => this.props.onSwap(this.state.selected)}
                    >
                        <p style={{ color: 'white', fontSize: 15 }} className="text-medium">
                            Swap
                        </p>
                    </button>

					<button
						style={{ position: 'absolute', right: 15, top: 15 }}
						onClick={onCloseModal}
					>
						<IoClose
							color={mainTextColor}
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
		backgroundColor: "white",
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative'
	},
    btnSelect: {
        minWidth: 35,
        width: 35,
        height: 32,
        minHeight: 32,
        borderRadius: 16,
        borderColor: CTA_COLOR,
        borderStyle: 'solid',
        borderWidth: 2,
        marginRight: 15,
    },
    btnSub: {
		height: 40,
        width: 220,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
        marginTop: 40,
        marginBottom: 30
    },
}

const mapStateToProps = (state) => {
    const { mainTextColor } = state.mainReducer

    return { mainTextColor }
}

export default connect(mapStateToProps)(ModalSwapSpell);
