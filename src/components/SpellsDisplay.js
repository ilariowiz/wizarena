import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import Popup from 'reactjs-popup';
import getBoxWidth from './common/GetBoxW'
import allSpells from './common/Spells'
import conditions from './common/Conditions'
import { TEXT_SECONDARY_COLOR } from '../actions/types'


class SpellsDisplay extends Component {
    constructor(props) {
        super(props)

        this.state = {
            spells: {}
        }
    }

    componentDidMount() {
		document.title = "Spells - Wizards Arena"

        this.loadSpells()
	}

    loadSpells() {
        //console.log(titles);

        let spells = {}

        for (var i = 0; i < allSpells.length; i++) {
            const spell = allSpells[i]

            if (spells[spell.element]) {
                spells[spell.element].push(spell)
            }
            else {
                spells[spell.element] = []
                spells[spell.element].push(spell)
            }
        }

        console.log(spells);
        this.setState({ spells })
    }

    renderTitle(item, index) {
        const { mainTextColor } = this.props

        return (
            <div style={{ alignItems: 'center', flexDirection: 'column', height: 'fit-content', maxWidth: 70, padding: 3, marginRight: 4, marginBottom: 4, borderWidth: 1, borderColor: mainTextColor, borderStyle: 'solid', borderRadius: 4 }} key={index}>
                <img
                    style={{ width: 30, height: 30 }}
                    src={item.img}
                    alt="Cup"
                />

                <p style={{ fontSize: 12, color: item.textColor, textAlign: 'center' }}>
                    {item.title}
                </p>
            </div>
        )
    }

    refactorCondition(condition) {
        if (condition.effect === "skip") {
            return `- Skip turn - Chance ${condition.pct}%`
        }
        else {
            const effects = condition.effect.split("_")
            const stat = effects[2]
            let statText;
            if (stat === "def") {
                statText = "Defense"
            }
            else if (stat === "dmg") {
                statText = "Damage"
            }
            else if (stat === "atk") {
                statText = "Attack"
            }

            return `- Malus ${effects[1]} ${statText} - Chance ${condition.pct}%`
        }

        return ""
    }

    renderSpell(item, index) {
		const { mainTextColor } = this.props
		const marginRight = 16

		let condDesc;
		if (item.condition && item.condition.name) {
			let condInfo = conditions.find(i => i.name === item.condition.name)
			if (condInfo) {
				condDesc = `${condInfo.effect} - Chance of success: ${item.condition.pct}%`
			}
		}

		let spellAtk = item.atkBase
		let spellDmg = item.dmgBase

		return (
			<div key={index} style={{ alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
				<p style={{ color: '#707070', fontSize: 16, marginRight: 5, marginBottom: 1 }}>
					Name
				</p>
				<p style={{ color: mainTextColor, fontSize: 18, marginRight }}>
					{item.name}
				</p>
				<p style={{ color: '#707070', fontSize: 16, marginRight: 7, marginBottom: 1 }}>
					Perk
				</p>

				{
					item.condition && item.condition.name ?
					<Popup
						trigger={open => (
							<button style={{ color: mainTextColor, fontSize: 17, marginRight }}>
								{item.condition.name} {this.refactorCondition(item.condition)}
							</button>
						)}
						position="top center"
						on="hover"
					>
						<div style={{ padding: 10, fontSize: 16 }}>
							{condDesc}
						</div>
					</Popup>
					:
					<p style={{ color: mainTextColor, fontSize: 17, marginRight }}>
						-
					</p>
				}

				<p style={{ color: '#707070', fontSize: 15, marginRight: 5, marginBottom: 1 }}>
					Attack
				</p>
				<p style={{ color: mainTextColor, fontSize: 17, marginRight }}>
					{spellAtk}
				</p>

				<p style={{ color: '#707070', fontSize: 15, marginRight: 5, marginBottom: 1 }}>
					Damage
				</p>
				<p style={{ color: mainTextColor, fontSize: 17 }}>
					{spellDmg}
				</p>

			</div>
		)
	}

    renderSpellHeader(key, index) {
        const { spells } = this.state
        const { mainTextColor } = this.props

        console.log(key);

        const spellsOfElement = spells[key]

        return (
            <div style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 24, color: mainTextColor, marginBottom: 20, marginTop: 20 }} className="text-bold">
                    {key}
                </p>

                {
                    spellsOfElement.map((item, index) => {
                        return this.renderSpell(item, index)
                    })
                }
            </div>
        )
    }

    renderBody(isMobile) {
        const { spells } = this.state
        const { mainTextColor, mainBackgroundColor } = this.props

        const { boxW, padding } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', textAlign: 'center', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 26, marginBottom: 20 }} className="text-bold">
                    Spells
                </p>

                <div style={{ width: '100%', flexWrap: 'wrap', flexDirection: 'column' }}>
                    {Object.keys(spells).map((key, index) => {
                        return this.renderSpellHeader(key, index)
                    })}
                </div>
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
				<Header
					page='home'
					section={16}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
				<Media
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
					render={() => this.renderTopHeader(false)}
				/>

				<Media
					query="(max-width: 767px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderBody(false)}
				/>
			</div>
		)
	}
}

const styles = {
    container: {
		flexDirection: 'column',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
}

const mapStateToProps = (state) => {
    const { mainTextColor, mainBackgroundColor } = state.mainReducer

    return { mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps)(SpellsDisplay)
