import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoMedalOutline } from 'react-icons/io5'
import getImageUrl from './GetImageUrl'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
import '../../css/NftCard.css'

const vial_hp = require('../../assets/vial_hp.png')
const vial_def = require('../../assets/vial_def.png')
const vial_atk = require('../../assets/vial_atk.png')
const vial_dmg = require('../../assets/vial_dmg.png')
const vial_empty = require('../../assets/vial_empty.png')


class NftCardTournament extends Component {

	getPotionEquipped() {
		const { tournamentName, potionsEquipped, item } = this.props

		if (!potionsEquipped || potionsEquipped.length === 0) {
			return ""
		}

		const key = `${tournamentName}_${item.id}`
		const potion = potionsEquipped.find(i => i.key === key)

		return potion.potionEquipped
	}

	render() {
		const { item, history, width, account } = this.props

		//console.log(item);

		let totalMedals = 0
		if (Object.keys(item.medals).length > 0) {
			const arrayValueMedals = Object.values(item.medals)
			arrayValueMedals.map(i => totalMedals = totalMedals + parseInt(i))
		}

		//console.log(totalMedals);

		let isMine = false
		if (account.account && account.account === item.owner) {
			isMine = true
		}

		const level = calcLevelWizard(item)

		const potion = this.getPotionEquipped()

		let imagePotion = vial_empty

		if (potion && potion === "hp") {
			imagePotion = vial_hp
		}
		else if (potion && potion === "defense") {
			imagePotion = vial_def
		}
		else if (potion && potion === "attack") {
			imagePotion = vial_atk
		}
		else if (potion && potion === "damage") {
			imagePotion = vial_dmg
		}

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
				className='container'
				style={{ borderColor: isMine ? "gold" : "white" }}
				onClick={(e) => {
					e.preventDefault()
					history.push(`/nft/${item.id}`)
				}}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 65, alignItems: 'center' }}>

					<div style={{ width: '100%', flexDirection: 'column', justifyContent: 'space-between', marginTop: 5 }}>
						<p style={{ color: isMine ? "gold" : "white", fontSize: 19, marginLeft: 10, lineHeight: 1 }}>
							{item.name}
						</p>

						<div style={{ alignItems: 'center', marginLeft: 10 }}>
							<p style={{ color: "#c2c0c0", fontSize: 15, marginRight: 10 }}>
								LEVEL
							</p>

							<p style={{ color: getColorTextBasedOnLevel(level), fontSize: 18 }}>
								{level}
							</p>
						</div>
					</div>

					<div style={{ width: '100%', flexDirection: 'column', justifyContent: 'space-between', marginTop: 5, marginRight: 10 }}>
						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 }}>
							<IoMedalOutline
								color={isMine ? "gold" : "white"}
								size={20}
								style={{ marginRight: 8 }}
							/>

							<p style={{ color: isMine ? "gold" : "white", fontSize: 18, lineHeight: 1 }}>
								{totalMedals}
							</p>
						</div>

						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', height: 28 }}>
							<img
	                            src={imagePotion}
	                            style={{ width: 24, height: 28 }}
	                            alt={`Potion Equipped: ${potion ? potion.toUpperCase() : "None"}`}
	                        />
							<p style={{ color: 'white', fontSize: 14, lineHeight: 1, marginTop: 2 }}>
								VIAL
							</p>
						</div>

					</div>

				</div>
			</a>
		)
	}
}

const mapStateToProps = (state) => {
	const { account } = state.mainReducer

	return { account }
}

export default connect(mapStateToProps)(NftCardTournament);
