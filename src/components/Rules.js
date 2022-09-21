import React, { Component } from 'react'
import Media from 'react-media';
import Header from './Header'
import { BACKGROUND_COLOR } from '../actions/types'

class Rules extends Component {
    componentDidMount() {
		document.title = "Rules - Wizards Arena"
	}

    renderBody(isMobile) {
        const boxW = Math.floor(window.innerWidth * (isMobile ? 85 : 70) / 100)

        return (
            <div style={{ width: boxW, alignItems: 'center', flexDirection: 'column', paddingTop: 30 }}>
                <p style={{ fontSize: 28, color: 'white', marginBottom: 30 }}>
                    Rules
                </p>

                <div style={{ width: '100%', flexDirection: 'column' }}>
                    <p style={{ fontSize: 18, color: 'white', lineHeight: 1.2, marginBottom: 10 }}>
                        Welcome to Wizards Arena! In this article we will explain the mechanism of this experimental project.<br /><br />
                    </p>

                    <p style={{ fontSize: 21, color: 'white', lineHeight: 1.2, marginBottom: 15 }}>
                        WIZARD
                    </p>

                    <p style={{ fontSize: 18, color: 'white', lineHeight: 1.2 }}>
                    Each wizard is an NFT with an unique combination of traits, and it's also a mighty fighter in the Arena!<br /><br />
                    Each wizard has this 9 stats: HP, Defense, Element, Spell, Attack, Damage, Spellbook, Resistance, and Weakness. Let's analyze them quickly:<br /><br />
                    - HP. How much damage your wizard will be able to absorb before losing the battle<br /><br />
                    - Defense. Your dodging bonus to avoid the opponent's wizard spell, opposed by his Attack (and some bonuses or penalties)<br /><br />
                    - Element. Each spell has its own element, it serves to determine what kind of shots your wizard has<br /><br />
                    - Spell. Shots available to your wizard, each spell has different attack and damage bonuses and can inflict penalties on your opponent. Your wizard can only use one spell per tournament.<br /><br />
                    - Attack. Your bonus to hit the opponent wizard with your spell, opposed by his Defense (and some bonuses or penalties)<br /><br />
                    - Damage. The points subtracted from your opponent's HP after the hit<br /><br />
                    - Spellbook. By playing tournament your wizard will gain enough experience to learn new spells to keep in the Spellbook.<br /><br />
                    - Resistance. You can halve the damage you suffer from an element, with the right Resistance!<br /><br />
                    - Weakness. You can double the damage your opponent suffer from your spells if you choose the right element. But be careful, You have a Weakness too!<br/><br />
                    Each of these stats derives from its traits, we are not going to tell you how the algorithm behind stats creation works, but for istance we can tell you that Devil Skin gives much more HP than Lich Skin, but way less Attack!
                    </p>

                    <p style={{ fontSize: 21, color: 'white', lineHeight: 1.2, marginTop: 20, marginBottom: 15 }}>
                        TOURNAMENT
                    </p>

                    <p style={{ fontSize: 18, color: 'white', lineHeight: 1.2, marginBottom: 10 }}>
                        There is going to be a tournament every week or two, participation is optional but it's the only way to win KDA and improve your wizard.<br /><br />
                        The tournament is simple, you pay the registration in KDA, you choose the spell with which you want to face your opponents and the algorithm will do the rest.<br /><br />
                        The tournament is divided into a predetermined number of rounds, each round will grant a medal for the winner (this information will always visible on the NFT page).
                        At the end of the tournament rounds the wizard with more medals from that tournament will win the grand prize! (in the event of a tie, the prize will be divided equally)<br /><br />
                        Participation will grant a new random spell to all the wizards involved.<br /><br />
                        What does the algorithm do? After signing up for the tournament, the algorithm matches the participating wizards randomly, and then, based on their stats and some nice calculations, the fight takes place.<br /><br />
                        When all the fights are over, it awards medals to the winning wizards, and then waits for the next round.<br /><br /><br />
                    </p>
                </div>
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='home'
					section={5}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={styles.container}>
				<Media
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
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
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
}

export default Rules
